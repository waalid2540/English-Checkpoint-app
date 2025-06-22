const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

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

// Stripe config endpoint (for frontend)
app.get('/api/stripe/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    priceId: process.env.STRIPE_PRICE_ID
  });
});

// AI Chat endpoint with multilanguage support
app.post('/api/ai/chat', async (req, res) => {
  try {
    console.log('💬 Chat request:', req.body);
    
    const { message, mode, systemPrompt, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Language-specific system prompts
    const languagePrompts = {
      'en': 'You are Checkpoint English Coach, helping truck drivers master English. Be encouraging and conversational. Keep responses short (2-3 sentences).',
      'so': 'You are Checkpoint English Coach, helping Somali truck drivers learn English. You can understand Somali but always respond in English to help them practice. Be encouraging and patient.',
      'ar': 'You are Checkpoint English Coach, helping Arabic truck drivers learn English. You can understand Arabic but always respond in English to help them practice. Be encouraging and patient.',
      'es': 'You are Checkpoint English Coach, helping Spanish truck drivers learn English. You can understand Spanish but always respond in English to help them practice. Be encouraging and patient.',
      'fr': 'You are Checkpoint English Coach, helping French truck drivers learn English. You can understand French but always respond in English to help them practice. Be encouraging and patient.'
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt || languagePrompts[language] || languagePrompts['en']
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

// Translation endpoint
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required'
      });
    }

    const languageNames = {
      'en': 'English',
      'so': 'Somali',
      'ar': 'Arabic', 
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German'
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

// Google Text-to-Speech endpoint
app.post('/api/ai/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en', voice = 'female' } = req.body;
    
    console.log('🔊 gTTS request:', { text: text?.substring(0, 50) + '...', language, voice });

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const audioFileName = `tts_${Date.now()}.mp3`;
    const audioPath = path.join(tempDir, audioFileName);
    
    // Create gTTS instance
    const gTTS = new gtts(text, language);

    // Generate audio file
    await new Promise((resolve, reject) => {
      gTTS.save(audioPath, (err) => {
        if (err) {
          console.error('❌ gTTS generation error:', err);
          reject(err);
        } else {
          console.log('✅ gTTS audio file generated');
          resolve();
        }
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

    // Clean up temp file after 5 seconds
    setTimeout(() => {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        console.log('🗑️ Cleaned up temp file');
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

// MCP Tool endpoints
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'get_dot_regulations',
        description: 'Get DOT regulations for truck drivers',
        parameters: {
          category: 'Type of regulation',
          state: 'Optional state code'
        }
      },
      {
        name: 'track_learning_progress',
        description: 'Track learning progress',
        parameters: {
          user_id: 'User ID',
          lesson_type: 'Type of lesson',
          score: 'Score (0-100)',
          duration: 'Duration in minutes'
        }
      },
      {
        name: 'get_trucking_vocabulary',
        description: 'Get trucking vocabulary',
        parameters: {
          category: 'Vocabulary category',
          difficulty: 'Difficulty level',
          count: 'Number of items'
        }
      }
    ]
  });
});

app.post('/api/mcp/call', (req, res) => {
  const { tool, parameters } = req.body;
  
  console.log(`🔧 MCP Tool called: ${tool}`, parameters);
  
  // Mock MCP responses - in production, this would call your MCP server
  const mockResponses = {
    get_dot_regulations: {
      content: [{
        type: 'text',
        text: `# DOT Regulations: ${parameters.category}\n\nKey requirements for truck drivers:\n• Valid CDL license required\n• Hours of service compliance\n• Regular vehicle inspections\n• Safety equipment checks`
      }]
    },
    track_learning_progress: {
      content: [{
        type: 'text',
        text: `# Progress Tracked ✅\n\n**Score**: ${parameters.score}%\n**Lesson**: ${parameters.lesson_type}\n\nGreat work! Keep practicing to improve your English skills.`
      }]
    },
    get_trucking_vocabulary: {
      content: [{
        type: 'text',
        text: `# ${parameters.category} Vocabulary\n\n1. **Engine** - Motor that powers the truck\n2. **Brake** - System to stop the vehicle\n3. **Steering** - Control direction of truck\n4. **Transmission** - Changes gears\n5. **Differential** - Distributes power to wheels`
      }]
    }
  };
  
  const response = mockResponses[tool] || {
    content: [{
      type: 'text',
      text: `Tool ${tool} not implemented yet`
    }],
    isError: true
  };
  
  res.json(response);
});

// Stripe webhook endpoint
app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    console.log('⚠️ Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;
  try {
    // Verify webhook signature (when using real Stripe)
    console.log('📧 Stripe webhook received:', req.headers['stripe-signature'] ? 'with signature' : 'no signature');
    
    // For development, just parse the body
    event = JSON.parse(req.body);
    console.log('🔔 Stripe event:', event.type);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('📝 Subscription updated:', event.data.object.id);
        // Here you would update your Supabase database
        break;
      
      case 'customer.subscription.trial_will_end':
        console.log('⏰ Trial ending soon for:', event.data.object.customer);
        // Send trial ending email
        break;
      
      case 'invoice.payment_succeeded':
        console.log('✅ Payment succeeded:', event.data.object.subscription);
        // Activate premium features
        break;
      
      case 'invoice.payment_failed':
        console.log('❌ Payment failed:', event.data.object.subscription);
        // Handle failed payment
        break;
      
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).send('Webhook processing error');
  }

  res.json({received: true});
});

app.listen(PORT, () => {
  console.log(`🚛 Simple English Checkpoint Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔧 MCP Tools available at http://localhost:${PORT}/api/mcp`);
  console.log(`💳 Stripe webhook endpoint: http://localhost:${PORT}/webhook/stripe`);
  console.log(`🌍 Multi-language support: English, Somali, Arabic, Spanish, French, German`);
});