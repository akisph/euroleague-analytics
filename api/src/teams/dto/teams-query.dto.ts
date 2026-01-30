import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class TeamsQueryDto {
  @IsString()
  seasonCode: string;

  @IsString()
  @IsOptional()
  competitionCode?: string;

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
