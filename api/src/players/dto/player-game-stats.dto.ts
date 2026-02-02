import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class PlayerGameStatsDto {
  @IsNumber()
  gameCode: number;

  @IsDateString()
  date: string;

  @IsString()
  opponentTeam: string;

  @IsString()
  opponentTeamCode: string;

  @IsString()
  homeAway: 'H' | 'A'; // H for Home, A for Away

  @IsString()
  result: 'W' | 'L'; // W for Win, L for Loss

  // Team scores
  @IsNumber()
  playerTeamScore: number;

  @IsNumber()
  opponentTeamScore: number;

  // Player stats
  @IsNumber()
  @IsOptional()
  minutes?: number;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  fieldGoalsMade2?: number;

  @IsNumber()
  @IsOptional()
  fieldGoalsAttempted2?: number;

  @IsNumber()
  @IsOptional()
  fieldGoalsMade3?: number;

  @IsNumber()
  @IsOptional()
  fieldGoalsAttempted3?: number;

  @IsNumber()
  @IsOptional()
  freeThrowsMade?: number;

  @IsNumber()
  @IsOptional()
  freeThrowsAttempted?: number;

  @IsNumber()
  @IsOptional()
  totalRebounds?: number;

  @IsNumber()
  @IsOptional()
  defensiveRebounds?: number;

  @IsNumber()
  @IsOptional()
  offensiveRebounds?: number;

  @IsNumber()
  @IsOptional()
  assistances?: number;

  @IsNumber()
  @IsOptional()
  steals?: number;

  @IsNumber()
  @IsOptional()
  turnovers?: number;

  @IsNumber()
  @IsOptional()
  blocksFavour?: number;

  @IsNumber()
  @IsOptional()
  blocksAgainst?: number;

  @IsNumber()
  @IsOptional()
  foulsCommited?: number;

  @IsNumber()
  @IsOptional()
  foulsReceived?: number;

  @IsString()
  @IsOptional()
  twoPointShootingPercentage?: string;

  @IsString()
  @IsOptional()
  threePointShootingPercentage?: string;

  @IsString()
  @IsOptional()
  freeThrowShootingPercentage?: string;

  @IsNumber()
  @IsOptional()
  valuation?: number;
}

export class PlayerGamesListResponseDto {
  games: PlayerGameStatsDto[];
  total: number;
}
