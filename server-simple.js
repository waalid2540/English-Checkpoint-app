import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load DOT prompts
const dotPromptsPath = path.join(__dirname, 'server/data/dot-prompts.json');
let dotPrompts = [];

try {
  const data = fs.readFileSync(dotPromptsPath, 'utf8');
  dotPrompts = JSON.parse(data);
  console.log(`Loaded ${dotPrompts.length} DOT prompts`);
} catch (error) {
  console.error('Error loading DOT prompts:', error);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'English Checkpoint API is running',
    timestamp: new Date().toISOString()
  });
});

// Get random DOT prompt
app.get('/api/dot-practice/random', (req, res) => {
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

// Get practice session
app.get('/api/dot-practice/session/:count', (req, res) => {
  const count = Math.min(parseInt(req.params.count) || 10, 50);
  
  if (dotPrompts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No prompts available'
    });
  }

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

// Simple TTS mock (for now)
app.post('/api/dot-practice/tts', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text is required'
    });
  }

  // For now, return a mock response
  // In production, this would generate actual audio
  res.json({
    success: true,
    audioUrl: '/mock-audio.mp3',
    text: text,
    note: 'TTS feature requires additional setup'
  });
});

app.listen(PORT, () => {
  console.log(`🚛 English Checkpoint Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🎯 DOT Practice available at http://localhost:${PORT}/api/dot-practice`);
});