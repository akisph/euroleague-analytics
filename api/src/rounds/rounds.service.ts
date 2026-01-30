import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoundsService {
  private readonly logger = new Logger(RoundsService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EUROLEAGUE_API_BASE_URL', 'https://api-live.euroleague.net');
  }

  async getSeasonRounds(seasonCode: string): Promise<any> {
    try {
      this.logger.log(`Fetching rounds for season: ${seasonCode}`);
      const competitionCode = 'E';
      const gamesUrl = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games`;
      
      const response = await this.httpService.get<any>(gamesUrl).toPromise();
      this.logger.log(`Response:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching rounds: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch rounds for season ${seasonCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRoundDetails(seasonCode: string, roundNumber: number): Promise<any> {
    try {
      this.logger.log(`Fetching round ${roundNumber} details for season: ${seasonCode}`);
      const competitionCode = 'E';
      const gamesUrl = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games`;
      
      const response = await this.httpService.get<any>(gamesUrl).toPromise();
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching round details: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch details for round ${roundNumber}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRoundsByPhase(seasonCode: string, phaseCode: string): Promise<any> {
    try {
      this.logger.log(`Fetching rounds for season: ${seasonCode}, phase: ${phaseCode}`);
      const competitionCode = 'E';
      const gamesUrl = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games`;
      
      const response = await this.httpService.get<any>(gamesUrl).toPromise();
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching rounds by phase: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to fetch rounds for phase ${phaseCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
