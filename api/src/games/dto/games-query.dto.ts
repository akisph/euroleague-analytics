import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class GamesQueryDto {
  @IsString()
  seasonCode: string;

  @IsString()
  @IsOptional()
  competitionCode?: string;

  @IsString()
  @IsOptional()
  phaseTypeCode?: string;

  @IsNumber()
  @IsOptional()
  roundNumber?: number;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsString()
  @IsOptional()
  teamCode?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
