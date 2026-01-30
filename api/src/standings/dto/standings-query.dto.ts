import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class StandingsQueryDto {
  @IsString()
  seasonCode: string;

  @IsNumber()
  roundNumber: number;

  @IsString()
  @IsOptional()
  competitionCode?: string;

  @IsString()
  @IsOptional()
  phaseTypeCode?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}
