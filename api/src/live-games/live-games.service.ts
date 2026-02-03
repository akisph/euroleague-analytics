import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LiveBoxscoreDto, LivePlayByPlayDto, LivePointsDto } from './dto';

@Injectable()
export class LiveGamesService {
  private readonly logger = new Logger(LiveGamesService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'EUROLEAGUE_LIVE_API_BASE_URL',
      'https://live.euroleague.net/api',
    );
  }

  private mapPlay(play: any) {
    if (!play) return {};
    return {
      type: play.TYPE,
      numberOfPlay: play.NUMBEROFPLAY,
      codeTeam: play.CODETEAM,
      playerId: play.PLAYER_ID,
      playType: play.PLAYTYPE,
      player: play.PLAYER,
      team: play.TEAM,
      dorsal: play.DORSAL,
      minute: play.MINUTE,
      markerTime: play.MARKERTIME,
      pointsA: play.POINTS_A,
      pointsB: play.POINTS_B,
      comment: play.COMMENT,
      playInfo: play.PLAYINFO,
    };
  }

  private mapPlays(plays: any): any[] | undefined {
    if (!Array.isArray(plays)) return undefined;
    return plays.map(play => this.mapPlay(play));
  }

  async getPlayByPlay(
    seasonCode: string,
    gameCode: number,
  ): Promise<LivePlayByPlayDto> {
    try {
      this.logger.log(
        `Fetching play-by-play for season ${seasonCode}, game ${gameCode}`,
      );

      const url = `${this.baseUrl}/PlaybyPlay`;
      const params = {
        gamecode: gameCode,
        seasoncode: seasonCode,
      };

      const response = await this.httpService
        .get<any>(url, { params })
        .toPromise();

      const data = response.data || {};

      return {
        isLive: Boolean(data.Live),
        teamA: data.TeamA ?? undefined,
        teamB: data.TeamB ?? undefined,
        codeTeamA: data.CodeTeamA ?? undefined,
        codeTeamB: data.CodeTeamB ?? undefined,
        actualQuarter: data.ActualQuarter ?? undefined,
        firstQuarter: this.mapPlays(data.FirstQuarter),
        secondQuarter: this.mapPlays(data.SecondQuarter),
        thirdQuarter: this.mapPlays(data.ThirdQuarter),
        fourthQuarter: this.mapPlays(data.ForthQuarter),
        extraTime: this.mapPlays(data.ExtraTime) ?? null,
      };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (status === 403) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      if (status === 404) {
        throw new HttpException('Play-by-play not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(
        `Error fetching play-by-play: ${error?.message || error}`,
        error?.stack,
      );
      throw new HttpException(
        'Failed to fetch play-by-play data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapBoxscoreTeam(teams: any): any[] | undefined {
    if (!Array.isArray(teams)) return undefined;
    return teams.map(team => ({
      team: team?.Team ?? undefined,
      coach: team?.Coach ?? undefined,
      playersStats: Array.isArray(team?.PlayersStats)
        ? team.PlayersStats.map((p: any) => ({
            playerId: p?.Player_ID,
            isStarter: p?.IsStarter,
            isPlaying: p?.IsPlaying,
            team: p?.Team,
            dorsal: p?.Dorsal,
            player: p?.Player,
            minutes: p?.Minutes,
            points: p?.Points,
            fieldGoalsMade2: p?.FieldGoalsMade2,
            fieldGoalsAttempted2: p?.FieldGoalsAttempted2,
            fieldGoalsMade3: p?.FieldGoalsMade3,
            fieldGoalsAttempted3: p?.FieldGoalsAttempted3,
            freeThrowsMade: p?.FreeThrowsMade,
            freeThrowsAttempted: p?.FreeThrowsAttempted,
            offensiveRebounds: p?.OffensiveRebounds,
            defensiveRebounds: p?.DefensiveRebounds,
            totalRebounds: p?.TotalRebounds,
            assistances: p?.Assistances,
            steals: p?.Steals,
            turnovers: p?.Turnovers,
            blocksFavour: p?.BlocksFavour,
            blocksAgainst: p?.BlocksAgainst,
            foulsCommited: p?.FoulsCommited,
            foulsReceived: p?.FoulsReceived,
            valuation: p?.Valuation,
            plusMinus: p?.Plusminus,
          }))
        : undefined,
      tmr: team?.tmr
        ? {
            playerId: team.tmr.Player_ID,
            isStarter: team.tmr.IsStarter,
            isPlaying: team.tmr.IsPlaying,
            team: team.tmr.Team,
            dorsal: team.tmr.Dorsal,
            player: team.tmr.Player,
            minutes: team.tmr.Minutes,
            points: team.tmr.Points,
            fieldGoalsMade2: team.tmr.FieldGoalsMade2,
            fieldGoalsAttempted2: team.tmr.FieldGoalsAttempted2,
            fieldGoalsMade3: team.tmr.FieldGoalsMade3,
            fieldGoalsAttempted3: team.tmr.FieldGoalsAttempted3,
            freeThrowsMade: team.tmr.FreeThrowsMade,
            freeThrowsAttempted: team.tmr.FreeThrowsAttempted,
            offensiveRebounds: team.tmr.OffensiveRebounds,
            defensiveRebounds: team.tmr.DefensiveRebounds,
            totalRebounds: team.tmr.TotalRebounds,
            assistances: team.tmr.Assistances,
            steals: team.tmr.Steals,
            turnovers: team.tmr.Turnovers,
            blocksFavour: team.tmr.BlocksFavour,
            blocksAgainst: team.tmr.BlocksAgainst,
            foulsCommited: team.tmr.FoulsCommited,
            foulsReceived: team.tmr.FoulsReceived,
            valuation: team.tmr.Valuation,
            plusMinus: team.tmr.Plusminus,
          }
        : undefined,
      totr: team?.totr
        ? {
            minutes: team.totr.Minutes,
            points: team.totr.Points,
            fieldGoalsMade2: team.totr.FieldGoalsMade2,
            fieldGoalsAttempted2: team.totr.FieldGoalsAttempted2,
            fieldGoalsMade3: team.totr.FieldGoalsMade3,
            fieldGoalsAttempted3: team.totr.FieldGoalsAttempted3,
            freeThrowsMade: team.totr.FreeThrowsMade,
            freeThrowsAttempted: team.totr.FreeThrowsAttempted,
            offensiveRebounds: team.totr.OffensiveRebounds,
            defensiveRebounds: team.totr.DefensiveRebounds,
            totalRebounds: team.totr.TotalRebounds,
            assistances: team.totr.Assistances,
            steals: team.totr.Steals,
            turnovers: team.totr.Turnovers,
            blocksFavour: team.totr.BlocksFavour,
            blocksAgainst: team.totr.BlocksAgainst,
            foulsCommited: team.totr.FoulsCommited,
            foulsReceived: team.totr.FoulsReceived,
            valuation: team.totr.Valuation,
          }
        : undefined,
    }));
  }

  async getBoxscore(
    seasonCode: string,
    gameCode: number,
  ): Promise<LiveBoxscoreDto> {
    try {
      this.logger.log(
        `Fetching boxscore for season ${seasonCode}, game ${gameCode}`,
      );

      const url = `${this.baseUrl}/Boxscore`;
      const params = {
        gamecode: gameCode,
        seasoncode: seasonCode,
      };

      const response = await this.httpService
        .get<any>(url, { params })
        .toPromise();
      const data = response.data || {};

      const mapQuarter = (items: any) => {
        if (!Array.isArray(items)) return undefined;
        return items.map((item: any) => ({
          team: item?.Team ?? '',
          quarter1: item?.Quarter1 ?? undefined,
          quarter2: item?.Quarter2 ?? undefined,
          quarter3: item?.Quarter3 ?? undefined,
          quarter4: item?.Quarter4 ?? undefined,
        }));
      };

      return {
        isLive: Boolean(data.Live),
        referees: data.Referees ?? undefined,
        attendance: data.Attendance ? Number(data.Attendance) : undefined,
        byQuarter: mapQuarter(data.ByQuarter),
        endOfQuarter: mapQuarter(data.EndOfQuarter),
        stats: this.mapBoxscoreTeam(data.Stats),
      };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (status === 403) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      if (status === 404) {
        throw new HttpException('Boxscore not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(
        `Error fetching boxscore: ${error?.message || error}`,
        error?.stack,
      );
      throw new HttpException(
        'Failed to fetch boxscore data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPoints(
    seasonCode: string,
    gameCode: number,
  ): Promise<LivePointsDto> {
    try {
      this.logger.log(`Fetching points for season ${seasonCode}, game ${gameCode}`);

      const url = `${this.baseUrl}/Points`;
      const params = {
        gamecode: gameCode,
        seasoncode: seasonCode,
      };

      const response = await this.httpService
        .get<any>(url, { params })
        .toPromise();
      const data = response.data || {};

      const rows = Array.isArray(data.Rows)
        ? data.Rows.map((row: any) => ({
            numAnot: row?.NUM_ANOT,
            team: row?.TEAM,
            playerId: row?.ID_PLAYER,
            player: row?.PLAYER,
            actionId: row?.ID_ACTION,
            action: row?.ACTION,
            points: row?.POINTS,
            coordX: row?.COORD_X,
            coordY: row?.COORD_Y,
            zone: row?.ZONE,
            fastbreak: row?.FASTBREAK,
            secondChance: row?.SECOND_CHANCE,
            pointsOffTurnover: row?.POINTS_OFF_TURNOVER,
            minute: row?.MINUTE,
            console: row?.CONSOLE,
            pointsA: row?.POINTS_A,
            pointsB: row?.POINTS_B,
            utc: row?.UTC,
          }))
        : undefined;

      return { rows };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (status === 403) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      if (status === 404) {
        throw new HttpException('Points not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(
        `Error fetching points: ${error?.message || error}`,
        error?.stack,
      );
      throw new HttpException(
        'Failed to fetch points data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
