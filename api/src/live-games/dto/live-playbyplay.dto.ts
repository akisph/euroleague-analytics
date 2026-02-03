import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LivePlayDto } from './live-play.dto';

export class LivePlayByPlayDto {
  @IsBoolean()
  isLive: boolean;

  @IsString()
  @IsOptional()
  teamA?: string;

  @IsString()
  @IsOptional()
  teamB?: string;

  @IsString()
  @IsOptional()
  codeTeamA?: string;

  @IsString()
  @IsOptional()
  codeTeamB?: string;

  @IsInt()
  @IsOptional()
  actualQuarter?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivePlayDto)
  @IsOptional()
  firstQuarter?: LivePlayDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivePlayDto)
  @IsOptional()
  secondQuarter?: LivePlayDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivePlayDto)
  @IsOptional()
  thirdQuarter?: LivePlayDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivePlayDto)
  @IsOptional()
  fourthQuarter?: LivePlayDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivePlayDto)
  @IsOptional()
  extraTime?: LivePlayDto[] | null;
}
