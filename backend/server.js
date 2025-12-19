// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { spawn } = require('child_process');

const { createRecognizer } = require('./speech');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

// Simple health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'police-transcriber backend running' });
});

const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',          // TODO: lock this down to your React app URL
    methods: ['GET', 'POST'],
  },
});

// ---- TRANSCRIPTION / STREAMING SETUP ----

// Utterance counter used to group partial + final results
let currentUtteranceId = 0;

// Create ONE recognizer for the whole server
// `transcript` should look like: { ts, text, isFinal, ... }
const recognizer = createRecognizer((transcript) => {
  // If you want partial "listening..." updates in UI, keep this block as-is.
  // Each partial and final for the same phrase reuses the same utteranceId.
  const payload = {
    ...transcript,
    utteranceId: currentUtteranceId,
  };

  io.emit('transcript', payload);

  // When this phrase is finalized, bump the utterance id for the next one
  if (transcript.isFinal) {
    currentUtteranceId += 1;
  }

  // If instead you only want final lines and NO partials, you can
  // comment the above and use this simpler version:
  //
  // if (!transcript.isFinal) return;
  // io.emit('transcript', {
  //   ...transcript,
  //   utteranceId: currentUtteranceId++,
  // });
});

// Function to stream a live audio URL into STT
function transcribeLiveStream(streamUrl) {
  const ffmpeg = spawn('ffmpeg', [
    '-re',               // read input at native rate (live-like)
    '-i', streamUrl,     // live stream URL
    '-f', 's16le',
    '-acodec', 'pcm_s16le',
    '-ac', '1',
    '-ar', '16000',
    'pipe:1',
  ]);


  const recognizer = createRecognizer((transcript) => {
  console.log('TRANSCRIPT RAW:', transcript);   // add this
  const payload = {
    ...transcript,
    utteranceId: currentUtteranceId,
  };
  io.emit('transcript', payload);
  if (transcript.isFinal) currentUtteranceId += 1;
});

  ffmpeg.stdout.on('data', (chunk) => {
    recognizer.write(chunk);
  });


  ffmpeg.stderr.on('data', (data) => {
  const line = data.toString();
  if (line.toLowerCase().includes('error')) {
    console.error('ffmpeg error:', line);
  }
  // else ignore progress
});

// logs everything, even silence and errors 
  // ffmpeg.stderr.on('data', (data) => {
  //   console.error('ffmpeg stderr:', data.toString());
  // });

  ffmpeg.on('close', (code) => {
    console.log(`ffmpeg exited with code ${code}`);
    recognizer.end();
  });
}

// Start the live stream once when the server starts
const STREAM_URL = 'https://broadcastify.cdnstream1.com/10294?_ulid=06DEXS3WP2PM8RXRYPWEX9XSM&ts=1764944547';
transcribeLiveStream(STREAM_URL);

// ---- SOCKET.IO CONNECTION LOGGING ----

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ---- START SERVER ----

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const { spawn } = require('child_process');

// const { createRecognizer } = require('./speech');

// const PORT = process.env.PORT || 4000;

// const app = express();
// app.use(cors());

// // Simple health check route
// app.get('/', (req, res) => {
//   res.json({ status: 'ok', message: 'police-transcriber backend running' });
// });

// const httpServer = http.createServer(app);

// // Socket.IO setup
// const io = new Server(httpServer, {
//   cors: {
//     origin: '*',          // TODO: lock this down to your React app URL
//     methods: ['GET', 'POST'],
//   },
// });

// // 1) Create ONE recognizer for the whole server
// const recognizer = createRecognizer((transcript) => {
//   console.log('TRANSCRIPT:', transcript);
//   io.emit('transcript', transcript);
// });

// // 2) Function to stream a live audio URL into STT
// function transcribeLiveStream(streamUrl) {
//   const ffmpeg = spawn('ffmpeg', [
//     '-re',               // read input at native rate (good for live streams)
//     '-i', streamUrl,     // <- live stream URL
//     '-f', 's16le',
//     '-acodec', 'pcm_s16le',
//     '-ac', '1',
//     '-ar', '16000',
//     'pipe:1',
//   ]);

//   ffmpeg.stdout.on('data', (chunk) => {
//     recognizer.write(chunk);
//   });

//   ffmpeg.stderr.on('data', (data) => {
//     console.error('ffmpeg stderr:', data.toString());
//   });

//   ffmpeg.on('close', (code) => {
//     console.log(`ffmpeg exited with code ${code}`);
//     recognizer.end();
//   });
// }

// // 3) Call this once when the server starts (for testing)
// // const TEST_FILE = './audio/test.wav';
// // transcribeTestFile(TEST_FILE);

//   const STREAM_URL = 'https://broadcastify.cdnstream1.com/10294?_ulid=06DEXS3WP2PM8RXRYPWEX9XSM&ts=1764944547';
// transcribeLiveStream(STREAM_URL);

// // 4) Socket.IO connection logging
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// // Start server
// httpServer.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });
