// Player type
export interface Player {
  playerCode: string
  name: string
  alias?: string
  aliasRaw?: string
  passportName?: string
  passportSurname?: string
  jerseyName?: string
  abbreviatedName?: string
  dorsal?: number
  position?: string
  countryCode?: string
  countryName?: string
  birthCountryCode?: string
  birthCountryName?: string
  imageUrl?: string
  height?: number
  weight?: number
  birthDate?: string
  twitterAccount?: string
  instagramAccount?: string
  facebookAccount?: string
  clubCode?: string
  clubName?: string
  stats?: PlayerStats
}

export interface PlayerStats {
  gamesPlayed?: number
  gamesStarted?: number
  timePlayed?: number
  valuation?: number
  points?: number
  fieldGoalsMade2?: number
  fieldGoalsAttempted2?: number
  fieldGoalsMade3?: number
  fieldGoalsAttempted3?: number
  freeThrowsMade?: number
  freeThrowsAttempted?: number
  offensiveRebounds?: number
  defensiveRebounds?: number
  totalRebounds?: number
  assistances?: number
  steals?: number
  turnovers?: number
  blocksAgainst?: number
  blocksFavour?: number
  foulsCommited?: number
  foulsReceived?: number
  twoPointShootingPercentage?: string
  threePointShootingPercentage?: string
  freeThrowShootingPercentage?: string
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
