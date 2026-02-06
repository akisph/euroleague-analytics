import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FantasyController } from './fantasy.controller';
import { FantasyService } from './fantasy.service';

@Module({
  imports: [HttpModule],
  controllers: [FantasyController],
  providers: [FantasyService],
  exports: [FantasyService],
})
export class FantasyModule {}
