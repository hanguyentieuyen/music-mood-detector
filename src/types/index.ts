// src/types/index.ts

export interface SentimentResult {
  label: string;
  score: number;
}

export interface MoodAnalysis {
  mood: string;
  confidence: number;
  energy: number; // 0-1
  valence: number; // 0-1 (negative to positive)
  description: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface MoodProfile {
  genres: string[];
  energy: number;
  valence: number;
  acousticness: number;
  danceability: number;
  tempo: number;
}

export interface PlaylistResult {
  tracks: SpotifyTrack[];
  mood: MoodAnalysis;
  timestamp: string;
}
