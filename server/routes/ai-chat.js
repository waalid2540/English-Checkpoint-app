import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import gtts from 'gtts';
import path from 'path';

dotenv.config();

// Configure multer for file uploads with better settings
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, mode, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured',
        reply: "I'm having trouble connecting to my AI brain right now, but I'm still here to help! You're doing amazing with your English practice. Keep going! 🌟"
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt || `You are Checkpoint English Coach, a warm, friendly, and patient AI assistant helping truck drivers master English. Always be encouraging, supportive, and human-like. Never be robotic. Speak like a caring tutor. Keep responses conversational and motivating.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content || "I'm here to help you practice English! What would you like to work on?";

    res.json({
      success: true,
      reply: reply,
      mode: mode
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Provide encouraging fallback response
    const fallbackResponses = [
      "That's wonderful! You're making great progress. Keep practicing! What else would you like to work on?",
      "Excellent work! I can see you're really trying. That's the spirit! Tell me more.",
      "Well done! Every word you practice makes you stronger in English. What's next?",
      "Amazing effort! You're getting better every day. I believe in you! Keep going!",
      "Perfect! You're building real confidence. What other English skills would you like to practice?"
    ];

    res.json({
      success: false,
      error: error.message,
      reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    });
  }
});

// Enhanced Whisper speech-to-text endpoint
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('🎤 Received transcription request');
    
    if (!req.file) {
      console.log('❌ No audio file provided');
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    console.log('📁 File details:', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OpenAI API key not configured');
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    // Check if file exists and has content
    if (!fs.existsSync(req.file.path) || req.file.size === 0) {
      console.log('❌ Audio file is empty or does not exist');
      return res.status(400).json({
        success: false,
        error: 'Audio file is empty or corrupted'
      });
    }

    console.log('🚀 Sending to OpenAI Whisper...');
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
      language: "en", // Will auto-detect if not English
      response_format: "text",
      temperature: 0.2
    });

    console.log('✅ Whisper response received:', transcription);

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      text: transcription || ''
    });

  } catch (error) {
    console.error('❌ Whisper transcription error:', {
      message: error.message,
      status: error.status,
      type: error.type
    });
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      text: ''
    });
  }
});

// Google Text-to-Speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    
    console.log('🔊 gTTS request:', { text: text?.substring(0, 50) + '...', language });

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const gTTS = new gtts(text, language);
    const audioFileName = `tts_${Date.now()}.mp3`;
    const audioPath = path.join(process.cwd(), 'temp', audioFileName);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate audio file
    await new Promise((resolve, reject) => {
      gTTS.save(audioPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Read and send the audio file
    const audioBuffer = fs.readFileSync(audioPath);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(audioBuffer);
    console.log('✅ gTTS audio sent, size:', audioBuffer.length);

    // Clean up temp file
    setTimeout(() => {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }, 5000);

  } catch (error) {
    console.error('❌ gTTS error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Multi-language translation endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    const languageNames = {
      'en': 'English',
      'so': 'Somali',
      'ar': 'Arabic', 
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'hi': 'Hindi',
      'ur': 'Urdu',
      'fa': 'Persian',
      'tr': 'Turkish'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given text from ${sourceLangName} to ${targetLangName}. Only provide the translation, no explanations.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const translation = completion.choices[0]?.message?.content || text;

    res.json({
      success: true,
      translation: translation,
      sourceLanguage: sourceLangName,
      targetLanguage: targetLangName
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      translation: text // Fallback to original text
    });
  }
});

// OpenAI Text-to-Speech endpoint (High Quality!)
router.post('/speak', async (req, res) => {
  try {
    const { text, voice = 'echo' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log(`🎤 Generating OpenAI TTS with voice "${voice}": "${text.substring(0, 50)}..."`);

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice, // alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 1.0
    });

    // Get audio buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    });

    res.send(buffer);
    console.log(`✅ OpenAI TTS sent, size: ${buffer.length} bytes`);

  } catch (error) {
    console.error('❌ OpenAI TTS error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;