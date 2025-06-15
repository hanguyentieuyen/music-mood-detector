"use client";

import { useState } from "react";
import MoodInput from "@/components/MoodInput";
import PlaylistDisplay from "@/components/PlaylistDisplay";
import type { PlaylistResult } from "@/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaylistResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeMood = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Analyze sentiment
      const sentimentResponse = await fetch("/api/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!sentimentResponse.ok) {
        throw new Error("Failed to analyze sentiment");
      }

      const moodAnalysis = await sentimentResponse.json();

      // Step 2: Get Spotify recommendations
      const spotifyResponse = await fetch("/api/spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moodAnalysis }),
      });

      if (!spotifyResponse.ok) {
        throw new Error("Failed to get music recommendations");
      }

      const playlistResult = await spotifyResponse.json();
      setResult(playlistResult);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Music Mood Detector
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover music that perfectly matches your emotions. Powered by AI
            sentiment analysis and Spotify's vast music library.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Oops! Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!result ? (
          <MoodInput onAnalyze={handleAnalyzeMood} loading={loading} />
        ) : (
          <PlaylistDisplay result={result} onNewSearch={handleNewSearch} />
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Built with ❤️ using Next.js, Hugging Face AI, and Spotify API</p>
        </footer>
      </div>
    </main>
  );
}
