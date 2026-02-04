export interface PlayerLeaderDto {
  playerCode?: string;
  name?: string;
  clubCode?: string;
  imageUrl?: string;
  value: number;
}

export interface PlayersLeadersResponseDto {
  seasonCode: string;
  roundNumber?: number | null;
  category?: string;
  aggregate?: string;
  limit?: number;
  leaders?: PlayerLeaderDto[];
  categories?: {
    pir: PlayerLeaderDto[];
    points: PlayerLeaderDto[];
    rebounds: PlayerLeaderDto[];
    assists: PlayerLeaderDto[];
    minutes: PlayerLeaderDto[];
  };
}
