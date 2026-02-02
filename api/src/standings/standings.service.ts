import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);

@Injectable()
export class StandingsService {
  private readonly logger = new Logger(StandingsService.name);
  private readonly baseUrl: string;
  private readonly competitionCode = 'E';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EUROLEAGUE_API_BASE_URL', 'https://api-live.euroleague.net');
  }

  private async getTeamLastFive(seasonCode: string): Promise<Record<string, { lastFive: string }>> {
    try {
      const url = `${this.baseUrl}/v2/competitions/${this.competitionCode}/seasons/${seasonCode}/games`;
      const response = await this.httpService.get<any>(url).toPromise();
      const rawGames = response.data?.data || response.data || [];
      const teamGames = new Map<string, Array<{ date: number; result: 'W' | 'L' | 'D' }>>();

      for (const game of rawGames) {
        const homeCode = game?.local?.club?.code;
        const awayCode = game?.road?.club?.code;
        if (!homeCode || !awayCode) {
          continue;
        }

        if (game?.played === false) {
          continue;
        }

        const homeScore = Number(game?.local?.score);
        const awayScore = Number(game?.road?.score);
        if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
          continue;
        }

        const dateValue = Date.parse(game?.date || '');
        const date = Number.isNaN(dateValue) ? 0 : dateValue;

        let homeResult: 'W' | 'L' | 'D' = 'D';
        if (homeScore > awayScore) homeResult = 'W';
        else if (homeScore < awayScore) homeResult = 'L';
        else {
          continue;
        }

        const awayResult: 'W' | 'L' | 'D' = homeResult === 'W' ? 'L' : homeResult === 'L' ? 'W' : 'D';

        if (!teamGames.has(homeCode)) teamGames.set(homeCode, []);
        if (!teamGames.has(awayCode)) teamGames.set(awayCode, []);
        teamGames.get(homeCode)!.push({ date, result: homeResult });
        teamGames.get(awayCode)!.push({ date, result: awayResult });
      }

      const streaks: Record<string, { lastFive: string }> = {};
      for (const [teamCode, games] of teamGames.entries()) {
        const sorted = games.sort((a, b) => b.date - a.date);
        if (!sorted.length) {
          streaks[teamCode] = { lastFive: '' };
          continue;
        }

        const lastFive = sorted.slice(0, 5).map((g) => g.result).join('');
        streaks[teamCode] = { lastFive };
      }

      return streaks;
    } catch (error) {
      this.logger.warn(`Failed to compute streaks: ${error.message}`);
      return {};
    }
  }

  private async getClubImagesMap(): Promise<Record<string, string>> {
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

      return imagesMap;
    } catch (error) {
      this.logger.warn(`Failed to fetch club images: ${error.message}`);
      return {};
    }
  }

  async getCurrentStandings(seasonCode: string): Promise<any> {
    try {
      this.logger.log(`Fetching current standings for season: ${seasonCode}`);

      const url = `${this.baseUrl}/v1/standings`;
      const params = {
        seasonCode: seasonCode,
      };

      const response = await this.httpService.get<any>(url, { 
        params,
        headers: { 'Accept': 'application/xml' }
      }).toPromise();
      
      // Parse XML response
      const parsed: any = await parseXml(response.data);
      
      // Transform XML structure to JSON
      const groups = parsed.standings?.group || [];
      const [streaks, imagesMap] = await Promise.all([
        this.getTeamLastFive(seasonCode),
        this.getClubImagesMap(),
      ]);
      
      return groups.map((group: any) => ({
        groupCode: group.$.round || 'RS',
        groupName: group.$.name || 'Regular Season',
        standings: (group.team || []).map((team: any) => ({
          position: parseInt(team.ranking?.[0] || '0'),
          teamCode: team.code?.[0] || '',
          teamName: team.name?.[0] || '',
          gamesPlayed: parseInt(team.totalgames?.[0] || '0'),
          wins: parseInt(team.wins?.[0] || '0'),
          losses: parseInt(team.losses?.[0] || '0'),
          pointsFor: parseInt(team.ptsfavour?.[0] || '0'),
          pointsAgainst: parseInt(team.ptsagainst?.[0] || '0'),
          difference: parseInt(team.difference?.[0] || '0'),
          lastFive: streaks[team.code?.[0]]?.lastFive ?? '',
          teamImage: imagesMap[team.code?.[0]] ?? '',
        }))
      }));
    } catch (error) {
      this.logger.error(`Error fetching current standings: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch current standings for season ${seasonCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSeasonStandings(
    seasonCode: string,
    roundNumber: number,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching standings for season: ${seasonCode}, round: ${roundNumber}`);

      const competitionCode = 'E';
      const url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/rounds/${roundNumber}/basicstandings`;

      const response = await this.httpService.get<any>(url).toPromise();
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching standings: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch standings for season ${seasonCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGroupStandings(
    seasonCode: string,
    roundNumber: number,
    groupId: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching group standings for season: ${seasonCode}, round: ${roundNumber}, group: ${groupId}`);

      const competitionCode = 'E';
      const url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/rounds/${roundNumber}/basicstandings`;

      const response = await this.httpService.get<any>(url).toPromise();
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching group standings: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch standings for group ${groupId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
