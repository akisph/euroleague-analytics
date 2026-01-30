import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GamesQueryDto } from './dto';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EUROLEAGUE_API_BASE_URL', 'https://api-live.euroleague.net');
  }

  async getSeasonGames(
    seasonCode: string,
    filters?: Partial<GamesQueryDto>,
  ): Promise<any> {
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
      return response.data;
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
  ): Promise<any> {
    try {
      this.logger.log(`Fetching game ${gameCode} for season: ${seasonCode}`);

      const competitionCode = 'E';
      const url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}`;

      const response = await this.httpService.get<any>(url).toPromise();
      return response.data;
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
  ): Promise<any> {
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
  ): Promise<any> {
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
}
