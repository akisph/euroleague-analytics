import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FantasyService } from './fantasy.service';
import {
  FantasyPlayersStatsQueryDto,
  FantasyTeamsPirAllowedQueryDto,
} from './dto';

@ApiTags('Fantasy')
@Controller('fantasy/season/:seasonCode')
export class FantasyController {
  constructor(private readonly fantasyService: FantasyService) {}

  @Get('health')
  @ApiParam({ name: 'seasonCode', required: true, type: String })
  getHealth(): { status: 'ok' } {
    return this.fantasyService.getHealth();
  }

  @Get('players/stats')
  @ApiParam({ name: 'seasonCode', required: true, type: String })
  @ApiQuery({ name: 'statsType', required: false, enum: ['tot', 'avg'] })
  @ApiQuery({ name: 'weeks[]', required: false, type: [Number] })
  async getPlayersStats(
    @Param('seasonCode') seasonCode: string,
    @Query() query: FantasyPlayersStatsQueryDto,
  ): Promise<any[]> {
    return this.fantasyService.getPlayersStats(seasonCode, query);
  }

  @Get('teams/pir-allowed')
  @ApiParam({ name: 'seasonCode', required: true, type: String })
  @ApiQuery({ name: 'statsId', required: false, type: Number })
  @ApiQuery({ name: 'positionId', required: false, type: Number })
  async getTeamsPirAllowed(
    @Param('seasonCode') seasonCode: string,
    @Query() query: FantasyTeamsPirAllowedQueryDto,
  ): Promise<any[]> {
    return this.fantasyService.getTeamsPirAllowed(seasonCode, query);
  }
}
