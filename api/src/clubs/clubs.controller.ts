import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import {
  ClubDto,
  ClubsListResponseDto,
  ClubInfoResponseDto,
  ClubsQueryDto,
} from './dto';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}
 
  /**
   * GET /clubs
   * Get all registered clubs
   */
  @Get()
  async getAllClubs(@Query() query: ClubsQueryDto): Promise<ClubsListResponseDto> {
    return this.clubsService.getAllClubs(query);
  }

  /**
   * GET /clubs/:clubCode
   * Get a club by its code
   */
  @Get(':clubCode')
  async getClubByCode(@Param('clubCode') clubCode: string): Promise<ClubDto> {
    return this.clubsService.getClubByCode(clubCode);
  }

  /**
   * GET /v3/clubs/:clubCode/info
   * Get club info/history by its code
   */
  @Get(':clubCode/info')
  async getClubInfo(@Param('clubCode') clubCode: string): Promise<ClubInfoResponseDto> {
    return this.clubsService.getClubInfo(clubCode);
  }
}
