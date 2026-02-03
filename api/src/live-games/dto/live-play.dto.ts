import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class LivePlayDto {
  @IsInt()
  @IsOptional()
  type?: number;

  @IsInt()
  @IsOptional()
  numberOfPlay?: number;

  @IsString()
  @IsOptional()
  codeTeam?: string;

  @IsString()
  @IsOptional()
  playerId?: string;

  @IsString()
  @IsOptional()
  playType?: string;

  @IsString()
  @IsOptional()
  player?: string;

  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  @IsOptional()
  dorsal?: string;

  @IsInt()
  @IsOptional()
  minute?: number;

  @IsString()
  @IsOptional()
  markerTime?: string;

  @IsNumber()
  @IsOptional()
  pointsA?: number;

  @IsNumber()
  @IsOptional()
  pointsB?: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  playInfo?: string;
}
