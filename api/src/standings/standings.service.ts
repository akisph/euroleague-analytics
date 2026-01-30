import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

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
