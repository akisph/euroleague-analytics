import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { RosterDto, PlayerDto } from './dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('season/:seasonCode')
  async getSeasonTeams(
    @Param('seasonCode') seasonCode: string,
  ): Promise<RosterDto[]> {
    return this.teamsService.getSeasonTeams(seasonCode);
  }

  @Get('season/:seasonCode/:clubCode/roster')
  async getTeamRoster(
    @Param('seasonCode') seasonCode: string,
    @Param('clubCode') clubCode: string,
  ): Promise<RosterDto> {
    return this.teamsService.getTeamRoster(seasonCode, clubCode);
  }

  @Get('season/:seasonCode/:clubCode/players')
  async getTeamPlayers(
    @Param('seasonCode') seasonCode: string,
    @Param('clubCode') clubCode: string,
  ): Promise<PlayerDto[]> {
    return this.teamsService.getTeamPlayers(seasonCode, clubCode);
  }

  @Get('season/:seasonCode/:clubCode/stats')
  async getTeamStats(
    @Param('seasonCode') seasonCode: string,
    @Param('clubCode') clubCode: string,
  ): Promise<any> {
    return this.teamsService.getTeamStats(seasonCode, clubCode);
  }

  @Get('player/:playerCode')
  async getPlayerByCode(
    @Param('playerCode') playerCode: string,
  ): Promise<PlayerDto> {
    return this.teamsService.getPlayerByCode(playerCode);
  }
}
