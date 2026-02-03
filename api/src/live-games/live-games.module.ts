import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LiveGamesController } from './live-games.controller';
import { LiveGamesService } from './live-games.service';

@Module({
  imports: [HttpModule],
  controllers: [LiveGamesController],
  providers: [LiveGamesService],
})
export class LiveGamesModule {}
