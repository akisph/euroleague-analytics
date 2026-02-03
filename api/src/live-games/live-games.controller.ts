import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LiveGamesService } from './live-games.service';
import { LiveBoxscoreDto, LivePlayByPlayDto, LivePointsDto } from './dto';

@ApiTags('LiveGames')
@Controller('live-games')
export class LiveGamesController {
  constructor(private readonly liveGamesService: LiveGamesService) {}

  @Get('season/:seasonCode/:gameCode/playbyplay')
  async getPlayByPlay(
    @Param('seasonCode') seasonCode: string,
    @Param('gameCode') gameCode: number,
  ): Promise<LivePlayByPlayDto> {
    return this.liveGamesService.getPlayByPlay(seasonCode, gameCode);
  }

  @Get('season/:seasonCode/:gameCode/boxscore')
  async getBoxscore(
    @Param('seasonCode') seasonCode: string,
    @Param('gameCode') gameCode: number,
  ): Promise<LiveBoxscoreDto> {
    return this.liveGamesService.getBoxscore(seasonCode, gameCode);
  }

  @Get('season/:seasonCode/:gameCode/points')
  async getPoints(
    @Param('seasonCode') seasonCode: string,
    @Param('gameCode') gameCode: number,
  ): Promise<LivePointsDto> {
    return this.liveGamesService.getPoints(seasonCode, gameCode);
  }
}
