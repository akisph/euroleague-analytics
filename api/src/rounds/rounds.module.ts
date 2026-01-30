import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';

@Module({
  imports: [HttpModule],
  controllers: [RoundsController],
  providers: [RoundsService],
  exports: [RoundsService],
})
export class RoundsModule {}
