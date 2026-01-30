// Competition type
export interface Competition {
  code: string
  name: string
}

// Phase Type type
export interface PhaseType {
  code: string
  alias: string
}

// Phase type
export interface Phase {
  phaseType: PhaseType
  roundFrom: number
  roundTo: number
  actualRoundFrom: number
  actualRoundTo: number
}

// Season type
export interface Season {
  code: string
  year: number
  competition: Competition
  active: boolean
  phases: Phase[]
}

// Season List Item type (simplified version for list endpoint)
export interface SeasonListItem {
  code: string
  year: number
  active: boolean
}

// Seasons List Response type
export interface SeasonsListResponse {
  data: SeasonListItem[]
  total: number
}

// Season Club type (Club participating in a specific season)
export interface SeasonClub {
  code: string
  name: string
  alias: string
  tvCode: string
  imageUrl: string
}

// Season Clubs Response type
export interface SeasonClubsResponse {
  data: SeasonClub[]
  total: number
}

// Seasons query parameters
export interface SeasonsQueryParams {
  limit?: number
  offset?: number
  competitionCode?: string
}
