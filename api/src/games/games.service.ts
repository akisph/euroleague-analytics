import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GameDto, GamesQueryDto } from './dto';

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

  private transformGame(data: any): GameDto {
    return {
      gameCode: data.gameCode,
      seasonCode: data.season?.code || data.seasonCode, // fallback if flat
      roundNumber: data.round,
      phaseTypeCode: data.phaseType?.code,
      phaseTypeName: data.phaseType?.name,
      gameDate: data.date,
      homeTeamCode: data.local?.club?.code,
      homeTeamName: data.local?.club?.name,
      homeScore: data.local?.score,
      awayTeamCode: data.road?.club?.code,
      awayTeamName: data.road?.club?.name,
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
      // API returns { data: Game[], total: number }, we need just the data array
      const rawGames = response.data?.data || response.data || [];
      return rawGames.map(game => this.transformGame(game));
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
      return this.transformGame(response.data);
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
}
