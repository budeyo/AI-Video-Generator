# 🤖 AI Video Generator SaaS

This is a prototype of an AI-powered video generator built in a 4-day sprint. It accepts a text prompt or user-uploaded images, uses AI to generate a script and voiceover, and combines all assets into a final MP4 video using FFmpeg.

## Core Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express
- **AI Services:** OpenAI (DALL-E 3, GPT-4, TTS)
- **Video Processing:** FFmpeg

---

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer)
- [FFmpeg](https://ffmpeg.org/download.html) (must be accessible from your command line)

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create the environment file from the example
cp .env.example .env
