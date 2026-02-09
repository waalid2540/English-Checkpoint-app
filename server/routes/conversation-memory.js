import express from 'express';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get user's conversation memory
router.get('/memory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get recent conversations (last 5 sessions)
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      profile: profile || null,
      recentConversations: conversations || []
    });

  } catch (error) {
    console.error('Memory fetch error:', error);
    res.json({
      success: false,
      profile: null,
      recentConversations: []
    });
  }
});

// Save conversation session
router.post('/save', async (req, res) => {
  try {
    const { userId, messages, sessionSummary } = req.body;

    if (!userId || !messages || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID and messages are required'
      });
    }

    // Generate a summary of the conversation if not provided
    let summary = sessionSummary;
    if (!summary && messages.length > 2) {
      try {
        const convoText = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const summaryResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Summarize this English practice conversation in 1-2 sentences. Note any grammar mistakes the user made and topics discussed."
            },
            { role: "user", content: convoText }
          ],
          max_tokens: 100
        });
        summary = summaryResponse.choices[0]?.message?.content || 'Practice session';
      } catch (e) {
        summary = 'Practice session';
      }
    }

    // Save conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        messages: messages,
        summary: summary || 'Practice session',
        message_count: messages.length,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Save conversation error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user profile (name, native language, goals)
router.post('/profile', async (req, res) => {
  try {
    const { userId, name, nativeLanguage, goals, weakAreas } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        name: name,
        native_language: nativeLanguage,
        goals: goals,
        weak_areas: weakAreas,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate personalized context for AI
router.get('/context/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get last 3 conversation summaries
    const { data: conversations } = await supabase
      .from('conversations')
      .select('summary, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Build context string
    let context = '';
    
    if (profile) {
      if (profile.name) context += `User's name is ${profile.name}. `;
      if (profile.native_language) context += `Native language: ${profile.native_language}. `;
      if (profile.goals) context += `Goals: ${profile.goals}. `;
      if (profile.weak_areas) context += `Areas to improve: ${profile.weak_areas}. `;
    }

    if (conversations && conversations.length > 0) {
      context += `Recent practice sessions: `;
      conversations.forEach((c, i) => {
        context += `${i + 1}) ${c.summary} `;
      });
    }

    res.json({
      success: true,
      context: context || null,
      profile: profile || null,
      hasHistory: conversations && conversations.length > 0
    });

  } catch (error) {
    console.error('Context error:', error);
    res.json({
      success: false,
      context: null,
      profile: null,
      hasHistory: false
    });
  }
});

export default router;
