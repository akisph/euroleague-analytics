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

      const response = await this.httpService.get<any>(url).toPromise();
      return response.data;
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
