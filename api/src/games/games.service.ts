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

  async getGameStats(
    seasonCode: string,
    gameCode: number,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching aggregated stats for game ${gameCode}, season ${seasonCode}`);

      const competitionCode = 'E';
      const v3Url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v2Url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;

      // Try v3 then v2
      try {
        const resp = await this.httpService.get<any>(v3Url).toPromise();
        return resp.data;
      } catch (errV3) {
        this.logger.warn('v3 stats not available, falling back to v2', errV3?.message);
      }

      try {
        const resp2 = await this.httpService.get<any>(v2Url).toPromise();
        return resp2.data;
      } catch (errV2) {
        this.logger.warn('v2 stats not available', errV2?.message);
        throw errV2;
      }
    } catch (error) {
      this.logger.error(`Error fetching game stats: ${error?.message || error}`);
      throw new HttpException('Failed to fetch game stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGamePlayerStats(
    seasonCode: string,
    gameCode: number,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching player stats for game ${gameCode}, season ${seasonCode}`);

      const competitionCode = 'E';
      const v3Url = `${this.baseUrl}/v3/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v2Url = `${this.baseUrl}/v2/competitions/${competitionCode}/seasons/${seasonCode}/games/${gameCode}/stats`;
      const v1Url = `${this.baseUrl}/v1/games?seasonCode=${encodeURIComponent(seasonCode)}&gameCode=${gameCode}`;

      // Prefer v3/v2 structured responses
      try {
        const resp = await this.httpService.get<any>(v3Url).toPromise();
        return resp.data?.players || resp.data;
      } catch (errV3) {
        this.logger.warn('v3 player stats not available, trying v2', errV3?.message);
      }

      try {
        const resp2 = await this.httpService.get<any>(v2Url).toPromise();
        // v2 may return players nested under clubs
        return resp2.data?.players || resp2.data;
      } catch (errV2) {
        this.logger.warn('v2 player stats not available, falling back to v1 boxscore', errV2?.message);
      }

      // Fallback to v1 boxscore (XML) — return raw body for caller to parse
      try {
        const resp1 = await this.httpService.get(v1Url, { headers: { Accept: 'application/xml' } }).toPromise();
        return resp1.data;
      } catch (errV1) {
        this.logger.error('Failed to fetch player stats from any endpoint', errV1?.message);
        throw errV1;
      }
    } catch (error) {
      this.logger.error(`Error fetching game player stats: ${error?.message || error}`);
      throw new HttpException('Failed to fetch game player stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
