import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LiveBoxscoreByQuarterDto {
  @IsString()
  team: string;

  @IsInt()
  @IsOptional()
  quarter1?: number;

  @IsInt()
  @IsOptional()
  quarter2?: number;

  @IsInt()
  @IsOptional()
  quarter3?: number;

  @IsInt()
  @IsOptional()
  quarter4?: number;
}

export class LiveBoxscorePlayerStatsDto {
  @IsString()
  @IsOptional()
  playerId?: string;

  @IsInt()
  @IsOptional()
  isStarter?: number;

  @IsInt()
  @IsOptional()
  isPlaying?: number;

  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  @IsOptional()
  dorsal?: string;

  @IsString()
  @IsOptional()
  player?: string;

  @IsString()
  @IsOptional()
  minutes?: string;

  @IsInt()
  @IsOptional()
  points?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsMade2?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsAttempted2?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsMade3?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsAttempted3?: number;

  @IsInt()
  @IsOptional()
  freeThrowsMade?: number;

  @IsInt()
  @IsOptional()
  freeThrowsAttempted?: number;

  @IsInt()
  @IsOptional()
  offensiveRebounds?: number;

  @IsInt()
  @IsOptional()
  defensiveRebounds?: number;

  @IsInt()
  @IsOptional()
  totalRebounds?: number;

  @IsInt()
  @IsOptional()
  assistances?: number;

  @IsInt()
  @IsOptional()
  steals?: number;

  @IsInt()
  @IsOptional()
  turnovers?: number;

  @IsInt()
  @IsOptional()
  blocksFavour?: number;

  @IsInt()
  @IsOptional()
  blocksAgainst?: number;

  @IsInt()
  @IsOptional()
  foulsCommited?: number;

  @IsInt()
  @IsOptional()
  foulsReceived?: number;

  @IsInt()
  @IsOptional()
  valuation?: number;

  @IsInt()
  @IsOptional()
  plusMinus?: number;
}

export class LiveBoxscoreTotalsDto {
  @IsString()
  @IsOptional()
  minutes?: string;

  @IsInt()
  @IsOptional()
  points?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsMade2?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsAttempted2?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsMade3?: number;

  @IsInt()
  @IsOptional()
  fieldGoalsAttempted3?: number;

  @IsInt()
  @IsOptional()
  freeThrowsMade?: number;

  @IsInt()
  @IsOptional()
  freeThrowsAttempted?: number;

  @IsInt()
  @IsOptional()
  offensiveRebounds?: number;

  @IsInt()
  @IsOptional()
  defensiveRebounds?: number;

  @IsInt()
  @IsOptional()
  totalRebounds?: number;

  @IsInt()
  @IsOptional()
  assistances?: number;

  @IsInt()
  @IsOptional()
  steals?: number;

  @IsInt()
  @IsOptional()
  turnovers?: number;

  @IsInt()
  @IsOptional()
  blocksFavour?: number;

  @IsInt()
  @IsOptional()
  blocksAgainst?: number;

  @IsInt()
  @IsOptional()
  foulsCommited?: number;

  @IsInt()
  @IsOptional()
  foulsReceived?: number;

  @IsInt()
  @IsOptional()
  valuation?: number;
}

export class LiveBoxscoreTeamStatsDto {
  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  @IsOptional()
  coach?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LiveBoxscorePlayerStatsDto)
  @IsOptional()
  playersStats?: LiveBoxscorePlayerStatsDto[];

  @ValidateNested()
  @Type(() => LiveBoxscorePlayerStatsDto)
  @IsOptional()
  tmr?: LiveBoxscorePlayerStatsDto;

  @ValidateNested()
  @Type(() => LiveBoxscoreTotalsDto)
  @IsOptional()
  totr?: LiveBoxscoreTotalsDto;
}

export class LiveBoxscoreDto {
  @IsBoolean()
  isLive: boolean;

  @IsString()
  @IsOptional()
  referees?: string;

  @IsInt()
  @IsOptional()
  attendance?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LiveBoxscoreByQuarterDto)
  @IsOptional()
  byQuarter?: LiveBoxscoreByQuarterDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LiveBoxscoreByQuarterDto)
  @IsOptional()
  endOfQuarter?: LiveBoxscoreByQuarterDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LiveBoxscoreTeamStatsDto)
  @IsOptional()
  stats?: LiveBoxscoreTeamStatsDto[];
}
