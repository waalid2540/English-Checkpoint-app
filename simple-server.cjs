const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 3003;

// Configure CORS to allow Vercel frontend
const corsOrigin = process.env.CORS_ORIGIN || [
  'https://englishcheckpointapp.vercel.app',
  'https://englishcheckpoint-q5wgi9b0w-waalid2540s-projects.vercel.app',
  'https://englishcheckpoint-32nbhlv1s-waalid2540s-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON for most routes, but not for Stripe webhook
app.use('/webhook/stripe', express.raw({type: 'application/json'}));
app.use(express.json());

// File upload middleware for audio files
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  createParentPath: true
}));

// Debug environment variables
console.log('🔧 Environment Check:');
console.log('- OpenAI API Key:', process.env.OPENAI_API_KEY ? 'SET ✅' : 'MISSING ❌');
console.log('- Stripe Secret:', process.env.STRIPE_SECRET_KEY ? 'SET ✅' : 'MISSING ❌');
console.log('- Supabase URL:', process.env.SUPABASE_URL ? 'SET ✅' : 'MISSING ❌');
console.log('- Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET ✅' : 'MISSING ❌');

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


// Check user subscription status
app.get('/api/subscription/status', async (req, res) => {
  try {
    console.log('🔍 Checking subscription status...');
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      console.log('⚠️ No auth token provided');
      return res.json({
        isPremium: false,
        trialDaysLeft: 0,
        dailyUsage: 0,
        dailyLimit: 5, // Increased free limit
        subscriptionId: null
      });
    }

    // Verify the JWT token and get user info
    console.log('🔐 Verifying auth token...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError?.message);
      return res.json({
        isPremium: false,
        trialDaysLeft: 0,
        dailyUsage: 0,
        dailyLimit: 5,
        subscriptionId: null
      });
    }

    console.log('✅ User authenticated:', user.email);

    // Check user's subscription status with better error handling
    console.log('📊 Checking subscription in database...');
    let subscription = null;
    
    try {
      const { data, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows found

      if (subError) {
        console.log('📊 Subscription query error:', subError.code, subError.message);
        // Only log the error, don't fail - treat as no subscription
      } else {
        subscription = data;
        console.log('📊 Subscription query successful:', data ? 'Found subscription' : 'No subscription');
      }
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      // Continue with no subscription - don't fail the request
    }

    console.log('📊 Subscription data:', subscription ? 'Found subscription' : 'No subscription');

    // Calculate subscription status
    let isPremium = false;
    let trialDaysLeft = 0;
    
    if (subscription) {
      const now = new Date();
      
      // Check if subscription is active
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        isPremium = true;
        console.log('✅ User has premium subscription');
      }
      
      // Calculate trial days left
      if (subscription.trial_end) {
        const trialEnd = new Date(subscription.trial_end);
        const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
        trialDaysLeft = daysLeft;
        console.log('📅 Trial days left:', daysLeft);
      }
    } else {
      console.log('📊 No subscription found - user gets freemium access');
    }

    // Get daily usage (mock for now - you can implement actual tracking)
    const dailyUsage = 0; // TODO: Implement actual usage tracking
    const dailyLimit = isPremium ? 1000 : 5; // Premium users get unlimited, free users get 5

    const result = {
      isPremium,
      trialDaysLeft,
      dailyUsage,
      dailyLimit,
      subscriptionId: subscription?.stripe_subscription_id || null
    };

    console.log('✅ Subscription status result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Subscription status error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Return a safe default instead of 500 error
    res.json({
      isPremium: false,
      trialDaysLeft: 0,
      dailyUsage: 0,
      dailyLimit: 5,
      subscriptionId: null,
      error: 'Unable to check subscription status'
    });
  }
});

