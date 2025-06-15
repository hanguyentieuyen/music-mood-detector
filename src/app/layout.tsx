// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Mood Detector - AI-Powered Music Recommendations",
  description:
    "Discover music that perfectly matches your emotions. Powered by AI sentiment analysis and Spotify's vast music library.",
  keywords:
    "music, AI, mood, emotion, Spotify, recommendations, sentiment analysis",
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Music Mood Detector",
    description: "AI-powered music recommendations based on your mood",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
