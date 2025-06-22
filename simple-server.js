const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    console.log('💬 Chat request:', req.body);
    
    const { message, mode, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt || `You are Checkpoint English Coach, helping truck drivers master English. Be encouraging and conversational. Keep responses short (2-3 sentences).`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content || "I'm here to help you practice English!";
    
    console.log('✅ OpenAI Response:', reply);

    res.json({
      success: true,
      reply: reply,
      mode: mode
    });

  } catch (error) {
    console.error('❌ OpenAI error:', error.message);
    
    const fallbackResponses = [
      "That's wonderful! You're making great progress. Keep practicing!",
      "Excellent work! I can see you're really trying. That's the spirit!",
      "Well done! Every word you practice makes you stronger in English.",
      "Amazing effort! You're getting better every day. I believe in you!"
    ];

    res.json({
      success: false,
      error: error.message,
      reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚛 Simple English Checkpoint Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});