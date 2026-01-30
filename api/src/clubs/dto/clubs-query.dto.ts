import { IsOptional, IsInt, IsBoolean, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ClubsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  hasParentClub?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
