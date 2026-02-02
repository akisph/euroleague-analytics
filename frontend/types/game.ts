// Game type
export interface Game {
  gameCode: number
  seasonCode: string
  roundNumber?: number
  phaseTypeCode?: string
  phaseTypeName?: string
  gameDate?: string
  homeTeamCode?: string
  homeTeamName?: string
  homeTeamImage?: string
  homeScore?: number
  awayTeamCode?: string
  awayTeamName?: string
  awayTeamImage?: string
  awayScore?: number
  played?: boolean
  status?: string
  arena?: string
  attendance?: number
  groupCode?: string
  groupName?: string
}

// Games Query Parameters
export interface GamesQueryParams {
  roundNumber?: number
  phaseTypeCode?: string
  groupName?: string
  teamCode?: string
}

// Game filter options
export interface GameFilters {
  round?: number
  phase?: string
  team?: string
}
