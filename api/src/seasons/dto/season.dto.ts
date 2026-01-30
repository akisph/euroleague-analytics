// Competition DTO
export class CompetitionDto {
  code: string;
  name: string;
}

// Phase Type DTO
export class PhaseTypeDto {
  code: string;
  alias: string;
}

// Phase DTO
export class PhaseDto {
  phaseType: PhaseTypeDto;
  roundFrom: number;
  roundTo: number;
  actualRoundFrom: number;
  actualRoundTo: number;
}

// Season DTO
export class SeasonDto {
  code: string;
  year: number;
  competition: CompetitionDto;
  active: boolean;
  phases: PhaseDto[];
}

// Season List Item DTO (simplified version for list endpoint)
export class SeasonListItemDto {
  code: string;
  year: number;
  active: boolean;
}

// Seasons List Response DTO
export class SeasonsListResponseDto {
  data: SeasonListItemDto[];
  total: number;
}

// Season Club DTO (Club participating in a specific season)
export class SeasonClubDto {
  code: string;
  name: string;
  alias: string;
  tvCode: string;
  imageUrl: string;
}

// Season Clubs Response DTO
export class SeasonClubsResponseDto {
  data: SeasonClubDto[];
  total: number;
}
