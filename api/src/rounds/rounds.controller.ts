import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoundsService } from './rounds.service';
import { RoundDto } from './dto';

@ApiTags('Rounds')
@Controller('rounds')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get('season/:seasonCode')
  async getSeasonRounds(
    @Param('seasonCode') seasonCode: string,
  ): Promise<RoundDto[]> {
    return this.roundsService.getSeasonRounds(seasonCode);
  }

  @Get('season/:seasonCode/:roundNumber')
  async getRoundDetails(
    @Param('seasonCode') seasonCode: string,
    @Param('roundNumber') roundNumber: number,
  ): Promise<RoundDto> {
    return this.roundsService.getRoundDetails(seasonCode, roundNumber);
  }

  @Get('season/:seasonCode/phase/:phaseCode')
  async getRoundsByPhase(
    @Param('seasonCode') seasonCode: string,
    @Param('phaseCode') phaseCode: string,
  ): Promise<RoundDto[]> {
    return this.roundsService.getRoundsByPhase(seasonCode, phaseCode);
  }
}
