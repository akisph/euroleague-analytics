import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EUROLEAGUE_API_BASE_URL', 'https://api-live.euroleague.net');
  }

  async getTeamRoster(
    seasonCode: string,
    clubCode: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching roster for club: ${clubCode}, season: ${seasonCode}`);

      const competitionCode = 'E';
      const url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/clubs/${clubCode}/people`;

      const [rosterResponse, statsResponse] = await Promise.all([
        this.httpService.get<any>(url).toPromise(),
        this.httpService.get<any>(
          `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/clubs/${clubCode}/people/stats`,
        ).toPromise().catch((error) => {
          this.logger.warn(`Roster stats not available for ${clubCode}`, error?.message);
          return null;
        }),
      ]);

      const rosterData = rosterResponse.data;
      const statsData = statsResponse?.data;
      const statsList = statsData?.playerStats || statsData?.players || statsData?.items || [];
      const statsMap = new Map<string, any>();

      if (Array.isArray(statsList)) {
        statsList.forEach((item: any) => {
          const person = item?.player ?? item?.person ?? {};
          const personCode = person.code ?? item?.playerCode ?? item?.personCode;
          if (!personCode) return;
          const accumulated = item?.accumulated ?? item?.total ?? item?.stats ?? item;
          statsMap.set(String(personCode), accumulated);
        });
      }

      const attachStats = (entry: any) => {
        const personCode = entry?.person?.code ?? entry?.personCode ?? entry?.player?.code;
        const playerStats = personCode ? statsMap.get(String(personCode)) : null;
        return { ...entry, playerStats };
      };

      if (Array.isArray(rosterData)) {
        return rosterData.map(attachStats);
      }

      if (rosterData?.people && Array.isArray(rosterData.people)) {
        return { ...rosterData, people: rosterData.people.map(attachStats) };
      }

      return rosterData;
    } catch (error) {
      this.logger.error(`Error fetching roster: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch roster for club ${clubCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTeamPlayers(
    seasonCode: string,
    clubCode: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching players for club: ${clubCode}, season: ${seasonCode}`);
      return this.getTeamRoster(seasonCode, clubCode);
    } catch (error) {
      this.logger.error(`Error fetching players: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch players for club ${clubCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSeasonTeams(
    seasonCode: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching all teams for season: ${seasonCode}`);

      const competitionCode = 'E';
      const clubsUrl = `${this.baseUrl}/v2/clubs`;
      const clubsResponse = await this.httpService.get<any>(clubsUrl).toPromise();
      return clubsResponse.data;
    } catch (error) {
      this.logger.error(`Error fetching season teams: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch teams for season ${seasonCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPlayerByCode(
    playerCode: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching player: ${playerCode}`);

      const url = `${this.baseUrl}/v2/people/${playerCode}`;
      const response = await this.httpService.get<any>(url).toPromise();
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching player: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch player ${playerCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
