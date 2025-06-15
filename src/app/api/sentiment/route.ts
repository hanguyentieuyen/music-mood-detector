// src/app/api/sentiment/route.ts

import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import type { MoodAnalysis, SentimentResult } from "@/types";

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Analyze sentiment using Hugging Face
    const sentimentResults = (await hf.textClassification({
      model: "distilbert-base-uncased-finetuned-sst-2-english",
      inputs: text,
    })) as SentimentResult[];

    // Map sentiment to mood
    const moodAnalysis = mapSentimentToMood(sentimentResults, text);

    return NextResponse.json(moodAnalysis);
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}

function mapSentimentToMood(
  results: SentimentResult[],
  originalText: string
): MoodAnalysis {
  const primarySentiment = results[0];
  const confidence = primarySentiment.score;

  // Enhanced mood mapping with keyword detection
  let mood = "neutral";
  let energy = 0.5;
  let valence = 0.5;
  let description = "";

  const textLower = originalText.toLowerCase();

  // Keyword-based mood detection for better accuracy
  if (
    textLower.includes("tired") ||
    textLower.includes("exhausted") ||
    textLower.includes("sleepy")
  ) {
    mood = "tired";
    energy = 0.2;
    valence = 0.3;
    description = "You seem tired and need some calming music";
  } else if (
    textLower.includes("excited") ||
    textLower.includes("pumped") ||
    textLower.includes("energetic")
  ) {
    mood = "energetic";
    energy = 0.9;
    valence = 0.8;
    description = "High energy vibes detected!";
  } else if (
    textLower.includes("stressed") ||
    textLower.includes("anxious") ||
    textLower.includes("overwhelmed")
  ) {
    mood = "stressed";
    energy = 0.7;
    valence = 0.2;
    description = "You need some stress-relief music";
  } else if (
    textLower.includes("romantic") ||
    textLower.includes("love") ||
    textLower.includes("date")
  ) {
    mood = "romantic";
    energy = 0.4;
    valence = 0.8;
    description = "Perfect mood for romantic melodies";
  } else if (
    textLower.includes("workout") ||
    textLower.includes("gym") ||
    textLower.includes("exercise")
  ) {
    mood = "workout";
    energy = 0.95;
    valence = 0.7;
    description = "Time to get pumped with workout music!";
  } else {
    // Fallback to sentiment analysis
    switch (primarySentiment.label.toLowerCase()) {
      case "positive":
      case "label_2": // Some models use numeric labels
        mood = "happy";
        energy = 0.7;
        valence = 0.8;
        description = "You're feeling positive! Here's some uplifting music";
        break;
      case "negative":
      case "label_0":
        mood = "sad";
        energy = 0.3;
        valence = 0.2;
        description = "Detected melancholic mood. Here's some comforting music";
        break;
      case "neutral":
      case "label_1":
        mood = "chill";
        energy = 0.5;
        valence = 0.6;
        description = "Neutral mood detected. Perfect for chill music";
        break;
      default:
        mood = "chill";
        energy = 0.5;
        valence = 0.6;
        description = "Let's find some good music for you";
    }
  }

  return {
    mood,
    confidence,
    energy,
    valence,
    description,
  };
}
