import { IsNumber, IsOptional, IsString, IsArray, IsDateString, IsBoolean } from 'class-validator';

export class PersonDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  aliasRaw?: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  country?: any;

  @IsString()
  @IsOptional()
  birthCountry?: any;

  @IsString()
  @IsOptional()
  passportName?: string;

  @IsString()
  @IsOptional()
  passportSurname?: string;

  @IsString()
  @IsOptional()
  jerseyName?: string;

  @IsOptional()
  images?: any;
}

export class PlayerPersonDto {
  @IsOptional()
  person?: PersonDto;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  typeName?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  dorsal?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  positionName?: string;

  @IsOptional()
  club?: any;

  @IsOptional()
  images?: any;
}

export class PlayerStatsFieldsDto {
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
  dorsal?: string;

  @IsBoolean()
  @IsOptional()
  startFive?: boolean;
}

export class TeamPlayerDto {
  @IsOptional()
  player?: PlayerPersonDto;

  @IsOptional()
  stats?: PlayerStatsFieldsDto;
}

export class TeamBoxScoreDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  score: number;

  @IsArray()
  @IsOptional()
  players?: TeamPlayerDto[];

  @IsOptional()
  coach?: any;
}

export class GameBoxScoreDto {
  @IsNumber()
  gameCode: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsOptional()
  local?: TeamBoxScoreDto;

  @IsOptional()
  road?: TeamBoxScoreDto;
}

export class PlayerGameBoxScoresResponseDto {
  games: GameBoxScoreDto[];
  total: number;
}
