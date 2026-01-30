// Player type
export interface Player {
  playerCode: string
  name: string
  alias?: string
  dorsal?: number
  position?: string
  countryCode?: string
  countryName?: string
  imageUrl?: string
  height?: number
  birthDate?: string
}

// Roster type
export interface Roster {
  clubCode: string
  clubName: string
  seasonCode: string
  coachCode?: string
  coachName?: string
  players?: Player[]
  playersCount?: number
}

// Teams query parameters
export interface TeamsQueryParams {
  seasonCode: string
  clubCode?: string
}
