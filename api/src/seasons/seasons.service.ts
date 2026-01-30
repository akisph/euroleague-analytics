import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SeasonsQueryDto } from './dto';
import { COMPETITION_CODE } from '../constants';

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('EUROLEAGUE_API_BASE_URL') ||
      'https://api-live.euroleague.net';
    
    this.logger.log(`Using competition code: ${COMPETITION_CODE}`);
  }

  /**
   * Get all seasons for the competition
   * @param query - Query parameters for filtering and pagination
   * @returns List of seasons with pagination info
   */
  async getAllSeasons(query: SeasonsQueryDto): Promise<any> {
    try {
      const url = new URL(`${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons`);

      // Add query parameters if provided (note: API expects capitalized param names)
      if (query.limit !== undefined) {
        url.searchParams.append('Limit', query.limit.toString());
      }
      if (query.offset !== undefined) {
        url.searchParams.append('Offset', query.offset.toString());
      }
      if (query.competitionYear !== undefined) {
        url.searchParams.append('competitionYear', query.competitionYear.toString());
      }
      if (query.search) {
        url.searchParams.append('search', query.search);
      }

      this.logger.log(`Fetching seasons from: ${url.toString()}`);

      const response = await firstValueFrom(
        this.httpService.get(url.toString()),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch seasons: ${error.message}`);
      this.handleError(error);
    }
  }

  /**
   * Get a specific season by its code
   * @param seasonCode - The season code (e.g., 'E2024' for 2024-2025 season)
   * @returns Season details
   */
  async getSeasonByCode(seasonCode: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}`;

      this.logger.log(`Fetching season details from: ${url}`);

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch season ${seasonCode}: ${error.message}`,
      );
      this.handleError(error);
    }
  }

  /**
   * Get the current active season
   * @returns Current season details
   */
  async getCurrentSeason(): Promise<any> {
    try {
      // Get the latest season (sorted by year desc, limit 1)
      const url = new URL(`${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons`);
      url.searchParams.append('Limit', '1');

      this.logger.log(`Fetching current season from: ${url.toString()}`);

      const response = await firstValueFrom(this.httpService.get(url.toString()));

      if (response.data?.data && response.data.data.length > 0) {
        // Return the first (most recent) season
        return response.data.data[0];
      }

      throw new HttpException('No season found', HttpStatus.NOT_FOUND);
    } catch (error) {
      this.logger.error(`Failed to fetch current season: ${error.message}`);
      this.handleError(error);
    }
  }

  /**
   * Get all clubs participating in a specific season
   * @param seasonCode - The season code
   * @returns List of clubs in the season
   */
  async getSeasonClubs(seasonCode: string, limit?: number, offset?: number): Promise<any> {
    try {
      const url = new URL(`${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/clubs`);
      
      if (limit !== undefined) {
        url.searchParams.append('Limit', limit.toString());
      }
      if (offset !== undefined) {
        url.searchParams.append('Offset', offset.toString());
      }

      this.logger.log(`Fetching season clubs from: ${url.toString()}`);

      const response = await firstValueFrom(this.httpService.get(url.toString()));

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch clubs for season ${seasonCode}: ${error.message}`,
      );
      this.handleError(error);
    }
  }

  /**
   * Get a specific club's details in a season
   * @param seasonCode - The season code
   * @param clubCode - The club code
   * @returns Club details for the season
   */
  async getSeasonClubByCode(seasonCode: string, clubCode: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/clubs/${clubCode}`;

      this.logger.log(`Fetching season club details from: ${url}`);

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch club ${clubCode} for season ${seasonCode}: ${error.message}`,
      );
      this.handleError(error);
    }
  }

  /**
   * Handle errors from the external API
   */
  private handleError(error: any): never {
    if (error.response) {
      // The request was made and the server responded with an error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 401:
          throw new HttpException('Unauthorized access to Euroleague API', HttpStatus.UNAUTHORIZED);
        case 403:
          throw new HttpException('Forbidden access to Euroleague API', HttpStatus.FORBIDDEN);
        case 404:
          throw new HttpException('Resource not found on Euroleague API', HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(
            `Euroleague API error: ${message}`,
            status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new HttpException(
        'No response from Euroleague API',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      // Something happened in setting up the request
      throw new HttpException(
        `Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
