import { IsOptional, IsNumber, IsString, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class TeamTotalsDto {
  @IsNumber()
  @IsOptional()
  score?: number;

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
}

export class GameStatsDto {
  @IsObject()
  @IsOptional()
  local?: any;

  @IsObject()
  @IsOptional()
  road?: any;

  @ValidateNested()
  @Type(() => TeamTotalsDto)
  @IsOptional()
  totals?: TeamTotalsDto;

  @IsArray()
  @IsOptional()
  players?: any[];
}

export default GameStatsDto;
