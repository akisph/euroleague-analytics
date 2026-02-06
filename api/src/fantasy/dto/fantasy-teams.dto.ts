import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FantasyTeamPirAllowedDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  l3?: string;

  @IsOptional()
  @IsString()
  l5?: string;

  @IsOptional()
  @IsString()
  l10?: string;

  @IsOptional()
  @IsString()
  all?: string;
}
