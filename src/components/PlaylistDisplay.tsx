"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  ExternalLink,
  Heart,
  Music,
  Volume2,
  Sparkles,
  TrendingUp,
  Smile,
} from "lucide-react";
import type { PlaylistResult, SpotifyTrack } from "@/types";

interface PlaylistDisplayProps {
  result: PlaylistResult;
  onNewSearch: () => void;
}

export default function PlaylistDisplay({
  result,
  onNewSearch,
}: PlaylistDisplayProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  const { tracks, mood } = result;

  const getMoodIcon = (moodType: string) => {
    const icons = {
      happy: Smile,
      sad: Music,
      energetic: TrendingUp,
      chill: Sparkles,
      stressed: Volume2,
      romantic: Heart,
      workout: TrendingUp,
      tired: Music,
    };
    return icons[moodType as keyof typeof icons] || Music;
  };

  const getMoodColor = (moodType: string) => {
    const colors = {
      happy: "bg-yellow-500",
      sad: "bg-blue-500",
      energetic: "bg-red-500",
      chill: "bg-purple-500",
      stressed: "bg-gray-500",
      romantic: "bg-pink-500",
      workout: "bg-green-500",
      tired: "bg-indigo-500",
    };
    return colors[moodType as keyof typeof colors] || "bg-gray-500";
  };

  const playPreview = async (track: SpotifyTrack) => {
    if (!track.preview_url) return;

    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (currentlyPlaying === track.id) {
      // Stop playing
      setCurrentlyPlaying(null);
      setAudioElement(null);
      return;
    }

    // Play new track
    const audio = new Audio(track.preview_url);
    audio.volume = 0.5;

    audio.addEventListener("ended", () => {
      setCurrentlyPlaying(null);
      setAudioElement(null);
    });

    try {
      await audio.play();
      setCurrentlyPlaying(track.id);
      setAudioElement(audio);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const formatArtists = (artists: SpotifyTrack["artists"]) => {
    return artists.map((artist) => artist.name).join(", ");
  };

  const MoodIcon = getMoodIcon(mood.mood);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Mood Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${getMoodColor(
                mood.mood
              )} flex items-center justify-center`}
            >
              <MoodIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl capitalize">{mood.mood} Mood Detected</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {mood.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Energy: {Math.round(mood.energy * 100)}%
            </Badge>
            <Badge variant="secondary">
              Positivity: {Math.round(mood.valence * 100)}%
            </Badge>
            <Badge variant="secondary">
              Confidence: {Math.round(mood.confidence * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Playlist Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Your Personalized Playlist
          </CardTitle>
          <Button variant="outline" onClick={onNewSearch}>
            Try Another Mood
          </Button>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tracks found for this mood. Try a different description!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  {/* Album Art */}
                  <div className="relative flex-shrink-0">
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{track.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {formatArtists(track.artists)} • {track.album.name}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {track.preview_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playPreview(track)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {currentlyPlaying === track.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <a
                        href={track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              🎵 Found {tracks.length} tracks matching your mood
            </p>
            <p>
              Click the play button to preview tracks (30 seconds) or the link
              button to open in Spotify
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
