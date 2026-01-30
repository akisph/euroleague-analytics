import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StandingsService } from './standings.service';
import { StandingsController } from './standings.controller';

@Module({
  imports: [HttpModule],
  controllers: [StandingsController],
  providers: [StandingsService],
  exports: [StandingsService],
})
export class StandingsModule {}
