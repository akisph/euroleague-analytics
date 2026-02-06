import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FantasyPlayersStatsQueryDto, FantasyTeamsPirAllowedQueryDto } from './dto';

@Injectable()
export class FantasyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }

  async getPlayersStats(
    seasonCode: string,
    query: FantasyPlayersStatsQueryDto,
  ): Promise<any[]> {
    const seasonId = this.mapSeasonCodeToSeasonId(seasonCode);
    const defaultDates = this.getDefaultSeasonDateRange(seasonCode);
    const params: Record<string, string | number | string[]> = {
      season_id: seasonId,
      mode: 'nba',
      stats_type: query.statsType ?? 'avg',
    };
    params.date_from = query.dateFrom ?? defaultDates.from;
    params.date_to = query.dateTo ?? defaultDates.to;
    if (query.weeks && query.weeks.length > 0) {
      params['weeks[]'] = query.weeks.map((w) => w.toString());
    }

    const response = await firstValueFrom(
      this.httpService.get('https://www.dunkest.com/api/stats/table', { params }),
    );
    return response.data ?? [];
  }

  async getTeamsPirAllowed(
    seasonCode: string,
    query: FantasyTeamsPirAllowedQueryDto,
  ): Promise<any[]> {
    const seasonId = this.mapSeasonCodeToSeasonId(seasonCode);
    const params: Record<string, string | number> = {
      season_id: seasonId,
      stats_id: query.statsId ?? 25,
      position_id: query.positionId ?? 1,
    };

    const response = await firstValueFrom(
      this.httpService.get('https://www.dunkest.com/api/stats/defense-vs-position', {
        params,
      }),
    );
    return response.data ?? [];
  }

  private mapSeasonCodeToSeasonId(seasonCode: string): number {
    const endYear = Number(seasonCode.replace('E', ''));
    if (Number.isNaN(endYear)) {
      return 0;
    }
    // Draft mapping rule: Dunkest season_id = endYear - 2002 (E2025 -> 23)
    return endYear - 2002;
  }

  private getDefaultSeasonDateRange(seasonCode: string): { from: string; to: string } {
    const endYear = Number(seasonCode.replace('E', ''));
    if (Number.isNaN(endYear)) {
      return { from: '1970-01-01', to: '1970-01-02' };
    }
    return {
      from: `${endYear}-09-15`,
      to: `${endYear + 1}-06-15`,
    };
  }
}
