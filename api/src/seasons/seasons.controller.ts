import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import { SeasonsQueryDto } from './dto';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  private readonly logger = new Logger(SeasonsController.name);

  constructor(private readonly seasonsService: SeasonsService) {}

  /**
   * GET /seasons
   * Get all seasons for competition E
   */
  @Get()
  async getAllSeasons(@Query() query: SeasonsQueryDto) {
    this.logger.log('GET /seasons - Fetching all seasons');
    return this.seasonsService.getAllSeasons(query);
  }

  /**
   * GET /seasons/current
   * Get the current active season
   */
  @Get('current')
  async getCurrentSeason() {
    this.logger.log('GET /seasons/current - Fetching current season');
    return this.seasonsService.getCurrentSeason();
  }

  /**
   * GET /seasons/:seasonCode
   * Get a specific season by code
   */
  @Get(':seasonCode')
  async getSeasonByCode(@Param('seasonCode') seasonCode: string) {
    this.logger.log(`GET /seasons/${seasonCode} - Fetching season details`);
    return this.seasonsService.getSeasonByCode(seasonCode);
  }

  /**
   * GET /seasons/:seasonCode/clubs
   * Get all clubs participating in a specific season
   */
  @Get(':seasonCode/clubs')
  async getSeasonClubs(@Param('seasonCode') seasonCode: string) {
    this.logger.log(`GET /seasons/${seasonCode}/clubs - Fetching season clubs`);
    return this.seasonsService.getSeasonClubs(seasonCode);
  }

  /**
   * GET /seasons/:seasonCode/clubs/:clubCode
   * Get a specific club's details in a season
   */
  @Get(':seasonCode/clubs/:clubCode')
  async getSeasonClubByCode(
    @Param('seasonCode') seasonCode: string,
    @Param('clubCode') clubCode: string,
  ) {
    this.logger.log(
      `GET /seasons/${seasonCode}/clubs/${clubCode} - Fetching club details`,
    );
    return this.seasonsService.getSeasonClubByCode(seasonCode, clubCode);
  }
}
