// src/components/MoodInput.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, Heart, Zap, Coffee, Dumbbell } from "lucide-react";

interface MoodInputProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

const quickMoods = [
  {
    text: "I'm feeling happy and energetic today!",
    icon: Zap,
    color: "bg-yellow-500",
  },
  {
    text: "I'm stressed and need to relax",
    icon: Coffee,
    color: "bg-blue-500",
  },
  { text: "Feeling romantic and in love", icon: Heart, color: "bg-pink-500" },
  { text: "I'm sad and feeling down", icon: Music, color: "bg-gray-500" },
  {
    text: "Time for a workout session!",
    icon: Dumbbell,
    color: "bg-green-500",
  },
  {
    text: "I'm tired and want to chill",
    icon: Sparkles,
    color: "bg-purple-500",
  },
];

export default function MoodInput({ onAnalyze, loading }: MoodInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text.trim());
    }
  };

  const handleQuickMood = (moodText: string) => {
    setText(moodText);
    onAnalyze(moodText);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Music className="w-8 h-8 text-purple-600" />
          Music Mood Detector
        </CardTitle>
        <p className="text-muted-foreground">
          Tell me how you're feeling and I'll find the perfect music for your
          mood
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Mood Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Quick moods:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickMoods.map((mood, index) => {
              const IconComponent = mood.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 justify-start text-left"
                  onClick={() => handleQuickMood(mood.text)}
                  disabled={loading}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${mood.color} mr-2 flex-shrink-0`}
                  />
                  <span className="text-sm truncate">{mood.text}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or describe your mood
            </span>
          </div>
        </div>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Tell me how you're feeling... (e.g., 'I'm excited about the weekend', 'Feeling stressed from work', 'Need some chill music')"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Be as specific as you want - context helps!</span>
              <span>{text.length}/500</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing your mood...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find My Music
              </>
            )}
          </Button>
        </form>

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">
            💡 Tips for better results:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Mention activities: "working out", "studying", "relaxing"</li>
            <li>• Include emotions: "happy", "sad", "excited", "stressed"</li>
            <li>
              • Add context: "after a long day", "celebrating", "missing
              someone"
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
