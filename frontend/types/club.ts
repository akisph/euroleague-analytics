// Country type
export interface Country {
  code: string
  name: string
}

// Venue Images type
export interface VenueImages {
  [key: string]: string
}

// Venue type
export interface Venue {
  name: string
  code: string
  capacity: number
  address: string
  images: Record<string, string>
  active: boolean
  notes: string
}

// Club Images type
export interface ClubImages {
  crest?: string
  [key: string]: string | undefined
}

// Main Club type
export interface Club {
  code: string
  name: string
  alias: string
  isVirtual: boolean
  country: Country
  address: string
  website: string
  ticketsUrl: string
  twitterAccount: string
  instagramAccount: string
  facebookAccount: string
  venue: Venue
  venueBackup: Venue | null
  nationalCompetitionCode: string | null
  city: string
  president: string
  phone: string
  fax: string
  images: Record<string, string>
}

// Club List Item type (simplified version for list endpoint)
export interface ClubListItem {
  code: string
  name: string
  alias: string
  isVirtual: boolean
  country: Country
  images: Record<string, string>
}

// Clubs List Response type
export interface ClubsListResponse {
  data: ClubListItem[]
  total: number
}

// Club Info Response type
export interface ClubInfoResponse {
  info: string
}

// Clubs Query Parameters
export interface ClubsQueryParams {
  limit?: number
  offset?: number
  hasParentClub?: boolean
  search?: string
}
