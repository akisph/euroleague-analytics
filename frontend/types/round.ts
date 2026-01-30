// Round type
export interface Round {
  roundNumber: number
  seasonCode: string
  phaseCode?: string
  phaseName?: string
  gamesCount?: number
  startDate?: string
  endDate?: string
  groupCode?: string
  groupName?: string
}

// Rounds query parameters
export interface RoundsQueryParams {
  seasonCode: string
  phaseCode?: string
}