// Enhanced AI Chat endpoint with perfect memory and translations
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { 
      message, 
      mode, 
      systemPrompt, 
      language = 'en', 
      conversationHistory = [],
      userProfile = {},
      enhancedMode = false,
      userId
    } = req.body;
    
    console.log('🧠 Enhanced Chat Request:', {
      message: message.substring(0, 100) + '...',
      mode,
      language,
      hasSystemPrompt: !!systemPrompt,
      hasHistory: conversationHistory.length > 0,
      hasProfile: Object.keys(userProfile).length > 0,
      enhancedMode
    });

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build messages array with conversation history
    const messages = [];
    
    // Add enhanced system prompt if provided
    if (systemPrompt && enhancedMode) {
      let enhancedPrompt = systemPrompt;
      
      // Add user profile memory if available
      if (Object.keys(userProfile).length > 0) {
        enhancedPrompt += `\n\n🧠 USER PROFILE MEMORY:\n`;
        enhancedPrompt += `Name: ${userProfile.name || 'Not provided'}\n`;
        enhancedPrompt += `Last Route: ${userProfile.lastRoute || 'Not provided'}\n`;
        enhancedPrompt += `Family: ${userProfile.family || 'Not provided'}\n`;
        enhancedPrompt += `Home Country: ${userProfile.homeCountry || 'Not provided'}\n`;
        enhancedPrompt += `Truck Type: ${userProfile.truckType || 'Not provided'}\n`;
        enhancedPrompt += `English Level: ${userProfile.englishLevel || 'Beginner'}\n`;
        enhancedPrompt += `Previous Topics: ${userProfile.previousTopics || 'None'}\n`;
      }
      
      messages.push({
        role: "system",
        content: enhancedPrompt
      });
    } else {
      // Fallback enhanced system prompt for accurate translations
      messages.push({
        role: "system",
        content: `You are Checkpoint English Coach, an EXTREMELY intelligent multilingual AI assistant for truck drivers.

🌍 PERFECT MULTILINGUAL SUPPORT:
- ALWAYS detect their language automatically
- Respond in BOTH their native language AND English
- Format: "[Perfect Native Language Response] 🔄 English: [English version]"

📚 SOMALI EXPERTISE (Critical - Be 100% Accurate):
- "Waan ku caawin karaa" = I can help you
- "Sidee tahay?" = How are you?  
- "Mahadsanid" = Thank you
- "Baabuur weyn" = Truck
- "Waddo" = Road
- "Xamuul" = Cargo
- Use proper Somali grammar and cultural respect

🧠 MEMORY & CONVERSATION:
- Remember what they tell you (name, routes, family)
- Reference previous conversations naturally
- Build ongoing relationships
- Ask follow-up questions about their trucking life

🚛 TRUCKING EXPERTISE:
- DOT regulations, HOS rules, safety
- Routes, truck stops, mechanical issues
- Real trucking scenarios and challenges

Be encouraging, remember everything, and provide PERFECT translations!`
      });
    }
    
    // Add conversation history for memory
    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }
    
    // Add current message
    messages.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Latest model for better multilingual support
      messages: messages,
      max_tokens: 600, // Increased for better responses
      temperature: 0.6, // Lower for more consistent translations
    });

    const reply = completion.choices[0]?.message?.content || "I'm here to help you practice English!";
    
    // Extract profile updates from user message
    let updatedProfile = { ...userProfile };
    
    // Extract name
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me) ([a-zA-Z]+)/i);
    if (nameMatch) {
      updatedProfile.name = nameMatch[1];
    }
    
    // Extract route/destination
    const routeMatch = message.match(/(?:driving to|going to|route to|delivering to) ([a-zA-Z ]+)/i);
    if (routeMatch) {
      updatedProfile.lastRoute = routeMatch[1];
      updatedProfile.lastRouteDate = new Date().toISOString();
    }
    
    // Extract family mentions
    const familyMatch = message.match(/(?:my wife|my husband|my kids|my children|my family)/i);
    if (familyMatch) {
      updatedProfile.family = 'Mentioned family';
    }
    
    // Extract home country
    const countryMatch = message.match(/(?:from|back in) (Somalia|Ethiopia|Kenya|Mexico|Guatemala|Honduras)/i);
    if (countryMatch) {
      updatedProfile.homeCountry = countryMatch[1];
    }
    
    console.log('✅ Enhanced AI Response:', reply.substring(0, 200) + '...');

    res.json({
      success: true,
      reply: reply,
      mode: mode,
      updatedProfile: Object.keys(updatedProfile).length > Object.keys(userProfile).length ? updatedProfile : null
    });

  } catch (error) {
    console.error('❌ Enhanced AI Error:', error.message);
    
    const smartFallbacks = [
      "That's wonderful! You're making great progress. Keep practicing!",
      "Excellent work! I can see you're really trying. That's the spirit!",
      "Well done! Every word you practice makes you stronger in English.",
      "Amazing effort! You're getting better every day. I believe in you!"
    ];

    res.json({
      success: false,
      error: error.message,
      reply: smartFallbacks[Math.floor(Math.random() * smartFallbacks.length)]
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

// OpenAI Whisper transcription endpoint
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    console.log('🎤 OpenAI Whisper transcription request received')
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      })
    }

    const audioFile = req.files.file
    console.log('📂 Audio file received:', audioFile.name, audioFile.size, 'bytes')

    // Create transcription with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    })

    const transcriptText = transcription.trim()
    console.log('✅ Whisper transcription:', transcriptText)

    res.json({
      success: true,
      text: transcriptText
    })

  } catch (error) {
    console.error('❌ Whisper transcription error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      text: ''
    })
  }
})

