import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StandingsService } from './standings.service';
import { StandingsDto } from './dto';

@ApiTags('Standings')
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get('season/:seasonCode/round/:roundNumber')
  async getSeasonStandings(
    @Param('seasonCode') seasonCode: string,
    @Param('roundNumber') roundNumber: number,
  ): Promise<StandingsDto[]> {
    return this.standingsService.getSeasonStandings(seasonCode, roundNumber);
  }

  @Get('season/:seasonCode/round/:roundNumber/group/:groupId')
  async getGroupStandings(
    @Param('seasonCode') seasonCode: string,
    @Param('roundNumber') roundNumber: number,
    @Param('groupId') groupId: string,
  ): Promise<StandingsDto> {
    return this.standingsService.getGroupStandings(seasonCode, roundNumber, groupId);
  }
}
