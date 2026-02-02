import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { COMPETITION_CODE } from '../constants';
import { PlayerDto, PlayersListResponseDto, PlayerStatsDto } from './dto';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('EUROLEAGUE_API_BASE_URL') ||
      'https://api-live.euroleague.net';
  }

  /**
   * Get all players for a specific season
   * @param seasonCode - Season code (e.g., 'E2025')
   * @returns List of players with stats
   */
  async getPlayersByseason(seasonCode: string): Promise<PlayersListResponseDto> {
    try {
      this.logger.log(`Fetching players for season: ${seasonCode}`);

      const url = new URL(
        `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/people`,
      );
      url.searchParams.append('personType', 'J'); // J = Player

      this.logger.log(`Calling: ${url.toString()}`);

      const response = await firstValueFrom(this.httpService.get<any>(url.toString()));

      if (!response.data) {
        throw new HttpException('No players found', HttpStatus.NOT_FOUND);
      }

      // Handle both direct array and wrapped response
      let playersData = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        // Direct array response
        playersData = response.data;
        total = playersData.length;
      } else if (Array.isArray(response.data.data)) {
        // Structure: { data: [...], total: number }
        playersData = response.data.data;
        total = response.data.total || playersData.length;
      }

      this.logger.log(`Found ${playersData.length} players for season ${seasonCode}`);

      // Transform and flatten the nested structure
      const players = await Promise.all(
        playersData.map(async (item: any) => {
          const player = this.transformPlayerResponse(item);
          // Fetch stats for each player
          try {
            const stats = await this.getPlayerStats(seasonCode, player.playerCode);
            player.stats = stats;
          } catch (error) {
            this.logger.warn(
              `Could not fetch stats for player ${player.playerCode}`,
            );
            // Continue without stats
          }
          return player;
        }),
      );

      return {
        data: players,
        total,
      };
    } catch (error) {
      this.logger.error(`Error fetching players for season ${seasonCode}:`, error.message);
      throw new HttpException(
        `Failed to fetch players for season ${seasonCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get player statistics for a specific season
   * @param seasonCode - Season code
   * @param playerCode - Player code
   * @returns Player statistics
   */
  async getPlayerStats(seasonCode: string, playerCode: string): Promise<PlayerStatsDto> {
    try {
      this.logger.log(`Fetching stats for player: ${playerCode}, season: ${seasonCode}`);

      const url = new URL(
        `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/people/${playerCode}/stats`,
      );

      this.logger.log(`Calling: ${url.toString()}`);

      const response = await firstValueFrom(this.httpService.get<any>(url.toString()));

      if (!response.data || !response.data.accumulated) {
        this.logger.warn(`No stats data for player ${playerCode}`);
        return {}; // Return empty stats if not available
      }

      return this.transformStats(response.data.accumulated);
    } catch (error) {
      this.logger.warn(
        `Could not fetch stats for player ${playerCode}:`,
        error.message,
      );
      return {}; // Return empty stats on error
    }
  }

  /**
   * Get all players for a specific club and season
   * @param seasonCode - Season code
   * @param clubCode - Club code
   * @returns List of players for the club
   */
  async getPlayersByClub(seasonCode: string, clubCode: string): Promise<PlayerDto[]> {
    try {
      this.logger.log(
        `Fetching players for club: ${clubCode}, season: ${seasonCode}`,
      );

      const url = new URL(
        `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/clubs/${clubCode}/people`,
      );
      url.searchParams.append('personType', 'J'); // J = Player

      this.logger.log(`Calling: ${url.toString()}`);

      const response = await firstValueFrom(this.httpService.get<any>(url.toString()));

      if (!response.data) {
        throw new HttpException('No players found', HttpStatus.NOT_FOUND);
      }

      // Handle both direct array and wrapped response
      const playersData = Array.isArray(response.data) ? response.data : response.data.data || [];

      const players = playersData.map((player: any) =>
        this.transformPlayer(player, clubCode),
      );

      this.logger.log(`Found ${players.length} players for club ${clubCode}`);

      return players;
    } catch (error) {
      this.logger.error(
        `Error fetching players for club ${clubCode}, season ${seasonCode}:`,
        error.message,
      );
      throw new HttpException(
        `Failed to fetch players for club ${clubCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a single player by code
   * @param playerCode - Player code
   * @returns Player details with stats for current season
   */
  async getPlayerByCode(playerCode: string): Promise<PlayerDto> {
    try {
      this.logger.log(`Fetching player: ${playerCode}`);

      const url = `${this.baseUrl}/v2/people/${playerCode}`;

      const response = await firstValueFrom(this.httpService.get<any>(url));

      if (!response.data) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }

      const player = this.transformPlayer(response.data);

      // Fetch current season stats
      try {
        const currentSeasonCode = 'E2024'; // Default to latest season
        const stats = await this.getPlayerStats(currentSeasonCode, playerCode);
        player.stats = stats;
        this.logger.log(`Fetched stats for player ${playerCode} from season ${currentSeasonCode}`);
      } catch (error) {
        this.logger.warn(
          `Could not fetch stats for player ${playerCode}: ${error.message}`,
        );
        // Continue without stats - it's not a critical error
      }

      this.logger.log(`Found player: ${player.name}`);

      return player;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error fetching player ${playerCode}:`, error.message);
      throw new HttpException(
        `Failed to fetch player ${playerCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Transform external API response to PlayerDto
   * The API returns a nested structure with person, club, position etc
   */
  private transformPlayerResponse(item: any): PlayerDto {
    const person = item.person || {};
    const club = item.club || {};
    const country = person.country || {};

    return {
      playerCode: person.code || '',
      name: person.name || 'Unknown',
      alias: person.alias,
      dorsal: item.dorsal ? parseInt(item.dorsal) : undefined,
      position: item.position || item.positionName,
      countryCode: country.code,
      countryName: country.name,
      imageUrl: person.images?.photo,
      height: person.height,
      birthDate: person.birthDate,
      clubCode: club.code,
      clubName: club.name,
      // Stats will be populated separately if needed
    };
  }

  /**
   * Transform stats response to PlayerStatsDto
   */
  private transformStats(data: any): PlayerStatsDto {
    return {
      gamesPlayed: data.gamesPlayed,
      gamesStarted: data.gamesStarted,
      timePlayed: data.timePlayed,
      valuation: data.valuation,
      points: data.points,
      fieldGoalsMade2: data.fieldGoalsMade2,
      fieldGoalsAttempted2: data.fieldGoalsAttempted2,
      fieldGoalsMade3: data.fieldGoalsMade3,
      fieldGoalsAttempted3: data.fieldGoalsAttempted3,
      freeThrowsMade: data.freeThrowsMade,
      freeThrowsAttempted: data.freeThrowsAttempted,
      fieldGoalsMadeTotal: data.fieldGoalsMadeTotal,
      fieldGoalsAttemptedTotal: data.fieldGoalsAttemptedTotal,
      totalRebounds: data.totalRebounds,
      defensiveRebounds: data.defensiveRebounds,
      offensiveRebounds: data.offensiveRebounds,
      assistances: data.assistances,
      steals: data.steals,
      turnovers: data.turnovers,
      blocksFavour: data.blocksFavour,
      blocksAgainst: data.blocksAgainst,
      foulsCommited: data.foulsCommited,
      foulsReceived: data.foulsReceived,
      plusMinus: data.plusMinus,
      threePointShootingPercentage: data.threePointShootingPercentage,
      twoPointShootingPercentage: data.twoPointShootingPercentage,
      freeThrowShootingPercentage: data.freeThrowShootingPercentage,
    };
  }

  /**
   * Transform external API response to PlayerDto (legacy fallback)
   */
  private transformPlayer(data: any, clubCode?: string): PlayerDto {
    // Log data structure to debug
    if (!data.PersonCode && !data.playerCode && !data.person) {
      console.warn('Player data missing code:', data);
    }

    return {
      playerCode: data.PersonCode || data.playerCode || data.Code || '',
      name: data.PersonName || data.Shortname || data.name || data.Name || 'Unknown',
      alias: data.Shortname || data.alias,
      dorsal: data.Dorsal ? parseInt(data.Dorsal) : data.dorsal,
      position: data.Position || data.position,
      countryCode: data.CountryCode || data.countryCode || data.Country,
      countryName: data.CountryName || data.countryName,
      imageUrl: data.PersonPhoto || data.imageUrl || data.Photo,
      height: data.Height ? parseInt(data.Height) : data.height,
      birthDate: data.BirthDate || data.birthDate,
      clubCode,
    };
  }
}
