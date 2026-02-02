import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayersQueryDto {
  @IsOptional()
  @IsString()
  seasonCode?: string;

  @IsOptional()
  @IsString()
  clubCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
