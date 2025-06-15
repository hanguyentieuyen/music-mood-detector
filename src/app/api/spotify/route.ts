// src/app/api/spotify/route.ts

import { NextRequest, NextResponse } from "next/server";
import type { MoodAnalysis, SpotifyTrack, MoodProfile } from "@/types";

let accessToken: string | null = null;
let tokenExpiryTime: number = 0;

export async function POST(req: NextRequest) {
  try {
    const { moodAnalysis }: { moodAnalysis: MoodAnalysis } = await req.json();

    // Get Spotify access token
    const token = await getSpotifyToken();
    if (!token) {
      return NextResponse.json(
        { error: "Failed to authenticate with Spotify" },
        { status: 500 }
      );
    }

    // Map mood to Spotify audio features
    const moodProfile = mapMoodToSpotifyFeatures(moodAnalysis);

    // Get recommendations
    const tracks = await getRecommendations(token, moodProfile);

    return NextResponse.json({
      tracks,
      mood: moodAnalysis,
      timestamp: new Date().toISOString(),
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
  const { mood, energy, valence } = moodAnalysis;

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

async function getRecommendations(
  token: string,
  moodProfile: MoodProfile
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    seed_genres: moodProfile.genres.slice(0, 2).join(","), // Max 2 genres
    target_energy: moodProfile.energy.toString(),
    target_valence: moodProfile.valence.toString(),
    target_acousticness: moodProfile.acousticness.toString(),
    target_danceability: moodProfile.danceability.toString(),
    limit: "20",
    market: "US",
  });

  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data = await response.json();
  return data.tracks || [];
}
