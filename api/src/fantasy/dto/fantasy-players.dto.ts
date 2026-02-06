import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FantasyPlayerStatsDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  teamCode!: string;

  @IsString()
  @IsNotEmpty()
  teamName!: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsString()
  @IsNotEmpty()
  positionId!: string;

  @IsOptional()
  @IsString()
  playerCode?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  cr?: string;

  @IsOptional()
  @IsString()
  pdk?: string;

  @IsOptional()
  @IsString()
  min?: string;

  @IsOptional()
  @IsString()
  pts?: string;
}
