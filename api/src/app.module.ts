import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClubsModule } from './clubs/clubs.module';
import { SeasonsModule } from './seasons/seasons.module';
import { RoundsModule } from './rounds/rounds.module';
import { GamesModule } from './games/games.module';
import { TeamsModule } from './teams/teams.module';
import { StandingsModule } from './standings/standings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClubsModule,
    SeasonsModule,
    RoundsModule,
    GamesModule,
    TeamsModule,
    StandingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
