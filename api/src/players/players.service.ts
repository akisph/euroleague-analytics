import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { COMPETITION_CODE } from '../constants';
import { 
  PlayerDto, 
  PlayersListResponseDto, 
  PlayerStatsDto,
} from './dto';

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
   * Get a single player by code for a specific season
   * @param playerCode - Player code
   * @param seasonCode - Season code to fetch data from
   * @returns Player details with stats for the specified season
   */
  async getPlayerByCode(playerCode: string, seasonCode: string): Promise<PlayerDto> {
    try {
      this.logger.log(`Fetching player: ${playerCode}`);

      // First, try to get player from people endpoint
      let player: PlayerDto;
      let foundSeasonData = false;
      try {
        const url = `${this.baseUrl}/v2/people/${playerCode}`;
        const response = await firstValueFrom(this.httpService.get<any>(url));

        if (response.data) {
          player = this.transformPlayer(response.data);
        } else {
          throw new Error('No player data');
        }
      } catch (error) {
        this.logger.warn(`Could not fetch from /v2/people/${playerCode}`);
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }

      // Fetch player data for the specified season
      // The /v2/competitions/{competitionCode}/people/{playerCode} endpoint returns
      // all SeasonPersonModel records for this player across all seasons
      try {
        this.logger.log(`Fetching player data for season ${seasonCode}: ${playerCode}`);
        const competitionUrl = new URL(
          `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/people/${playerCode}`,
        );
        const competitionResponse = await firstValueFrom(this.httpService.get<any>(competitionUrl.toString()));
        
        if (competitionResponse.data) {
          // The endpoint returns a paginated response: { data: [...], total: number }
          let seasonPersonList = competitionResponse.data;
          
          // If response has a 'data' property with an array, extract the array
          if (seasonPersonList && typeof seasonPersonList === 'object' && 'data' in seasonPersonList) {
            seasonPersonList = seasonPersonList.data;
          }
          
          // Find data from the specified season
          if (Array.isArray(seasonPersonList) && seasonPersonList.length > 0) {
            const seasonWithClub = seasonPersonList.find(sp => sp.season?.code === seasonCode);
            
            if (seasonWithClub) {
              this.logger.debug(
                `Found player in season ${seasonCode} with club: ${seasonWithClub.club?.name}, dorsal: ${seasonWithClub.dorsal}`,
              );
              const mergedPlayer = this.transformPlayerResponse(seasonWithClub);
              player.clubCode = mergedPlayer.clubCode;
              player.clubName = mergedPlayer.clubName;
              player.dorsal = mergedPlayer.dorsal || player.dorsal;
              player.position = mergedPlayer.position || player.position;
              player.imageUrl = mergedPlayer.imageUrl || player.imageUrl;
              
              // Extract images from season data
              if (seasonWithClub.images) {
                player.headshotImageUrl = seasonWithClub.images.headshot || player.headshotImageUrl;
                player.actionImageUrl = seasonWithClub.images.action || player.actionImageUrl;
                this.logger.debug(`Updated player images: headshot=${player.headshotImageUrl}, action=${player.actionImageUrl}`);
              }
              
              this.logger.log(`Updated player with season data: club=${player.clubName}, dorsal=${player.dorsal}`);
              foundSeasonData = true;
              
              // Fetch stats for this season
              try {
                const stats = await this.getPlayerStats(seasonCode, playerCode);
                player.stats = stats;
                this.logger.log(`Fetched stats for player ${playerCode} from season ${seasonCode}`);
              } catch (statsError) {
                this.logger.warn(`Could not fetch stats for season ${seasonCode}`);
              }
            } else {
              this.logger.warn(`Player not found in season ${seasonCode}`);
            }
          }
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch season data for player ${playerCode} in season ${seasonCode}: ${error.message}`,
        );
      }

      // If we didn't find the player via competition endpoint, try the season-specific endpoint
      if (!foundSeasonData) {
        try {
          this.logger.log(`Trying season-specific endpoint for player ${playerCode} in season ${seasonCode}`);
          const seasonUrl = new URL(
            `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/people/${playerCode}`,
          );
          const seasonResponse = await firstValueFrom(this.httpService.get<any>(seasonUrl.toString()));
          
          if (seasonResponse.data) {
            // The endpoint may return:
            // 1. Paginated response: { data: [...], total: number }
            // 2. Direct array: [...]
            // 3. Direct object: {...}
            let seasonPlayerData = seasonResponse.data;
            
            // If response has a 'data' property with an array, extract first element
            if (seasonPlayerData && typeof seasonPlayerData === 'object' && 'data' in seasonPlayerData) {
              if (Array.isArray(seasonPlayerData.data)) {
                seasonPlayerData = seasonPlayerData.data[0];
              } else {
                seasonPlayerData = seasonPlayerData.data;
              }
            } else if (Array.isArray(seasonPlayerData)) {
              seasonPlayerData = seasonPlayerData[0];
            }
            
            if (seasonPlayerData && typeof seasonPlayerData === 'object') {
              this.logger.debug(`Season-specific data received: club=${seasonPlayerData.club?.name}, dorsal=${seasonPlayerData.dorsal}`);
              // Merge season-specific data (including club info) with basic player data
              const mergedPlayer = this.transformPlayerResponse(seasonPlayerData);
              player.clubCode = mergedPlayer.clubCode;
              player.clubName = mergedPlayer.clubName;
              player.dorsal = mergedPlayer.dorsal || player.dorsal;
              player.position = mergedPlayer.position || player.position;
              player.imageUrl = mergedPlayer.imageUrl || player.imageUrl;
              
              this.logger.log(`Found player data in season ${seasonCode}: club=${player.clubName}, dorsal=${player.dorsal}`);
              foundSeasonData = true;
              
              // Fetch stats for this season
              try {
                const stats = await this.getPlayerStats(seasonCode, playerCode);
                player.stats = stats;
                this.logger.log(`Fetched stats for player ${playerCode} from season ${seasonCode}`);
              } catch (statsError) {
                this.logger.warn(`Could not fetch stats for season ${seasonCode}`);
              }
            }
          }
        } catch (error) {
          this.logger.warn(
            `Could not fetch player data from season-specific endpoint for ${playerCode} in ${seasonCode}: ${error.message}`,
          );
        }
      }

      if (!foundSeasonData) {
        this.logger.warn(
          `Could not find player ${playerCode} in any season. Club info may be missing.`,
        );
      }

      this.logger.log(`Found player: ${player.name}, club: ${player.clubName || 'N/A'}`);

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
      headshotImageUrl: item.images?.headshot,
      actionImageUrl: item.images?.action,
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
    // Handle different field name variations
    const playerCode = data.PersonCode || data.playerCode || data.Code || data.code || '';
    const name = data.PersonName || data.Shortname || data.name || data.Name || 'Unknown';
    
    // Get country info
    const countryCode = data.CountryCode || data.countryCode || data.Country || data.country?.code;
    const countryName = data.CountryName || data.countryName || data.country?.name;
    
    // Get birth country info
    const birthCountryCode = data.birthCountry?.code;
    const birthCountryName = data.birthCountry?.name;

    return {
      playerCode,
      name,
      alias: data.Shortname || data.alias || data.aliasRaw,
      aliasRaw: data.aliasRaw,
      passportName: data.passportName,
      passportSurname: data.passportSurname,
      jerseyName: data.jerseyName,
      abbreviatedName: data.abbreviatedName,
      dorsal: data.Dorsal ? parseInt(data.Dorsal) : data.dorsal,
      position: data.Position || data.position,
      countryCode,
      countryName,
      birthCountryCode,
      birthCountryName,
      imageUrl: data.PersonPhoto || data.imageUrl || data.Photo || data.images?.photo,
      height: data.Height ? parseInt(data.Height) : data.height,
      weight: data.weight,
      birthDate: data.BirthDate || data.birthDate,
      twitterAccount: data.twitterAccount,
      instagramAccount: data.instagramAccount,
      facebookAccount: data.facebookAccount,
      clubCode,
    };
  }

  /**
   * Get all games for a specific player with full box scores containing only that player's stats
   * @param seasonCode - Season code (e.g., 'E2024')
   * @param playerCode - Player code (e.g., '003469')
   * @returns Box scores with player stats as returned from API
   */
  async getPlayerGameBoxScores(
    seasonCode: string,
    playerCode: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching game box scores for player ${playerCode} in season ${seasonCode}`);

      const url = new URL(
        `${this.baseUrl}/v2/competitions/${COMPETITION_CODE}/seasons/${seasonCode}/people/${playerCode}/stats`,
      );

      this.logger.log(`Calling: ${url.toString()}`);

      const response = await firstValueFrom(this.httpService.get<any>(url.toString()));

      if (!response.data) {
        this.logger.warn(`No data received for player ${playerCode}`);
        return { games: [], total: 0 };
      }

      this.logger.log(`Successfully fetched stats for player ${playerCode}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching game box scores for ${playerCode}:`, error.message);
      throw new HttpException(
        `Failed to fetch game box scores for player ${playerCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculate percentage
   */
  private calculatePercentage(made: number | undefined, attempted: number | undefined): string {
    const m = made || 0;
    const a = attempted || 0;
    if (a === 0) return '-';
    const percentage = (m / a) * 100;
    return `${percentage.toFixed(1)}%`;
  }
}
