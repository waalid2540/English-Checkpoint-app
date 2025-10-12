import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check user subscription status
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking subscription status...');
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      console.log('⚠️ No auth token provided');
      return res.json({
        isPremium: false,
        trialDaysLeft: 0,
        dailyUsage: 0,
        dailyLimit: 5,
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

    // Check user's subscription status in users table using EMAIL
    console.log('📊 Checking subscription status in users table by email...');
    let userRecord = null;

    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('subscription_status, id, email')
        .eq('email', user.email)
        .maybeSingle();

      if (userError) {
        console.log('📊 User query error:', userError.code, userError.message);
      } else {
        userRecord = data;
        console.log('📊 User query successful:', data);
      }
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
    }

    // Calculate subscription status
    let isPremium = false;
    let trialDaysLeft = 0;

    if (userRecord && userRecord.subscription_status === 'premium') {
      isPremium = true;
      console.log('✅ User has premium subscription');
    } else {
      console.log('📊 User has free subscription_status:', userRecord?.subscription_status || 'not found');
    }

    const dailyUsage = 0;
    const dailyLimit = isPremium ? 1000 : 5;

    const result = {
      isPremium,
      trialDaysLeft,
      dailyUsage,
      dailyLimit,
      subscriptionId: userRecord?.subscription_status || null
    };

    console.log('✅ Subscription status result:', result);
    res.json(result);

  } catch (error) {
    console.error('❌ Subscription status error:', error);
    console.error('❌ Error stack:', error.stack);

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

export default router;
