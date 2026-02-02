import { IsString, IsNumber, IsOptional } from 'class-validator';

export class TeamStandingDto {
  @IsString()
  teamCode: string;

  @IsString()
  teamName: string;

  @IsNumber()
  position: number;

  @IsNumber()
  gamesPlayed: number;

  @IsNumber()
  wins: number;

  @IsNumber()
  losses: number;

  @IsNumber()
  @IsOptional()
  pointsFor?: number;

  @IsNumber()
  @IsOptional()
  pointsAgainst?: number;

  @IsNumber()
  @IsOptional()
  pointDifference?: number;

  @IsNumber()
  @IsOptional()
  winStreak?: number;

  @IsString()
  @IsOptional()
  lastFive?: string;

  @IsString()
  @IsOptional()
  teamImage?: string;

  @IsNumber()
  @IsOptional()
  winPercentage?: number;
}

export class StandingsDto {
  @IsString()
  seasonCode: string;

  @IsNumber()
  roundNumber: number;

  @IsString()
  @IsOptional()
  groupCode?: string;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsString()
  @IsOptional()
  phaseCode?: string;

  standings?: TeamStandingDto[];
}
