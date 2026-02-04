import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { PlayerDto, PlayersListResponseDto, PlayersQueryDto, PlayerStatsDto, PlayerGameBoxScoresResponseDto, PlayersLeadersResponseDto, PlayersLeadersQueryDto } from './dto';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  /**
   * GET /players/season/:seasonCode
   * Get all players for a specific season
   */
  @Get('season/:seasonCode')
  async getPlayersBySeason(
    @Param('seasonCode') seasonCode: string,
    @Query() query: PlayersQueryDto,
  ): Promise<PlayersListResponseDto> {
    return this.playersService.getPlayersByseason(seasonCode);
  }

  /**
   * GET /players/season/:seasonCode/leaders
   * Get player leaders for current round (v3)
   */
  @Get('season/:seasonCode/leaders')
  @ApiQuery({ name: 'seasonCode', required: false, type: String })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: [
      'Valuation',
      'Score',
      'TotalRebounds',
      'OffensiveRebounds',
      'DefensiveRebounds',
      'Assistances',
      'Steals',
      'BlocksFavour',
      'BlocksAgainst',
      'Turnovers',
      'FoulsReceived',
      'FoulsCommited',
      'FreeThrowsMade',
      'FreeThrowsAttempted',
      'FreeThrowsPercent',
      'FieldGoalsMade2',
      'FieldGoalsAttempted2',
      'FieldGoals2Percent',
      'FieldGoalsMade3',
      'FieldGoalsAttempted3',
      'FieldGoals3Percent',
      'FieldGoalsMadeTotal',
      'FieldGoalsAttemptedTotal',
      'FieldGoalsPercent',
      'AccuracyMade',
      'AccuracyAttempted',
      'AccuracyPercent',
      'AssistancesTurnoversRatio',
      'GamesPlayed',
      'GamesStarted',
      'TimePlayed',
      'Contras',
      'Dunks',
      'OffensiveReboundPercentage',
      'DefensiveReboundPercentage',
      'ReboundPercentage',
      'EffectiveFieldGoalPercentage',
      'TrueShootingPercentage',
      'AssistRatio',
      'TurnoverRatio',
      'FieldGoals2AttemptedRatio',
      'FieldGoals3AttemptedRatio',
      'FreeThrowRate',
      'Possesions',
      'GamesWon',
      'GamesLost',
      'DoubleDoubles',
      'TripleDoubles',
      'FieldGoalsAttempted2Share',
      'FieldGoalsAttempted3Share',
      'FreeThrowsAttemptedShare',
      'FieldGoalsMade2Share',
      'FieldGoalsMade3Share',
      'FreeThrowsMadeShare',
      'PointsMade2Rate',
      'PointsMade3Rate',
      'PointsMadeFreeThrowsRate',
      'PointsAttempted2Rate',
      'PointsAttempted3Rate',
      'Age',
    ],
  })
  @ApiQuery({
    name: 'aggregate',
    required: false,
    enum: [
      'PerGame',
      'Accumulated',
      'PerMinute',
      'Per100Possesions',
    ],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPlayerLeaders(
    @Param('seasonCode') seasonCode: string,
    @Query() query: PlayersLeadersQueryDto,
  ): Promise<PlayersLeadersResponseDto> {
    return this.playersService.getPlayerLeaders(seasonCode, query);
  }

  /**
   * GET /players/season/:seasonCode/:clubCode
   * Get all players for a specific club and season
   */
  @Get('season/:seasonCode/:clubCode')
  async getPlayersByClub(
    @Param('seasonCode') seasonCode: string,
    @Param('clubCode') clubCode: string,
  ): Promise<PlayerDto[]> {
    return this.playersService.getPlayersByClub(seasonCode, clubCode);
  }

  /**
   * GET /players/:seasonCode/:playerCode
   * Get a player by code for a specific season
   */
  @Get(':seasonCode/:playerCode')
  async getPlayerByCode(
    @Param('seasonCode') seasonCode: string,
    @Param('playerCode') playerCode: string,
  ): Promise<PlayerDto> {
    return this.playersService.getPlayerByCode(playerCode, seasonCode);
  }

  /**
   * GET /players/:playerCode/stats/:seasonCode
   * Get player statistics for a specific season
   */
  @Get(':playerCode/stats/:seasonCode')
  async getPlayerStats(
    @Param('playerCode') playerCode: string,
    @Param('seasonCode') seasonCode: string,
  ): Promise<PlayerStatsDto> {
    return this.playersService.getPlayerStats(seasonCode, playerCode);
  }

  /**
   * GET /players/:seasonCode/:playerCode/games/boxscores
   * Get all games for a player with full box scores containing only that player
   */
  @Get(':seasonCode/:playerCode/games/boxscores')
  async getPlayerGameBoxScores(
    @Param('seasonCode') seasonCode: string,
    @Param('playerCode') playerCode: string,
  ): Promise<PlayerGameBoxScoresResponseDto> {
    return this.playersService.getPlayerGameBoxScores(seasonCode, playerCode);
  }
}
