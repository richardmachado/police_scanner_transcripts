# Police Scanner AI Transcripts

Real-time police scanner transcription app built with React, Node.js, Socket.IO, FFmpeg, and a streaming Speech-to-Text engine. Audio is pulled from a Broadcastify stream and rendered as a live, scrolling text feed in the browser. [web:194][web:200]

## Features

- Streams audio from a configurable police scanner URL using FFmpeg.    
- Sends raw audio to a Node.js backend speech recognizer.
- Emits partial and final transcripts over Socket.IO.
- React frontend displays a live transcript with auto-scroll and minimal duplicates.

## Tech Stack

- **Frontend:** React + Vite, Socket.IO client. [web:2][web:189]  
- **Backend:** Node.js, Express, Socket.IO server.
- **Audio pipeline:** FFmpeg for decoding a live MP3/stream to 16 kHz mono PCM.
- **Speech-to-Text:** External STT service wired via `speech.js` (Google/Deepgram/etc., configured locally).

## Getting Started

### 1. Clone the repo

git clone https://github.com/richardmachado/police_scanner_transcripts.git
cd police_scanner_transcripts



### 2. Backend setup

cd backend
npm install

copy your STT credentials outside the repo and point to them via env vars

example (how i'm doing it)

$env:GOOGLE_APPLICATION_CREDENTIALS="paste file path here"

npm run start or node server.js


By default the backend listens on `http://localhost:4000` and starts streaming the configured Broadcastify URL.

### 3. Frontend setup

cd ../police-scanner-frontend-new
npm install
npm run dev


Then open the printed URL (usually `http://localhost:5173`) to see live transcripts.

## Configuration

- Update the stream URL in `backend/server.js` (`STREAM_URL`) to point at a different scanner feed.
- Configure STT credentials and options in `backend/speech.js` and your `.env` files. **Do not commit `.env` or key JSON files; they are gitignored.** [web:106][web:109]

## Disclaimer

This project is for educational and personal use only. Check your local laws and terms of service before rebroadcasting or storing police radio communications. 
