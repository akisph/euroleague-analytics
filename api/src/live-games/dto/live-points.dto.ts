import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LivePointRowDto {
  @IsInt()
  @IsOptional()
  numAnot?: number;

  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  @IsOptional()
  playerId?: string;

  @IsString()
  @IsOptional()
  player?: string;

  @IsString()
  @IsOptional()
  actionId?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsInt()
  @IsOptional()
  points?: number;

  @IsInt()
  @IsOptional()
  coordX?: number;

  @IsInt()
  @IsOptional()
  coordY?: number;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  fastbreak?: string;

  @IsString()
  @IsOptional()
  secondChance?: string;

  @IsString()
  @IsOptional()
  pointsOffTurnover?: string;

  @IsInt()
  @IsOptional()
  minute?: number;

  @IsString()
  @IsOptional()
  console?: string;

  @IsInt()
  @IsOptional()
  pointsA?: number;

  @IsInt()
  @IsOptional()
  pointsB?: number;

  @IsString()
  @IsOptional()
  utc?: string;
}

export class LivePointsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivePointRowDto)
  @IsOptional()
  rows?: LivePointRowDto[];
}
