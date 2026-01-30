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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EUROLEAGUE_API_BASE_URL', 'https://api-live.euroleague.net');
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
