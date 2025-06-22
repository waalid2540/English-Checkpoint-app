import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dotPracticeRoutes from './routes/dot-practice.js';
import aiChatRoutes from './routes/ai-chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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