// OpenAI Text-to-Speech endpoint (replacing gTTS)
app.post('/api/ai/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en', voice = 'alloy' } = req.body;
    
    console.log('🔊 OpenAI TTS request:', { text: text?.substring(0, 50) + '...', language, voice });

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Map voice preferences to OpenAI voices
    const voiceMap = {
      'en': 'alloy',     // Natural, balanced voice
      'female': 'nova',   // Female voice
      'male': 'onyx',     // Male voice
      'alloy': 'alloy',
      'echo': 'echo',
      'fable': 'fable',
      'nova': 'nova',
      'onyx': 'onyx',
      'shimmer': 'shimmer'
    };

    const selectedVoice = voiceMap[voice] || 'alloy';
    console.log('🎤 Using OpenAI voice:', selectedVoice);

    // Generate speech with OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // High quality, fast
      voice: selectedVoice,
      input: text,
      response_format: "mp3",
      speed: 1.0
    });

    console.log('✅ OpenAI TTS audio generated');

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(buffer);
    console.log('✅ OpenAI TTS audio sent, size:', buffer.length);

  } catch (error) {
    console.error('❌ OpenAI TTS error:', error);
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

// Initialize Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe checkout session creation endpoint
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    console.log('💳 Creating Stripe checkout session...');
    console.log('Request body:', req.body);
    console.log('Headers:', req.headers);
    
    const { priceId, successUrl, cancelUrl } = req.body;
    
    if (!priceId) {
      console.error('❌ No priceId provided in request');
      return res.status(400).json({ 
        error: 'Price ID is required' 
      });
    }

    // Get user from auth token
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    let userId = null;
    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
          console.log('✅ User authenticated:', user.email);
        }
      } catch (authError) {
        console.log('⚠️ Auth error, proceeding without user:', authError.message);
      }
    }

    // Use the price ID from request or fallback to env
    const finalPriceId = priceId || process.env.STRIPE_PRICE_ID;
    
    if (!finalPriceId) {
      console.error('❌ No price ID provided');
      return res.status(400).json({ 
        error: 'Price ID not configured' 
      });
    }

    console.log('💰 Using price ID:', finalPriceId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.FRONTEND_URL || 'https://english-checkpoint-frontend.onrender.com'}?success=true`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'https://english-checkpoint-frontend.onrender.com'}?canceled=true`,
      metadata: {
        user_id: userId || 'anonymous',
        source: 'english_checkpoint_app'
      },
      subscription_data: {
        metadata: {
          user_id: userId || 'anonymous',
        },
        // No trial - immediate payment
      },
      allow_promotion_codes: true,
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('✅ Checkout URL:', session.url);
    
    res.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error.message);
    console.error('❌ Full error:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to create checkout session',
      type: error.type || 'unknown'
    });
  }
});

// Stripe webhook endpoint
app.post('/webhook/stripe', async (req, res) => {
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
    console.log('📦 Raw body type:', typeof req.body);
    console.log('📦 Raw body:', req.body);
    
    // Handle different body formats
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString();
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else {
      rawBody = JSON.stringify(req.body);
    }
    
    console.log('🔄 Parsed body:', rawBody.substring(0, 200) + '...');
    
    // Parse the JSON
    event = JSON.parse(rawBody);
    console.log('🔔 Stripe event:', event.type);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed:`, err.message);
    console.log('📦 Body that failed:', req.body);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('📝 Subscription updated:', subscription.id);
        
        // Get user ID from metadata
        const userId = subscription.metadata?.user_id;
        
        if (!userId || userId === 'anonymous') {
          console.log('⚠️ No user ID found in subscription metadata');
          break;
        }
        
        // Update user subscription status in Supabase
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            updated_at: new Date()
          }, {
            onConflict: 'user_id'
          });
        
        if (updateError) {
          console.error('❌ Error updating subscription:', updateError);
        } else {
          console.log('✅ Subscription status updated in database for user:', userId);
        }
        break;
      
      case 'customer.subscription.trial_will_end':
        console.log('⏰ Trial ending soon for:', event.data.object.customer);
        // Send trial ending email notification
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('✅ Payment succeeded:', invoice.subscription);
        
        // Activate premium features by updating subscription status
        if (invoice.subscription) {
          const { error: activateError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              updated_at: new Date()
            })
            .eq('stripe_subscription_id', invoice.subscription);
          
          if (activateError) {
            console.error('❌ Error activating premium features:', activateError);
          } else {
            console.log('✅ Premium features activated');
          }
        }
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('❌ Payment failed:', failedInvoice.subscription);
        
        // Deactivate premium features
        if (failedInvoice.subscription) {
          const { error: deactivateError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date()
            })
            .eq('stripe_subscription_id', failedInvoice.subscription);
          
          if (deactivateError) {
            console.error('❌ Error deactivating features:', deactivateError);
          } else {
            console.log('✅ Subscription marked as past due');
          }
        }
        break;
      
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        console.log('🗑️ Subscription canceled:', deletedSub.id);
        
        // Mark subscription as canceled
        const { error: cancelError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date()
          })
          .eq('stripe_subscription_id', deletedSub.id);
        
        if (cancelError) {
          console.error('❌ Error canceling subscription:', cancelError);
        } else {
          console.log('✅ Subscription canceled in database');
        }
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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚛 English Checkpoint Server READY on port ${PORT}`);
  console.log(`📡 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🔧 MCP Tools: http://0.0.0.0:${PORT}/api/mcp`);
  console.log(`💳 Stripe webhook: http://0.0.0.0:${PORT}/webhook/stripe`);
  console.log(`🌍 Multi-language support enabled`);
  console.log(`✅ SERVER IS LISTENING ON PORT ${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});