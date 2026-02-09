import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dotPracticeRoutes from './routes/dot-practice.js';
import aiChatRoutes from './routes/ai-chat.js';
import ttsRoutes from './routes/tts.js';
import subscriptionRoutes from './routes/subscription.js';
import stripeRoutes from './routes/stripe.js';
import translateRoutes from './routes/translate.js';
import conversationMemoryRoutes from './routes/conversation-memory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Webhook needs raw body, so register it before other middleware
app.use('/webhook/stripe', express.raw({ type: 'application/json' }), stripeRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve audio files
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'English Checkpoint API is running',
    timestamp: new Date().toISOString()
  });
});

// DOT Practice routes
app.use('/api/dot-practice', dotPracticeRoutes);

// AI Chat routes
app.use('/api/ai', aiChatRoutes);

// Google TTS routes (100% FREE!)
app.use('/api/tts', ttsRoutes);

// Subscription routes
app.use('/api/subscription', subscriptionRoutes);

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// Translation routes
app.use('/api/translate', translateRoutes);

// Conversation memory routes
app.use('/api/memory', conversationMemoryRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚛 English Checkpoint Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🎯 DOT Practice available at http://localhost:${PORT}/api/dot-practice`);
});