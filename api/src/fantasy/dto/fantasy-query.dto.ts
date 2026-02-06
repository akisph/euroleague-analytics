import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FantasyPlayersStatsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['tot', 'avg'])
  statsType?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  weeks?: number[];
}

export class FantasyTeamsPirAllowedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statsId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number;
}
