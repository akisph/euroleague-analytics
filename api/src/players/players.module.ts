import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';

@Module({
  imports: [HttpModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
