import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class RoundsQueryDto {
  @IsString()
  seasonCode: string;

  @IsString()
  @IsOptional()
  competitionCode?: string;

  @IsString()
  @IsOptional()
  phaseCode?: string;

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
