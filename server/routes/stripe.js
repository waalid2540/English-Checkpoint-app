import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe config endpoint (for frontend)
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    priceId: process.env.STRIPE_PRICE_ID
  });
});

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('💳 Creating Stripe checkout session...');

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
    let user = null;
    if (token) {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
        if (authUser) {
          userId = authUser.id;
          user = authUser;
          console.log('✅ User authenticated:', authUser.email);
        }
      } catch (authError) {
        console.log('⚠️ Auth error, proceeding without user:', authError.message);
      }
    }

    const finalPriceId = priceId || process.env.STRIPE_PRICE_ID;

    if (!finalPriceId) {
      console.error('❌ No price ID provided');
      return res.status(400).json({
        error: 'Price ID not configured'
      });
    }

    if (!userId) {
      console.error('❌ No authenticated user found for subscription');
      return res.status(401).json({
        error: 'Authentication required for subscription'
      });
    }

    console.log('👤 Creating subscription for user ID:', userId);

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
      success_url: successUrl || `${process.env.FRONTEND_URL || 'https://english-checkpoint-app.onrender.com'}?success=true`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'https://english-checkpoint-app.onrender.com'}?canceled=true`,
      metadata: {
        user_id: userId,
        source: 'english_checkpoint_app'
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
      allow_promotion_codes: true,
    });

    console.log('✅ Checkout session created:', session.id);

    res.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error.message);
    res.status(500).json({
      error: error.message,
      details: 'Failed to create checkout session'
    });
  }
});

// Stripe webhook endpoint (mounted at /webhook/stripe in server/index.ts)
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('📧 Webhook received at:', new Date().toISOString());
  console.log('📧 Webhook signature present:', !!sig);
  console.log('📧 Webhook secret configured:', !!endpointSecret);

  if (!endpointSecret) {
    console.log('⚠️ Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('🔔 Verified Stripe event:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('📝 Subscription event:', event.type, 'for subscription:', subscription.id);

        const userId = subscription.metadata?.user_id;

        console.log('🔍 Subscription metadata:', JSON.stringify(subscription.metadata, null, 2));

        if (!userId || userId === 'anonymous') {
          console.log('⚠️ No user ID found in subscription metadata');
          return res.status(400).send('Missing user ID in subscription metadata');
        }

        console.log('👤 Processing subscription for user ID:', userId);

        // Get user email from Supabase auth
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

        if (authError || !authUser?.user?.email) {
          console.error('❌ Could not get user email for webhook:', authError);
          return res.status(400).send('Could not find user email');
        }

        // Update user subscription status
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: authUser.user.email,
            name: authUser.user.user_metadata?.name || authUser.user.email.split('@')[0],
            password_hash: 'stripe_user',
            subscription_status: 'premium',
            stripe_customer_id: subscription.customer,
            updated_at: new Date(),
            created_at: new Date()
          }, {
            onConflict: 'email'
          });

        if (updateError) {
          console.error('❌ Error updating subscription:', updateError);
          return res.status(500).send('Failed to update subscription in database');
        } else {
          console.log('✅ Subscription status updated in database for user:', userId);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        console.log('🗑️ Subscription canceled:', deletedSub.id);

        const cancelUserId = deletedSub.metadata?.user_id;
        if (cancelUserId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'canceled',
              updated_at: new Date()
            })
            .eq('id', cancelUserId);

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

  res.json({ received: true });
});

export default router;
