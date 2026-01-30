import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { GameDto } from './dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('season/:seasonCode')
  async getSeasonGames(
    @Param('seasonCode') seasonCode: string,
    @Query('roundNumber') roundNumber?: number,
    @Query('phaseTypeCode') phaseTypeCode?: string,
    @Query('groupName') groupName?: string,
    @Query('teamCode') teamCode?: string,
  ): Promise<GameDto[]> {
    const filters = {
      roundNumber,
      phaseTypeCode,
      groupName,
      teamCode,
    };
    return this.gamesService.getSeasonGames(seasonCode, filters);
  }

  @Get('season/:seasonCode/:gameCode')
  async getGameDetails(
    @Param('seasonCode') seasonCode: string,
    @Param('gameCode') gameCode: number,
  ): Promise<GameDto> {
    return this.gamesService.getGameDetails(seasonCode, gameCode);
  }

  @Get('season/:seasonCode/team/:teamCode')
  async getGamesByTeam(
    @Param('seasonCode') seasonCode: string,
    @Param('teamCode') teamCode: string,
  ): Promise<GameDto[]> {
    return this.gamesService.getGamesByTeam(seasonCode, teamCode);
  }

  @Get('season/:seasonCode/round/:roundNumber')
  async getGamesByRound(
    @Param('seasonCode') seasonCode: string,
    @Param('roundNumber') roundNumber: number,
  ): Promise<GameDto[]> {
    return this.gamesService.getGamesByRound(seasonCode, roundNumber);
  }
}
