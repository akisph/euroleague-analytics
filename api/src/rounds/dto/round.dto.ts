import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class RoundDto {
  @IsNumber()
  roundNumber: number;

  @IsString()
  seasonCode: string;

  @IsString()
  @IsOptional()
  phaseCode?: string;

  @IsString()
  @IsOptional()
  phaseName?: string;

  @IsNumber()
  @IsOptional()
  gamesCount?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  groupCode?: string;

  @IsString()
  @IsOptional()
  groupName?: string;
}
