import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ClubsQueryDto } from './dto';
import { COMPETITION_CODE } from '../constants';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);
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
   * Get all clubs for competition E (from current season)
   * @param query - Query parameters for filtering and pagination
   * @returns List of clubs with pagination info
   */
  async getAllClubs(query: ClubsQueryDto): Promise<any> {
    try {
      // First, get the current season for competition E
      const seasonsUrl = new URL(`${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons`);
      seasonsUrl.searchParams.append('Limit', '1');
      
      this.logger.log(`Fetching current season from: ${seasonsUrl.toString()}`);
      
      const seasonsResponse = await firstValueFrom(
        this.httpService.get(seasonsUrl.toString()),
      );

      if (!seasonsResponse.data?.data || seasonsResponse.data.data.length === 0) {
        throw new HttpException('No season found for competition', HttpStatus.NOT_FOUND);
      }

      const currentSeason = seasonsResponse.data.data[0];
      const seasonCode = currentSeason.code;

      // Now get clubs for this season
      const url = new URL(`${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/clubs`);

      // Add query parameters if provided (note: API expects capitalized param names)
      if (query.limit !== undefined) {
        url.searchParams.append('Limit', query.limit.toString());
      }
      if (query.offset !== undefined) {
        url.searchParams.append('Offset', query.offset.toString());
      }
      if (query.search) {
        url.searchParams.append('search', query.search);
      }

      this.logger.log(`Fetching clubs from: ${url.toString()}`);

      const response = await firstValueFrom(
        this.httpService.get(url.toString()),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch clubs: ${error.message}`);
      this.handleError(error);
    }
  }

  /**
   * Get a specific club by its code
   * @param clubCode - The club code (e.g., 'OLY' for Olympiacos)
   * @returns Club details
   */
  async getClubByCode(clubCode: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v3/clubs/${clubCode}`;

      this.logger.log(`Fetching club details from: ${url}`);

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch club ${clubCode}: ${error.message}`,
      );
      this.handleError(error);
    }
  }

  /**
   * Get club info/history by its code
   * @param clubCode - The club code (e.g., 'OLY' for Olympiacos)
   * @returns Club info/history
   */
  async getClubInfo(clubCode: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v3/clubs/${clubCode}/info`;

      this.logger.log(`Fetching club info from: ${url}`);

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch club info for ${clubCode}: ${error.message}`,
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
