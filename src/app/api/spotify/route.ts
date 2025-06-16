import { NextRequest, NextResponse } from "next/server";
import type { MoodAnalysis, SpotifyTrack, MoodProfile } from "@/types";

let accessToken: string | null = null;
let tokenExpiryTime: number = 0;

export async function POST(req: NextRequest) {
  try {
    const { moodAnalysis }: { moodAnalysis: MoodAnalysis } = await req.json();

    const token = await getSpotifyToken();
    if (!token) {
      return NextResponse.json(
        { error: "Failed to authenticate with Spotify" },
        { status: 500 }
      );
    }

    // Map mood to Spotify audio features
    const moodProfile = mapMoodToSpotifyFeatures(moodAnalysis);

    let tracks: SpotifyTrack[] = [];

    tracks = await searchByMoodKeywords(token, moodProfile, moodAnalysis.mood);

    if (tracks.length === 0) {
      tracks = await getTracksFromMoodPlaylists(token, moodAnalysis.mood);
    }

    if (tracks.length === 0) {
      tracks = await searchByGenre(token, moodProfile.genres);
    }

    return NextResponse.json({
      tracks: tracks.slice(0, 20), // Limit to 20 tracks
      mood: moodAnalysis,
      timestamp: new Date().toISOString(),
      source: tracks.length > 0 ? "success" : "no_tracks_found",
    });
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Failed to get music recommendations" },
      { status: 500 }
    );
  }
}

async function getSpotifyToken(): Promise<string | null> {
  // Check if token is still valid
  if (accessToken && Date.now() < tokenExpiryTime) {
    return accessToken;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000; // Subtract 1 minute for safety

    return accessToken;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    return null;
  }
}

function mapMoodToSpotifyFeatures(moodAnalysis: MoodAnalysis): MoodProfile {
  const { mood } = moodAnalysis;

  const moodProfiles: Record<string, MoodProfile> = {
    happy: {
      genres: ["pop", "dance", "funk", "disco"],
      energy: 0.8,
      valence: 0.9,
      acousticness: 0.1,
      danceability: 0.8,
      tempo: 120,
    },
    sad: {
      genres: ["indie", "acoustic", "singer-songwriter", "folk"],
      energy: 0.3,
      valence: 0.2,
      acousticness: 0.7,
      danceability: 0.3,
      tempo: 80,
    },
    energetic: {
      genres: ["rock", "electronic", "punk", "metal"],
      energy: 0.95,
      valence: 0.8,
      acousticness: 0.1,
      danceability: 0.7,
      tempo: 140,
    },
    chill: {
      genres: ["ambient", "lo-fi", "indie-pop", "chillout"],
      energy: 0.4,
      valence: 0.6,
      acousticness: 0.5,
      danceability: 0.4,
      tempo: 100,
    },
    stressed: {
      genres: ["ambient", "new-age", "classical", "meditation"],
      energy: 0.2,
      valence: 0.6,
      acousticness: 0.8,
      danceability: 0.2,
      tempo: 70,
    },
    romantic: {
      genres: ["r-n-b", "soul", "jazz", "indie-pop"],
      energy: 0.4,
      valence: 0.8,
      acousticness: 0.4,
      danceability: 0.5,
      tempo: 90,
    },
    workout: {
      genres: ["edm", "hip-hop", "rock", "electronic"],
      energy: 0.95,
      valence: 0.8,
      acousticness: 0.05,
      danceability: 0.9,
      tempo: 130,
    },
    tired: {
      genres: ["ambient", "classical", "acoustic", "sleep"],
      energy: 0.15,
      valence: 0.5,
      acousticness: 0.9,
      danceability: 0.1,
      tempo: 60,
    },
  };

  return moodProfiles[mood] || moodProfiles.chill;
}

async function searchByMoodKeywords(
  token: string,
  moodProfile: MoodProfile,
  mood: string
): Promise<SpotifyTrack[]> {
  try {
    const moodKeywords = {
      happy: "happy upbeat positive joy",
      sad: "sad melancholy heartbreak emotional",
      energetic: "energetic pump up motivation",
      chill: "chill relax calm peaceful",
      stressed: "calm relaxing soothing peaceful",
      romantic: "romantic love smooth intimate",
      workout: "workout gym motivation pump",
      tired: "sleep calm quiet peaceful",
    };

    const keywords = moodKeywords[mood as keyof typeof moodKeywords] || "music";
    const query = encodeURIComponent(keywords);
    const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50&market=US`;

    console.log("Trying Search by Keywords:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error("searchByMoodKeywords error:", error);
    return [];
  }
}

async function getTracksFromMoodPlaylists(
  token: string,
  mood: string
): Promise<SpotifyTrack[]> {
  try {
    const playlistKeywords = {
      happy: "happy hits good vibes",
      sad: "sad songs heartbreak",
      energetic: "workout energy pump up",
      chill: "chill indie coffee",
      stressed: "calm meditation relaxing",
      romantic: "romantic love songs",
      workout: "workout gym fitness",
      tired: "sleep sounds peaceful",
    };

    const keywords =
      playlistKeywords[mood as keyof typeof playlistKeywords] || "music";
    const query = encodeURIComponent(keywords);
    const playlistUrl = `https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=5&market=US`;

    console.log("Searching for playlists:", playlistUrl);

    const playlistResponse = await fetch(playlistUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!playlistResponse.ok) {
      throw new Error(`Playlist search error: ${playlistResponse.status}`);
    }

    const playlistData = await playlistResponse.json();
    const playlists = playlistData.playlists?.items || [];

    if (playlists.length === 0) {
      return [];
    }

    // Get tracks from the first playlist
    const playlistId = playlists[0].id;
    const tracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20&market=US`;

    const tracksResponse = await fetch(tracksUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!tracksResponse.ok) {
      throw new Error(`Playlist tracks error: ${tracksResponse.status}`);
    }

    const tracksData = await tracksResponse.json();
    return (
      tracksData.items
        ?.map((item: any) => item.track)
        .filter((track: any) => track) || []
    );
  } catch (error) {
    console.error("getTracksFromMoodPlaylists error:", error);
    return [];
  }
}

async function searchByGenre(
  token: string,
  genres: string[]
): Promise<SpotifyTrack[]> {
  try {
    const genre = genres[0] || "pop";
    const query = encodeURIComponent(`genre:${genre}`);
    const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=20&market=US`;

    console.log("Trying Genre Search:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Genre search error: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error("searchByGenre error:", error);
    return [];
  }
}
