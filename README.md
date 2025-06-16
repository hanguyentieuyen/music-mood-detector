# 🎵 Music Mood Detector

AI-powered music recommendation app that analyzes your mood and finds perfect songs from Spotify. Built with Next.js, Hugging Face AI, and Spotify API.

## ✨ Features

- **AI Mood Analysis**: Uses Hugging Face's sentiment analysis to understand emotions
- **Smart Music Matching**: Maps emotions to Spotify's audio features
- **Quick Mood Buttons**: Pre-defined mood scenarios for instant results
- **Preview Playback**: Listen to 30-second track previews
- **Responsive Design**: Beautiful UI with shadcn/ui components
- **Real-time Processing**: Fast mood detection and playlist generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Spotify Developer Account
- Hugging Face Account (free)

### 1. Clone & Install

```bash
git clone <your-repo>
cd music-mood-detector
npm install
```

### 2. Environment Setup

Create `.env.local`:

```bash
# Spotify API (Required)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Hugging Face API (Required)
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_hf_token
```

### 3. Get API Keys

#### Spotify API Setup:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new app with these settings:
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/spotify`
   - **APIs**: Web API
3. Copy Client ID and Client Secret

#### Hugging Face Setup:

1. Create account at [Hugging Face](https://huggingface.co/join)
2. Go to Settings → Access Tokens
3. Create token with "Read" access
4. Copy the token

When prompted, choose:

- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

### 4. Run Development Server

```bash
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── sentiment/route.ts    # Hugging Face sentiment analysis
│   │   └── spotify/route.ts      # Spotify recommendations
│   ├── components/
│   │   ├── MoodInput.tsx         # User input interface
│   │   └── PlaylistDisplay.tsx   # Results display
│   ├── types/index.ts            # TypeScript definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # App layout
│   └── page.tsx                  # Main page
```

## 🧠 How It Works

1. **Mood Detection**: User input → Hugging Face sentiment analysis
2. **Feature Mapping**: Emotions → Spotify audio features (energy, valence, etc.)
3. **Music Search**: Spotify API finds matching tracks
4. **Results**: Display playlist with preview playback

## 🎯 Mood Mapping

| Mood      | Energy | Valence | Genres                         |
| --------- | ------ | ------- | ------------------------------ |
| Happy     | 0.8    | 0.9     | Pop, Dance, Funk               |
| Sad       | 0.3    | 0.2     | Indie, Acoustic, Folk          |
| Energetic | 0.95   | 0.8     | Rock, Electronic, Metal        |
| Chill     | 0.4    | 0.6     | Ambient, Lo-fi, Indie-pop      |
| Stressed  | 0.2    | 0.6     | Ambient, Classical, Meditation |
| Romantic  | 0.4    | 0.8     | R&B, Soul, Jazz                |
| Workout   | 0.95   | 0.8     | EDM, Hip-hop, Electronic       |

## 🔧 Customization

### Adding New Moods

1. Update `mapSentimentToMood()` in `src/app/api/sentiment/route.ts`
2. Add mood profile in `mapMoodToSpotifyFeatures()` in `src/app/api/spotify/route.ts`
3. Update icons/colors in `PlaylistDisplay.tsx`

### Changing AI Model

Replace Hugging Face model in `src/app/api/sentiment/route.ts`:

```typescript
const sentimentResults = await hf.textClassification({
  model: "your-preferred-model", // e.g., 'nlptown/bert-base-multilingual-uncased-sentiment'
  inputs: text,
});
```

Built with ❤️ using Next.js, Hugging Face AI, and Spotify API
