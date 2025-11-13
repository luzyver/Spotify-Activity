export interface SpotifyUser {
  name?: string;
  uri: string;
  imageUrl?: string;
}

export interface SpotifyTrack {
  name: string;
  uri: string;
  imageUrl?: string;
  artist?: {
    name: string;
    uri: string;
  };
  album?: {
    name: string;
    uri: string;
  };
}

export interface NowPlayingBuddy {
  user: SpotifyUser;
  track: SpotifyTrack;
  timestamp: number;
}

export interface HistoryItem {
  userId: string;
  user: string;
  track: string;
  artist: string;
  uri: string;
  imageUrl: string;
  timestamp: number;
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortOption = 'recent' | 'oldest' | 'artist' | 'track';
