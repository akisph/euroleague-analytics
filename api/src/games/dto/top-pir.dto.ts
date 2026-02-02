import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class TopPirPlayerDto {
  @IsString()
  playerCode: string;

  @IsString()
  playerName: string;

  @IsNumber()
  pir: number;

  @IsNumber()
  @IsOptional()
  pirAverage?: number;

  @IsString()
  @IsOptional()
  teamCode?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  stats?: Record<string, any>;
}

export class TopPirResponseDto {
  @IsString()
  @IsOptional()
  homeTeamCode?: string;

  @IsString()
  @IsOptional()
  awayTeamCode?: string;

  @IsArray()
  homeTopPlayers: TopPirPlayerDto[];

  @IsArray()
  awayTopPlayers: TopPirPlayerDto[];
}
