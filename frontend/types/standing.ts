// Team Standing type
export interface TeamStanding {
  teamCode: string
  teamName: string
  position: number
  gamesPlayed: number
  wins: number
  losses: number
  pointsFor?: number
  pointsAgainst?: number
  pointDifference?: number
  winStreak?: number
  lastFive?: string
  teamImage?: string
  winPercentage?: number
}

// Standings type
export interface Standings {
  seasonCode: string
  roundNumber: number
  groupCode?: string
  groupName?: string
  phaseCode?: string
  standings?: TeamStanding[]
}

// Standings query parameters
export interface StandingsQueryParams {
  seasonCode: string
  roundNumber: number
  groupId?: string
}
