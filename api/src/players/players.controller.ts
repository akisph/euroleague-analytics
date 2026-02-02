import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { PlayerDto, PlayersListResponseDto, PlayersQueryDto, PlayerStatsDto } from './dto';

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
   * GET /players/:playerCode
   * Get a player by code
   */
  @Get(':playerCode')
  async getPlayerByCode(@Param('playerCode') playerCode: string): Promise<PlayerDto> {
    return this.playersService.getPlayerByCode(playerCode);
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
}
