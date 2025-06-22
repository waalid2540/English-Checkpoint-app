import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import gTTS from 'gtts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load DOT prompts
const dotPromptsPath = path.join(__dirname, '../data/dot-prompts.json');
let dotPrompts = [];

try {
  const data = fs.readFileSync(dotPromptsPath, 'utf8');
  dotPrompts = JSON.parse(data);
} catch (error) {
  console.error('Error loading DOT prompts:', error);
}

// Get all DOT prompts
router.get('/prompts', (req, res) => {
  res.json({
    success: true,
    total: dotPrompts.length,
    prompts: dotPrompts
  });
});

// Get random DOT prompt
router.get('/random', (req, res) => {
  if (dotPrompts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No prompts available'
    });
  }

  const randomIndex = Math.floor(Math.random() * dotPrompts.length);
  const prompt = dotPrompts[randomIndex];

  res.json({
    success: true,
    prompt: {
      ...prompt,
      id: randomIndex
    }
  });
});

// Get specific prompt by ID
router.get('/prompt/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (id < 0 || id >= dotPrompts.length) {
    return res.status(404).json({
      success: false,
      message: 'Prompt not found'
    });
  }

  const prompt = dotPrompts[id];
  res.json({
    success: true,
    prompt: {
      ...prompt,
      id: id
    }
  });
});

// Generate TTS audio for text
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'en', speed = 1 } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    // Create audio directory if it doesn't exist
    const audioDir = path.join(__dirname, '../../public/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
    const filePath = path.join(audioDir, filename);

    // Create gTTS instance
    const gtts = new gTTS(text, voice);

    // Save audio file
    await new Promise((resolve, reject) => {
      gtts.save(filePath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      audioUrl: `/audio/${filename}`,
      text: text
    });

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate audio',
      error: error.message
    });
  }
});

// Get practice session (multiple prompts)
router.get('/session/:count', (req, res) => {
  const count = Math.min(parseInt(req.params.count) || 10, 50); // Max 50 questions
  
  if (dotPrompts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No prompts available'
    });
  }

  // Get random prompts without repetition
  const shuffled = [...dotPrompts].sort(() => 0.5 - Math.random());
  const sessionPrompts = shuffled.slice(0, count).map((prompt, index) => ({
    ...prompt,
    id: index,
    sessionId: `session_${Date.now()}`
  }));

  res.json({
    success: true,
    sessionId: `session_${Date.now()}`,
    totalQuestions: count,
    prompts: sessionPrompts
  });
});

export default router;