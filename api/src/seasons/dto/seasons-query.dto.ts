import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SeasonsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  competitionYear?: number;

  @IsOptional()
  search?: string;
}
