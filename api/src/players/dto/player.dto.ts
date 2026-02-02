import { IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayerStatsDto {
  @IsNumber()
  @IsOptional()
  gamesPlayed?: number;

  @IsNumber()
  @IsOptional()
  gamesStarted?: number;

  @IsNumber()
  @IsOptional()
  timePlayed?: number;

  @IsNumber()
  @IsOptional()
  valuation?: number;

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
  fieldGoalsMadeTotal?: number;

  @IsNumber()
  @IsOptional()
  fieldGoalsAttemptedTotal?: number;

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

  @IsNumber()
  @IsOptional()
  plusMinus?: number;

  @IsString()
  @IsOptional()
  threePointShootingPercentage?: string;

  @IsString()
  @IsOptional()
  twoPointShootingPercentage?: string;

  @IsString()
  @IsOptional()
  freeThrowShootingPercentage?: string;
}

export class PlayerDto {
  @IsString()
  playerCode: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  aliasRaw?: string;

  @IsString()
  @IsOptional()
  passportName?: string;

  @IsString()
  @IsOptional()
  passportSurname?: string;

  @IsString()
  @IsOptional()
  jerseyName?: string;

  @IsString()
  @IsOptional()
  abbreviatedName?: string;

  @IsNumber()
  @IsOptional()
  dorsal?: number;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  countryName?: string;

  @IsString()
  @IsOptional()
  birthCountryCode?: string;

  @IsString()
  @IsOptional()
  birthCountryName?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  headshotImageUrl?: string;

  @IsString()
  @IsOptional()
  actionImageUrl?: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  twitterAccount?: string;

  @IsString()
  @IsOptional()
  instagramAccount?: string;

  @IsString()
  @IsOptional()
  facebookAccount?: string;

  @IsString()
  @IsOptional()
  clubCode?: string;

  @IsString()
  @IsOptional()
  clubName?: string;

  @ValidateNested()
  @Type(() => PlayerStatsDto)
  @IsOptional()
  stats?: PlayerStatsDto;
}

export class PlayersListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerDto)
  data: PlayerDto[];

  @IsNumber()
  total: number;
}

export class PlayersListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerDto)
  players: PlayerDto[];

  @IsNumber()
  total: number;
}
