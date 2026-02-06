import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FantasyPlayersStatsQueryDto, FantasyTeamsPirAllowedQueryDto } from './dto';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class FantasyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly teamsService: TeamsService,
  ) {}

  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }

  async getPlayersStats(
    seasonCode: string,
    query: FantasyPlayersStatsQueryDto,
  ): Promise<any[]> {
    const seasonId = this.mapSeasonCodeToSeasonId(seasonCode);
    const defaultDates = this.getDefaultSeasonDateRange(seasonCode);
    const params: Record<string, string | number | string[]> = {
      season_id: seasonId,
      mode: 'nba',
      stats_type: 'avg',
    };
    params.date_from = query.dateFrom ?? defaultDates.from;
    params.date_to = query.dateTo ?? defaultDates.to;
    if (query.weeks && query.weeks.length > 0) {
      params['weeks[]'] = query.weeks.map((w) => w.toString());
    }

    const response = await firstValueFrom(
      this.httpService.get('https://www.dunkest.com/api/stats/table', { params }),
    );
    const players = Array.isArray(response.data) ? response.data : [];
    const { byTeamNameList, byName, byTeamLastName } = await this.getEuroleaguePlayersIndex(seasonCode);

    return players.map((player: any) => {
      const teamCode = String(player?.team_code ?? '').toUpperCase();
      const fullName = `${player?.first_name ?? ''} ${player?.last_name ?? ''}`.trim();
      const reversedName = `${player?.last_name ?? ''} ${player?.first_name ?? ''}`.trim();
      const nameKey = this.normalizeName(fullName);
      const reversedKey = this.normalizeName(reversedName);
      const lastNameKey = this.normalizeName(player?.last_name ?? '');
      const match =
        this.pickBestContainsMatchByTeam(byTeamNameList, teamCode, nameKey) ||
        this.pickBestContainsMatchByTeam(byTeamNameList, teamCode, reversedKey) ||
        this.pickBestContainsMatch(byTeamLastName, teamCode, lastNameKey) ||
        this.pickBestDistanceMatchByTeamLastName(byTeamLastName, teamCode, lastNameKey) ||
        this.pickUniqueMatch(byName.get(nameKey)) ||
        this.pickUniqueMatch(byName.get(reversedKey)) ||
        this.pickBestDistanceMatchByTeam(byTeamNameList, teamCode, nameKey) ||
        this.pickBestDistanceMatch(byName, nameKey) ||
        this.pickBestDistanceMatch(byName, reversedKey);
      if (!match) return player;
      return {
        ...player,
        playerCode: match.playerCode,
        imageUrl: match.imageUrl ?? match.headshotImageUrl ?? match.actionImageUrl ?? null,
      };
    });
  }

  async getTeamsPirAllowed(
    seasonCode: string,
    query: FantasyTeamsPirAllowedQueryDto,
  ): Promise<any[]> {
    const seasonId = this.mapSeasonCodeToSeasonId(seasonCode);
    const params: Record<string, string | number> = {
      season_id: seasonId,
      stats_id: query.statsId ?? 25,
      position_id: query.positionId ?? 1,
    };

    const response = await firstValueFrom(
      this.httpService.get('https://www.dunkest.com/api/stats/defense-vs-position', {
        params,
      }),
    );
    const teams = Array.isArray(response.data) ? response.data : [];
    const clubIndex = await this.getClubIndex(seasonCode);

    return teams.map((team: any) => {
      const club = clubIndex.get(this.normalizeName(team?.name ?? ''));
      if (!club) {
        return team;
      }
      return {
        ...team,
        id: club.code ?? club.clubCode ?? team.id,
        name: club.name ?? club.clubName ?? team.name,
      };
    });
  }

  private mapSeasonCodeToSeasonId(seasonCode: string): number {
    const endYear = Number(seasonCode.replace('E', ''));
    if (Number.isNaN(endYear)) {
      return 0;
    }
    // Draft mapping rule: Dunkest season_id = endYear - 2002 (E2025 -> 23)
    return endYear - 2002;
  }

  private getDefaultSeasonDateRange(seasonCode: string): { from: string; to: string } {
    const endYear = Number(seasonCode.replace('E', ''));
    if (Number.isNaN(endYear)) {
      return { from: '1970-01-01', to: '1970-01-02' };
    }
    return {
      from: `${endYear}-09-15`,
      to: `${endYear + 1}-06-15`,
    };
  }

  private async getClubIndex(seasonCode: string): Promise<Map<string, any>> {
    const clubsResponse = await this.teamsService.getSeasonTeams(seasonCode);
    const clubsList =
      (Array.isArray(clubsResponse) && clubsResponse) ||
      clubsResponse?.data ||
      clubsResponse?.items ||
      clubsResponse?.clubs ||
      [];

    const index = new Map<string, any>();
    if (Array.isArray(clubsList)) {
      clubsList.forEach((club: any) => {
        const name = club?.name ?? club?.clubName ?? club?.displayName ?? '';
        const key = this.normalizeName(name);
        if (key) {
          index.set(key, club);
        }
      });
    }
    return index;
  }

  private async getEuroleaguePlayersIndex(
    seasonCode: string,
  ): Promise<{
    byTeamNameList: Map<string, Array<{ name: string; payload: any }>>;
    byName: Map<string, any[]>;
    byTeamLastName: Map<string, any[]>;
  }> {
    const baseUrl =
      this.configService.get<string>('EUROLEAGUE_API_BASE_URL') ||
      'https://api-live.euroleague.net';
    const url = new URL(`${baseUrl}/v2/competitions/E/seasons/${seasonCode}/people`);
    url.searchParams.append('personType', 'J');

    const response = await firstValueFrom(this.httpService.get<any>(url.toString()));
    const data = response?.data;
    const list = Array.isArray(data) ? data : data?.data ?? [];

    const byTeamNameList = new Map<string, Array<{ name: string; payload: any }>>();
    const byName = new Map<string, any[]>();
    const byTeamLastName = new Map<string, any[]>();
    if (Array.isArray(list)) {
      list.forEach((item: any) => {
        const person = item?.person ?? {};
        const club = item?.club ?? {};
        const teamCode = String(club?.code ?? '').toUpperCase();
        const name = person?.name ?? '';
        const alias = person?.alias ?? '';
        const normalizedName = this.normalizeName(name);
        const normalizedAlias = this.normalizeName(alias);
        const payload = {
          playerCode: person?.code ?? '',
          imageUrl: person?.images?.photo ?? null,
          headshotImageUrl: item?.images?.headshot ?? null,
          actionImageUrl: item?.images?.action ?? null,
        };
        const nameParts = normalizedName.split(' ').filter(Boolean);
        const firstLast =
          nameParts.length >= 2 ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` : normalizedName;
        const lastFirst =
          nameParts.length >= 2 ? `${nameParts[nameParts.length - 1]} ${nameParts[0]}` : normalizedName;
        const lastNameRaw = nameParts.length ? nameParts[nameParts.length - 1] : '';
        const lastName = this.normalizeName(lastNameRaw);
        const addByName = (key: string) => {
          if (!key) return;
          const existing = byName.get(key) ?? [];
          existing.push(payload);
          byName.set(key, existing);
        };
        const addByTeamLastName = (team: string, key: string) => {
          if (!team || !key) return;
          const mapKey = `${team}|${key}`;
          const existing = byTeamLastName.get(mapKey) ?? [];
          existing.push(payload);
          byTeamLastName.set(mapKey, existing);
        };
        const addByTeamNameList = (team: string, key: string) => {
          if (!team || !key) return;
          const existing = byTeamNameList.get(team) ?? [];
          existing.push({ name: key, payload });
          byTeamNameList.set(team, existing);
        };
        if (teamCode && normalizedName) {
          addByName(normalizedName);
          addByTeamNameList(teamCode, normalizedName);
        }
        if (teamCode && firstLast) {
          addByName(firstLast);
          addByTeamNameList(teamCode, firstLast);
        }
        if (teamCode && lastFirst) {
          addByName(lastFirst);
          addByTeamNameList(teamCode, lastFirst);
        }
        if (teamCode && normalizedAlias) {
          addByName(normalizedAlias);
          addByTeamNameList(teamCode, normalizedAlias);
        }
        if (teamCode && lastName) {
          addByTeamLastName(teamCode, lastName);
        }
      });
    }
    return { byTeamNameList, byName, byTeamLastName };
  }

  private pickUniqueMatch(matches?: any[]): any | null {
    if (!matches || matches.length === 0) return null;
    if (matches.length === 1) return matches[0];
    return null;
  }

  private pickBestContainsMatch(
    index: Map<string, any[]>,
    teamCode: string,
    nameKey: string,
  ): any | null {
    if (!teamCode || !nameKey) return null;
    let candidate: any | null = null;
    index.forEach((value, key) => {
      if (!key.startsWith(`${teamCode}|`)) return;
      const lastName = key.split('|')[1] ?? '';
      if (!lastName) return;
      if (nameKey.includes(lastName) || lastName.includes(nameKey)) {
        if (value.length === 1 && !candidate) {
          candidate = value[0];
        } else if (value.length === 1 && candidate) {
          candidate = null;
        }
      }
    });
    return candidate;
  }

  private pickBestDistanceMatchByTeamLastName(
    index: Map<string, any[]>,
    teamCode: string,
    lastNameKey: string,
  ): any | null {
    if (!teamCode || !lastNameKey) return null;
    let best: { payload: any; score: number } | null = null;
    index.forEach((value, key) => {
      if (!key.startsWith(`${teamCode}|`)) return;
      const lastName = key.split('|')[1] ?? '';
      if (!lastName) return;
      const score = this.stringDistanceScore(lastNameKey, lastName);
      if (!best || score < best.score) {
        best = { payload: value[0], score };
      }
    });
    return best?.payload ?? null;
  }

  private pickBestContainsMatchByTeam(
    index: Map<string, Array<{ name: string; payload: any }>>,
    teamCode: string,
    nameKey: string,
  ): any | null {
    if (!teamCode || !nameKey) return null;
    const list = index.get(teamCode) ?? [];
    if (!list.length) return null;

    let best: { payload: any; score: number } | null = null;
    list.forEach((entry) => {
      if (!entry?.name) return;
      if (!entry.name.includes(nameKey) && !nameKey.includes(entry.name)) return;
      const overlap = Math.min(entry.name.length, nameKey.length);
      const score = overlap / Math.max(entry.name.length, nameKey.length);
      if (!best || score > best.score) {
        best = { payload: entry.payload, score };
      }
    });

    return best?.payload ?? null;
  }

  private pickBestDistanceMatchByTeam(
    index: Map<string, Array<{ name: string; payload: any }>>,
    teamCode: string,
    nameKey: string,
  ): any | null {
    if (!teamCode || !nameKey) return null;
    const list = index.get(teamCode) ?? [];
    if (!list.length) return null;
    let best: { payload: any; score: number } | null = null;
    list.forEach((entry) => {
      if (!entry?.name) return;
      const score = this.stringDistanceScore(nameKey, entry.name);
      if (!best || score < best.score) {
        best = { payload: entry.payload, score };
      }
    });
    return best?.payload ?? null;
  }

  private pickBestDistanceMatch(
    index: Map<string, any[]>,
    nameKey: string,
  ): any | null {
    if (!nameKey) return null;
    let best: { payload: any; score: number } | null = null;
    index.forEach((value, key) => {
      if (!key) return;
      const score = this.stringDistanceScore(nameKey, key);
      if (!best || score < best.score) {
        best = { payload: value[0], score };
      }
    });
    return best?.payload ?? null;
  }

  private stringDistanceScore(a: string, b: string): number {
    return this.levenshteinDistance(a, b);
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    const aLen = a.length;
    const bLen = b.length;
    if (aLen === 0) return bLen;
    if (bLen === 0) return aLen;

    const prev = new Array<number>(bLen + 1);
    const curr = new Array<number>(bLen + 1);

    for (let j = 0; j <= bLen; j += 1) prev[j] = j;

    for (let i = 1; i <= aLen; i += 1) {
      curr[0] = i;
      const aChar = a.charCodeAt(i - 1);
      for (let j = 1; j <= bLen; j += 1) {
        const cost = aChar === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(
          curr[j - 1] + 1,
          prev[j] + 1,
          prev[j - 1] + cost,
        );
      }
      for (let j = 0; j <= bLen; j += 1) prev[j] = curr[j];
    }

    return prev[bLen];
  }

  private normalizeName(input: string): string {
    if (!input) return '';
    const spacedCamel = input.replace(/([a-z])([A-Z])/g, '$1 $2');
    const normalized = spacedCamel
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/basketball|bc|fc|club|klub|ak|bk|bc\./g, '')
      .trim()
      .replace(/\s+/g, ' ');
    if (!normalized) return '';
    const tokens = normalized.split(' ');
    const suffixes = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v']);
    while (tokens.length && suffixes.has(tokens[tokens.length - 1])) {
      tokens.pop();
    }
    return tokens.join(' ');
  }
}
