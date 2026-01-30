// Country DTO
export class CountryDto {
  code: string;
  name: string;
}

// Venue Images DTO
export class VenueImagesDto {
  [key: string]: string;
}

// Venue DTO
export class VenueDto {
  name: string;
  code: string;
  capacity: number;
  address: string;
  images: Record<string, string>;
  active: boolean;
  notes: string;
}

// Club Images DTO
export class ClubImagesDto {
  crest?: string;
  [key: string]: string | undefined;
}

// Main Club DTO
export class ClubDto {
  code: string;
  name: string;
  alias: string;
  isVirtual: boolean;
  country: CountryDto;
  address: string;
  website: string;
  ticketsUrl: string;
  twitterAccount: string;
  instagramAccount: string;
  facebookAccount: string;
  venue: VenueDto;
  venueBackup: VenueDto | null;
  nationalCompetitionCode: string | null;
  city: string;
  president: string;
  phone: string;
  fax: string;
  images: Record<string, string>;
}

// Club List Item DTO (simplified version for list endpoint)
export class ClubListItemDto {
  code: string;
  name: string;
  alias: string;
  isVirtual: boolean;
  country: CountryDto;
  images: Record<string, string>;
}

// Clubs List Response DTO
export class ClubsListResponseDto {
  data: ClubListItemDto[];
  total: number;
}

// Club Info Response DTO
export class ClubInfoResponseDto {
  info: string;
}
