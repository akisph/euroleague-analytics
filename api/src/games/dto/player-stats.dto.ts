import { IsString, IsOptional, IsNumber } from 'class-validator';

export class PlayerStatsDto {
  @IsString()
  @IsOptional()
  playerCode?: string;

  @IsString()
  @IsOptional()
  playerName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  minutes?: number;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  rebounds?: number;

  @IsNumber()
  @IsOptional()
  assists?: number;

  @IsNumber()
  @IsOptional()
  steals?: number;

  @IsNumber()
  @IsOptional()
  blocks?: number;

  @IsNumber()
  @IsOptional()
  turnovers?: number;

  @IsNumber()
  @IsOptional()
  fouls?: number;

  @IsNumber()
  @IsOptional()
  valuation?: number;
}

export default PlayerStatsDto;
