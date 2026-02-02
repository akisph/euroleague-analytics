import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GameDto, GamesQueryDto } from './dto';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private readonly baseUrl: string;
  private clubImagesCache: { data: Record<string, string>; fetchedAt: number } | null = null;
  private readonly clubImagesTtlMs = 10 * 60 * 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EUROLEAGUE_API_BASE_URL', 'https://api-live.euroleague.net');
  }

  private async getClubImagesMap(): Promise<Record<string, string>> {
    const now = Date.now();
    if (this.clubImagesCache && now - this.clubImagesCache.fetchedAt < this.clubImagesTtlMs) {
      return this.clubImagesCache.data;
    }

    try {
      const url = `${this.baseUrl}/v3/clubs`;
      const response = await this.httpService.get<any>(url).toPromise();
      const clubs = response.data?.data || response.data || [];
      const imagesMap: Record<string, string> = {};

      for (const club of clubs) {
        const code = club?.code;
        const crest = club?.images?.crest;
        if (code && crest) {
          imagesMap[code] = crest;
        }
      }

      this.clubImagesCache = { data: imagesMap, fetchedAt: now };
      return imagesMap;
    } catch (error) {
      this.logger.warn(`Failed to fetch club images: ${error.message}`);
      return {};
    }
  }

  private transformGame(data: any, imagesMap: Record<string, string>): GameDto {
    const homeCode = data.local?.club?.code;
    const awayCode = data.road?.club?.code;

    return {
      gameCode: data.gameCode,
      seasonCode: data.season?.code || data.seasonCode, // fallback if flat
      roundNumber: data.round,
      phaseTypeCode: data.phaseType?.code,
      phaseTypeName: data.phaseType?.name,
      gameDate: data.date,
      homeTeamCode: homeCode,
      homeTeamName: data.local?.club?.name,
      homeTeamImage: homeCode ? imagesMap[homeCode] : undefined,
      homeScore: data.local?.score,
      awayTeamCode: awayCode,
      awayTeamName: data.road?.club?.name,
      awayTeamImage: awayCode ? imagesMap[awayCode] : undefined,
      awayScore: data.road?.score,
      played: data.played,
      arena: data.venue?.name,
      attendance: data.audience,
      groupName: data.group?.name,
    } as GameDto;
  }

  async getSeasonGames(
    seasonCode: string,
    filters?: Partial<GamesQueryDto>,
  ): Promise<GameDto[]> {
    try {
      this.logger.log(`Fetching games for season: ${seasonCode}`);

      const competitionCode = 'E';
      const url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games`;
      const params: any = {};

      if (filters?.roundNumber) {
        params.roundNumber = filters.roundNumber;
      }
      if (filters?.phaseTypeCode) {
        params.phaseTypeCode = filters.phaseTypeCode;
      }
      if (filters?.groupName) {
        params.groupName = filters.groupName;
      }
      if (filters?.teamCode) {
        params.teamCode = filters.teamCode;
      }
      if (filters?.limit) {
        params.Limit = filters.limit;
      }
      if (filters?.offset) {
        params.Offset = filters.offset;
      }

      const response = await this.httpService.get<any>(url, { params }).toPromise();
      const imagesMap = await this.getClubImagesMap();
      // API returns { data: Game[], total: number }, we need just the data array
      const rawGames = response.data?.data || response.data || [];
      return rawGames.map(game => this.transformGame(game, imagesMap));
    } catch (error) {
      this.logger.error(`Error fetching games: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch games for season ${seasonCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGameDetails(
    seasonCode: string,
    gameCode: number,
  ): Promise<GameDto> {
    try {
      this.logger.log(`Fetching game ${gameCode} for season: ${seasonCode}`);

      const competitionCode = 'E';
      const url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}`;

      const response = await this.httpService.get<any>(url).toPromise();
      const imagesMap = await this.getClubImagesMap();
      return this.transformGame(response.data, imagesMap);
    } catch (error) {
      this.logger.error(`Error fetching game details: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch details for game ${gameCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGamesByTeam(
    seasonCode: string,
    teamCode: string,
  ): Promise<GameDto[]> {
    try {
      this.logger.log(`Fetching games for team: ${teamCode}, season: ${seasonCode}`);
      return this.getSeasonGames(seasonCode, { teamCode });
    } catch (error) {
      this.logger.error(`Error fetching team games: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch games for team ${teamCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGamesByRound(
    seasonCode: string,
    roundNumber: number,
  ): Promise<GameDto[]> {
    try {
      this.logger.log(`Fetching games for round: ${roundNumber}, season: ${seasonCode}`);
      return this.getSeasonGames(seasonCode, { roundNumber });
    } catch (error) {
      this.logger.error(`Error fetching round games: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch games for round ${roundNumber}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGameStats(
    seasonCode: string,
    gameCode: number,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching aggregated stats for game ${gameCode}, season ${seasonCode}`);

      const competitionCode = 'E';
      const v3Url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v2Url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;

      // Try v3 then v2
      try {
        const resp = await this.httpService.get<any>(v3Url).toPromise();
        return resp.data;
      } catch (errV3) {
        this.logger.warn('v3 stats not available, falling back to v2', errV3?.message);
      }

      try {
        const resp2 = await this.httpService.get<any>(v2Url).toPromise();
        return resp2.data;
      } catch (errV2) {
        this.logger.warn('v2 stats not available', errV2?.message);
        throw errV2;
      }
    } catch (error) {
      this.logger.error(`Error fetching game stats: ${error?.message || error}`);
      throw new HttpException('Failed to fetch game stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGamePlayerStats(
    seasonCode: string,
    gameCode: number,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching player stats for game ${gameCode}, season ${seasonCode}`);

      const competitionCode = 'E';
      const v3Url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v2Url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v1Url = `${this.baseUrl}/v1/games?seasonCode=${encodeURIComponent(seasonCode)}&gameCode=${gameCode}`;

      // Prefer v3/v2 structured responses
      try {
        const resp = await this.httpService.get<any>(v3Url).toPromise();
        return resp.data?.players || resp.data;
      } catch (errV3) {
        this.logger.warn('v3 player stats not available, trying v2', errV3?.message);
      }

      try {
        const resp2 = await this.httpService.get<any>(v2Url).toPromise();
        // v2 may return players nested under clubs
        return resp2.data?.players || resp2.data;
      } catch (errV2) {
        this.logger.warn('v2 player stats not available, falling back to v1 boxscore', errV2?.message);
      }

      // Fallback to v1 boxscore (XML) — return raw body for caller to parse
      try {
        const resp1 = await this.httpService.get(v1Url, { headers: { Accept: 'application/xml' } }).toPromise();
        return resp1.data;
      } catch (errV1) {
        this.logger.error('Failed to fetch player stats from any endpoint', errV1?.message);
        throw errV1;
      }
    } catch (error) {
      this.logger.error(`Error fetching game player stats: ${error?.message || error}`);
      throw new HttpException('Failed to fetch game player stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTopPirPlayers(
    seasonCode: string,
    gameCode: number,
  ): Promise<{
    homeTeamCode?: string;
    awayTeamCode?: string;
    homeTopPlayers: Array<{ playerCode: string; playerName: string; pir: number; teamCode?: string; imageUrl?: string }>;
    awayTopPlayers: Array<{ playerCode: string; playerName: string; pir: number; teamCode?: string; imageUrl?: string }>;
  }> {
    try {
      this.logger.log(`Fetching top PIR players for game ${gameCode}, season ${seasonCode}`);

      const competitionCode = 'E';
      const v3Url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v2Url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;

      const gameDetails = await this.getGameDetails(seasonCode, gameCode);
      const homeTeamCode = gameDetails.homeTeamCode;
      const awayTeamCode = gameDetails.awayTeamCode;

      const normalizePlayer = (p: any) => {
        const person = p.player?.person ?? p.person ?? null;
        const stats = p.stats ?? p.player?.stats ?? p.total ?? p.totals ?? p;
        const gamesPlayed = Number(stats?.gamesPlayed ?? stats?.gp ?? 0);
        const pir = Number(stats?.valuation ?? stats?.pir ?? 0);
        const pirAverage = gamesPlayed > 0 ? pir / gamesPlayed : undefined;
        return {
          playerCode: person?.code ?? p.playerCode ?? p.code ?? '',
          playerName: person?.name ?? p.fullName ?? p.name ?? 'Unknown',
          pir,
          pirAverage,
          teamCode: p.player?.club?.code ?? p.teamCode ?? p.clubCode ?? p.team?.code ?? null,
          imageUrl: person?.images?.headshot ?? person?.images?.action ?? p.images?.headshot ?? p.images?.action ?? null,
          stats: stats ?? {},
        };
      };

      const extractPlayers = (raw: any, side?: 'local' | 'road') => {
        if (!raw) return [];
        if (side && raw[side]) {
          const arr = raw[side].players ?? raw[side].playersList ?? raw[side].lineup ?? raw[side];
          if (Array.isArray(arr)) return arr.map(normalizePlayer);
        }
        if (Array.isArray(raw.players)) return raw.players.map(normalizePlayer);
        if (Array.isArray(raw)) return raw.map(normalizePlayer);
        return [];
      };

      let data: any;
      try {
        const resp = await this.httpService.get<any>(v3Url).toPromise();
        data = resp.data;
      } catch (errV3) {
        this.logger.warn('v3 stats not available for top PIR, trying v2', errV3?.message);
        const resp2 = await this.httpService.get<any>(v2Url).toPromise();
        data = resp2.data;
      }

      let homePlayers = extractPlayers(data, 'local');
      let awayPlayers = extractPlayers(data, 'road');

      if ((!homePlayers.length || !awayPlayers.length) && Array.isArray(data?.players)) {
        const all = data.players.map(normalizePlayer);
        homePlayers = all.filter((p: any) => p.teamCode && p.teamCode === homeTeamCode);
        awayPlayers = all.filter((p: any) => p.teamCode && p.teamCode === awayTeamCode);
      }

      if ((!homePlayers.length && homeTeamCode) || (!awayPlayers.length && awayTeamCode)) {
        const fetchClubPlayersStats = async (clubCode: string) => {
          const url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/clubs/${clubCode}/people/stats`;
          const resp = await this.httpService.get<any>(url).toPromise();
          const players = resp.data?.playerStats || resp.data?.players || [];
          return players.map((p: any) => {
            const person = p.player ?? p.person ?? {};
            const accumulated = p.accumulated ?? p.total ?? {};
            const gamesPlayed = Number(accumulated?.gamesPlayed ?? accumulated?.gp ?? 0);
            const pir = Number(accumulated.valuation ?? accumulated.pir ?? 0);
            const pirAverage = gamesPlayed > 0 ? pir / gamesPlayed : undefined;
            return {
              playerCode: person.code ?? person.playerCode ?? '',
              playerName: person.name ?? person.fullName ?? 'Unknown',
              pir,
              pirAverage,
              teamCode: clubCode,
              imageUrl: person.images?.headshot ?? person.images?.action ?? null,
              stats: accumulated ?? {},
            };
          });
        };

        if (!homePlayers.length && homeTeamCode) {
          try {
            homePlayers = await fetchClubPlayersStats(homeTeamCode);
          } catch (err) {
            this.logger.warn(`Failed to fetch club stats for ${homeTeamCode}`, err?.message);
          }
        }

        if (!awayPlayers.length && awayTeamCode) {
          try {
            awayPlayers = await fetchClubPlayersStats(awayTeamCode);
          } catch (err) {
            this.logger.warn(`Failed to fetch club stats for ${awayTeamCode}`, err?.message);
          }
        }
      }

      const topOne = (players: any[]) =>
        [...players].sort((a, b) => b.pir - a.pir).slice(0, 1);

      const fetchPersonImage = async (playerCode: string) => {
        if (!playerCode) return null;
        try {
          const urls = [
            `${this.baseUrl}/v2/people/${playerCode}`,
            `${this.baseUrl}/v2/competitions/${competitionCode}/people/${playerCode}`,
            `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/people/${playerCode}`,
          ];
          for (const url of urls) {
            try {
              const resp = await this.httpService.get<any>(url).toPromise();
              const data = resp.data;
              const person = data?.person ?? data?.player ?? data;
              const images = person?.images ?? data?.images ?? {};
              const imageUrl = images?.headshot ?? images?.action ?? null;
              if (imageUrl) return imageUrl;
            } catch (err) {
              this.logger.warn(`Failed to fetch player image from ${url}`, err?.message);
            }
          }
          return null;
        } catch (err) {
          this.logger.warn(`Failed to fetch player image for ${playerCode}`, err?.message);
          return null;
        }
      };

      const enrichWithImage = async (players: any[]) => {
        if (!players?.length) return players;
        const [player] = players;
        if (player?.imageUrl) return players;
        const imageUrl = await fetchPersonImage(player.playerCode);
        return [{ ...player, imageUrl: imageUrl ?? player.imageUrl ?? null }];
      };

      const homeTopPlayers = await enrichWithImage(topOne(homePlayers));
      const awayTopPlayers = await enrichWithImage(topOne(awayPlayers));

      return {
        homeTeamCode,
        awayTeamCode,
        homeTopPlayers,
        awayTopPlayers,
      };
    } catch (error) {
      this.logger.error(`Error fetching top PIR players: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch top PIR players for game ${gameCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
