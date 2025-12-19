

const speech = require('@google-cloud/speech');

// Make sure GOOGLE_APPLICATION_CREDENTIALS is set in your env
const client = new speech.SpeechClient();

function createRecognizer(onTranscript) {
  // Configure the streaming request
  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      // For noisy scanner audio, an enhanced model can help:
      useEnhanced: true,
      model: 'video',
    },
    interimResults: true,
  };

  // Create the bidirectional stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', (err) => {
      console.error('STT error:', err);
    })
    .on('data', (data) => {
      if (!data.results || !data.results[0]) return;

      const result = data.results[0];
      const alt = result.alternatives && result.alternatives[0];
      if (!alt) return;

      const payload = {
        text: alt.transcript || '',
        isFinal: result.isFinal || false,
        confidence: alt.confidence ?? null,
        ts: Date.now(),
      };

      // Hand transcript to whoever created the recognizer (server.js)
      onTranscript(payload);
    });

  // Return a simple interface the rest of the app can use
  return {
    write(chunk) {
      // chunk must be PCM 16‑bit mono at 16 kHz
      recognizeStream.write(chunk);
    },
    end() {
      recognizeStream.end();
    },
  };
}

module.exports = { createRecognizer };
