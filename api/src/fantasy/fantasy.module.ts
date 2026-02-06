import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FantasyController } from './fantasy.controller';
import { FantasyService } from './fantasy.service';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [HttpModule, TeamsModule],
  controllers: [FantasyController],
  providers: [FantasyService],
  exports: [FantasyService],
})
export class FantasyModule {}
