import express from 'express';
import gTTS from 'gtts';
import { Readable } from 'stream';

const router = express.Router();

// Text-to-Speech endpoint using Google TTS (100% FREE!)
router.post('/generate', async (req, res) => {
  const { text, lang = 'en', slow = true } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    console.log(`🎵 Generating Google TTS for: "${text.substring(0, 50)}..." (lang: ${lang}, slow: ${slow})`);

    // Create Google TTS instance
    const speech = new gTTS(text, lang, slow);

    // Set response headers
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked'
    });

    // Get audio stream and pipe to response
    const stream = speech.stream();

    stream.on('error', (error) => {
      console.error('❌ Google TTS stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Text-to-speech generation failed' });
      }
    });

    stream.pipe(res);

    stream.on('end', () => {
      console.log(`✅ Google TTS audio streamed successfully`);
    });

  } catch (error) {
    console.error('❌ Google TTS error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Text-to-speech generation failed' });
    }
  }
});

export default router;
