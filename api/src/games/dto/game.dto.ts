import { IsNumber, IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class GameDto {
  @IsNumber()
  gameCode: number;

  @IsString()
  seasonCode: string;

  @IsNumber()
  @IsOptional()
  roundNumber?: number;

  @IsString()
  @IsOptional()
  phaseTypeCode?: string;

  @IsString()
  @IsOptional()
  phaseTypeName?: string;

  @IsDateString()
  @IsOptional()
  gameDate?: string;

  @IsString()
  @IsOptional()
  homeTeamCode?: string;

  @IsString()
  @IsOptional()
  homeTeamName?: string;

  @IsNumber()
  @IsOptional()
  homeScore?: number;

  @IsString()
  @IsOptional()
  awayTeamCode?: string;

  @IsString()
  @IsOptional()
  awayTeamName?: string;

  @IsNumber()
  @IsOptional()
  awayScore?: number;

  @IsBoolean()
  @IsOptional()
  played?: boolean;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  arena?: string;

  @IsNumber()
  @IsOptional()
  attendance?: number;

  @IsString()
  @IsOptional()
  groupCode?: string;

  @IsString()
  @IsOptional()
  groupName?: string;
}
