import express from 'express';
import gtts from 'gtts';
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
    const speech = new gtts(text, lang, slow);

    // Get audio buffer
    speech.stream().pipe(res.set({
      'Content-Type': 'audio/mpeg',
    }));

    console.log(`✅ Google TTS audio generated successfully`);
  } catch (error) {
    console.error('❌ Google TTS error:', error);
    res.status(500).json({ error: 'Text-to-speech generation failed' });
  }
});

export default router;
