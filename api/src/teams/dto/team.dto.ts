import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class PlayerDto {
  @IsString()
  playerCode: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsNumber()
  @IsOptional()
  dorsal?: number;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  countryName?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}

export class RosterDto {
  @IsString()
  clubCode: string;

  @IsString()
  clubName: string;

  @IsString()
  seasonCode: string;

  @IsString()
  @IsOptional()
  coachCode?: string;

  @IsString()
  @IsOptional()
  coachName?: string;

  @IsOptional()
  players?: PlayerDto[];

  @IsNumber()
  @IsOptional()
  playersCount?: number;
}
