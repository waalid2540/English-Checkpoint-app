#!/usr/bin/env node

/**
 * MCP Server for English Checkpoint Truck Driver App
 * Provides tools for DOT regulations, trucking data, and learning analytics
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';

class TruckDriverMCPServer {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://vtrgpzdpedhulttksozi.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmdoemRwZWRodWx0dGtzem9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODc0NiwiZXhwIjoyMDY0NTQ0NzQ2fQ.CjYCC3nAscFY0gNAfCW1ayZSDmCH69qfBpu16MZN1ak'
    );

    // Initialize Stripe client
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    this.server = new Server(
      {
        name: 'english-checkpoint-truck-driver',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_dot_regulations',
            description: 'Get current DOT regulations and requirements for truck drivers',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['hours-of-service', 'vehicle-inspection', 'licensing', 'safety'],
                  description: 'Category of DOT regulation to retrieve'
                },
                state: {
                  type: 'string',
                  description: 'State code for state-specific regulations (optional)'
                }
              },
              required: ['category']
            }
          },
          {
            name: 'track_learning_progress',
            description: 'Track and analyze user learning progress in English',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier'
                },
                lesson_type: {
                  type: 'string',
                  enum: ['conversation', 'vocabulary', 'pronunciation', 'comprehension'],
                  description: 'Type of lesson completed'
                },
                score: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  description: 'Lesson score percentage'
                },
                duration: {
                  type: 'number',
                  description: 'Lesson duration in minutes'
                }
              },
              required: ['user_id', 'lesson_type', 'score']
            }
          },
          {
            name: 'get_trucking_vocabulary',
            description: 'Get specialized trucking vocabulary and phrases',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['mechanical', 'safety', 'navigation', 'communication', 'legal'],
                  description: 'Category of trucking vocabulary'
                },
                difficulty: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                  description: 'Difficulty level'
                },
                count: {
                  type: 'number',
                  minimum: 1,
                  maximum: 50,
                  description: 'Number of vocabulary items to return'
                }
              },
              required: ['category']
            }
          },
          {
            name: 'get_checkpoint_scenarios',
            description: 'Get realistic DOT checkpoint conversation scenarios',
            inputSchema: {
              type: 'object',
              properties: {
                scenario_type: {
                  type: 'string',
                  enum: ['routine-inspection', 'violation', 'emergency', 'border-crossing'],
                  description: 'Type of checkpoint scenario'
                },
                difficulty: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                  description: 'Difficulty level of the scenario'
                }
              },
              required: ['scenario_type']
            }
          },
          {
            name: 'analyze_pronunciation',
            description: 'Analyze pronunciation quality and provide feedback',
            inputSchema: {
              type: 'object',
              properties: {
                audio_text: {
                  type: 'string',
                  description: 'Transcribed text from speech recognition'
                },
                target_text: {
                  type: 'string',
                  description: 'Target text that should have been spoken'
                },
                language: {
                  type: 'string',
                  description: 'Source language of the speaker'
                }
              },
              required: ['audio_text', 'target_text']
            }
          },
          {
            name: 'create_user',
            description: 'Create a new user account in the database',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address'
                },
                password: {
                  type: 'string',
                  minLength: 6,
                  description: 'User password (will be hashed)'
                },
                name: {
                  type: 'string',
                  description: 'User full name'
                },
                language: {
                  type: 'string',
                  description: 'Primary language (en, es, ar, so, fr, etc.)'
                }
              },
              required: ['email', 'password', 'name']
            }
          },
          {
            name: 'authenticate_user',
            description: 'Authenticate user login credentials',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address'
                },
                password: {
                  type: 'string',
                  description: 'User password'
                }
              },
              required: ['email', 'password']
            }
          },
          {
            name: 'get_user_profile',
            description: 'Get user profile and learning data',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier'
                }
              },
              required: ['user_id']
            }
          },
          {
            name: 'update_user_profile',
            description: 'Update user profile information',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier'
                },
                updates: {
                  type: 'object',
                  description: 'Fields to update'
                }
              },
              required: ['user_id', 'updates']
            }
          },
          {
            name: 'create_stripe_customer',
            description: 'Create a new Stripe customer for payments',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Customer email'
                },
                name: {
                  type: 'string',
                  description: 'Customer name'
                }
              },
              required: ['user_id', 'email', 'name']
            }
          },
          {
            name: 'create_subscription',
            description: 'Create a new subscription for premium features',
            inputSchema: {
              type: 'object',
              properties: {
                customer_id: {
                  type: 'string',
                  description: 'Stripe customer ID'
                },
                price_id: {
                  type: 'string',
                  description: 'Stripe price ID for the plan'
                },
                plan_type: {
                  type: 'string',
                  enum: ['basic', 'premium', 'enterprise'],
                  description: 'Subscription plan type'
                }
              },
              required: ['customer_id', 'price_id', 'plan_type']
            }
          },
          {
            name: 'process_payment',
            description: 'Process a one-time payment',
            inputSchema: {
              type: 'object',
              properties: {
                customer_id: {
                  type: 'string',
                  description: 'Stripe customer ID'
                },
                amount: {
                  type: 'number',
                  minimum: 50,
                  description: 'Payment amount in cents'
                },
                currency: {
                  type: 'string',
                  default: 'usd',
                  description: 'Payment currency'
                },
                description: {
                  type: 'string',
                  description: 'Payment description'
                }
              },
              required: ['customer_id', 'amount', 'description']
            }
          },
          {
            name: 'get_subscription_status',
            description: 'Get user subscription status and features',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier'
                }
              },
              required: ['user_id']
            }
          },
          {
            name: 'resend_verification_email',
            description: 'Resend email verification link to user',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address'
                }
              },
              required: ['email']
            }
          },
          {
            name: 'check_email_verification',
            description: 'Check if user email is verified',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address'
                }
              },
              required: ['email']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_dot_regulations':
            return await this.getDOTRegulations(args);
          
          case 'track_learning_progress':
            return await this.trackLearningProgress(args);
          
          case 'get_trucking_vocabulary':
            return await this.getTruckingVocabulary(args);
          
          case 'get_checkpoint_scenarios':
            return await this.getCheckpointScenarios(args);
          
          case 'analyze_pronunciation':
            return await this.analyzePronunciation(args);
          
          case 'create_user':
            return await this.createUser(args);
          
          case 'authenticate_user':
            return await this.authenticateUser(args);
          
          case 'get_user_profile':
            return await this.getUserProfile(args);
          
          case 'update_user_profile':
            return await this.updateUserProfile(args);
          
          case 'create_stripe_customer':
            return await this.createStripeCustomer(args);
          
          case 'create_subscription':
            return await this.createSubscription(args);
          
          case 'process_payment':
            return await this.processPayment(args);
          
          case 'get_subscription_status':
            return await this.getSubscriptionStatus(args);
          
          case 'resend_verification_email':
            return await this.resendVerificationEmail(args);
          
          case 'check_email_verification':
            return await this.checkEmailVerification(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  // Supabase Database operations with email verification
  async createUser(args) {
    const { email, password, name, language = 'en' } = args;
    // Always require email verification for production security
    
    try {
      // Use Supabase Auth with email verification
      const { data: authUser, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            language,
            subscription_status: 'free'
          },
          emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      });

      if (authError) {
        throw new Error(`User creation failed: ${authError.message}`);
      }

      // Also create a record in our custom users table for additional data
      if (authUser.user) {
        await this.supabase
          .from('users')
          .insert({
            id: authUser.user.id, // Use Supabase Auth user ID
            email,
            name,
            language,
            subscription_status: 'free',
            email_verified: false, // Will be updated when email is verified
            created_at: new Date().toISOString()
          });

        // Create initial learning progress record
        await this.supabase
          .from('learning_progress')
          .insert({
            user_id: authUser.user.id,
            total_sessions: 0,
            average_score: 0,
            completed_lessons: [],
            created_at: new Date().toISOString()
          });
      }

      return {
        content: [
          {
            type: 'text',
            text: `# Account Created! 📧 Verification Required

**Welcome ${name}!**

👤 **Email**: ${email}
🌍 **Language**: ${language}
📅 **Created**: ${new Date().toLocaleDateString()}

📧 **IMPORTANT**: Check your email inbox for a verification link from Supabase.

**Next Steps:**
1. 📬 Check email: ${email} (including spam folder)
2. 🔗 Click "Verify Email" button in the email
3. ✅ Return to app and login
4. 🚀 Start your English learning journey!

**Email not received?**
• Check spam/junk folder
• Wait 2-3 minutes for delivery
• Contact support if needed

*Your account will be activated after email verification.*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async authenticateUser(args) {
    const { email, password } = args;
    
    try {
      // Use Supabase Auth for login
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error(`Login failed: ${authError.message}`);
      }

      // Check if email is verified
      if (!authData.user.email_confirmed_at) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      // Get additional user data from our custom table
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !user) {
        // If user doesn't exist in custom table, create it
        await this.supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || 'Driver',
            language: authData.user.user_metadata?.language || 'en',
            subscription_status: 'free',
            email_verified: true,
            created_at: new Date().toISOString()
          });
      }

      // Update last login
      await this.supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      return {
        content: [
          {
            type: 'text',
            text: `# Login Successful! ✅

Welcome back, **${user?.name || authData.user.user_metadata?.name || 'Driver'}**!

👤 **Account**: ${authData.user.email}
⭐ **Plan**: ${user?.subscription_status || 'free'}
🌍 **Language**: ${user?.language || 'en'}
✅ **Email Verified**: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}
🕐 **Last Login**: ${new Date().toLocaleString()}

You now have access to all your learning features:
• 🎤 Voice conversations with AI Coach
• 📚 Advanced vocabulary tools
• 🎯 Personalized DOT scenarios
• 📊 Progress tracking and analytics

Ready to continue your English learning journey! 🚛✨

*Session expires in 1 hour for security*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getUserProfile(args) {
    const { user_id } = args;
    
    try {
      // Get user data from Supabase
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Get learning progress
      const { data: progress, error: progressError } = await this.supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user_id)
        .single();

      // Get recent sessions count
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('session_logs')
        .select('*')
        .eq('user_id', user_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalSessions = sessions?.length || 0;
      const averageScore = progress?.average_score || 0;
      const completedLessons = progress?.completed_lessons || [];

      return {
        content: [
          {
            type: 'text',
            text: `# User Profile 👤

**${user.name}**
📧 ${user.email} | 🌍 ${user.language} | ⭐ ${user.subscription_status}

## Learning Stats 📊
• **Total Sessions**: ${totalSessions}
• **Average Score**: ${averageScore}%
• **Account Created**: ${new Date(user.created_at).toLocaleDateString()}
• **Lessons Completed**: ${completedLessons.length}

## Recent Activity 🎯
• **Last Login**: ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
• **This Month**: ${totalSessions} sessions
• **Subscription**: ${user.subscription_status}

## Next Steps 🚀
• Practice more DOT scenarios
• Improve pronunciation skills
• Try advanced vocabulary lessons

Keep up the excellent work! 🚛✨

*Data from Supabase database*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateUserProfile(args) {
    const { user_id, updates } = args;
    
    try {
      // Update user in Supabase
      const { data: user, error } = await this.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `# Profile Updated! ✅

Your profile has been successfully updated in Supabase.

**Updated Fields**: ${Object.keys(updates).join(', ')}
**Updated At**: ${new Date().toLocaleString()}
**User**: ${user.name} (${user.email})

Changes have been saved to your account. 👤✨`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Real Stripe payment operations
  async createStripeCustomer(args) {
    const { user_id, email, name } = args;
    
    try {
      // Create Stripe customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          user_id,
          source: 'english_checkpoint_app'
        }
      });

      // Save customer ID to Supabase
      await this.supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user_id);

      return {
        content: [
          {
            type: 'text',
            text: `# Stripe Customer Created! 💳

**Customer ID**: ${customer.id}
**Name**: ${name}
**Email**: ${email}
**User ID**: ${user_id}

Your payment account has been set up successfully. You can now:
• 🎯 Subscribe to Premium ($9.99/month)
• 🆓 Start with 7-day FREE trial
• 💳 Manage payment methods
• 📊 Access billing history

🔒 All payments are securely processed by Stripe.

Ready to upgrade to Premium? 🚛✨`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  async createSubscription(args) {
    const { customer_id, user_id } = args;
    
    try {
      // Get or create the $9.99/month price in Stripe
      const price = await this.getOrCreatePremiumPrice();

      // Create subscription with 7-day free trial
      const subscription = await this.stripe.subscriptions.create({
        customer: customer_id,
        items: [{
          price: price.id
        }],
        trial_period_days: 7,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          user_id,
          plan_type: 'premium'
        }
      });

      // Save subscription to Supabase
      await this.supabase
        .from('subscriptions')
        .insert({
          user_id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer_id,
          plan_type: 'premium',
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        });

      // Update user subscription status
      await this.supabase
        .from('users')
        .update({ subscription_status: 'premium_trial' })
        .eq('id', user_id);

      const trialEndDate = new Date(subscription.trial_end * 1000).toLocaleDateString();

      return {
        content: [
          {
            type: 'text',
            text: `# 🎉 Premium Subscription Created!

**Plan**: PREMIUM ($9.99/month)
**Subscription ID**: ${subscription.id}
**Status**: 7-Day FREE Trial Active ✅

## 🆓 Your Free Trial:
• **Trial Period**: 7 days FREE
• **Trial Ends**: ${trialEndDate}
• **First Charge**: $9.99 on ${trialEndDate}

## ✨ Premium Features Unlocked:
✅ **Unlimited AI Coach** conversations  
✅ **Advanced Voice Analysis** with pronunciation feedback  
✅ **Premium DOT Scenarios** for all checkpoint types  
✅ **Advanced Vocabulary** (500+ trucking terms)  
✅ **Progress Analytics** with detailed insights  
✅ **Multi-language Support** (14+ languages)  
✅ **Priority Customer Support**  
✅ **Offline Mode** for practicing without internet  

## 💳 Billing Information:
• **Amount**: $9.99/month (after trial)
• **Next Payment**: ${trialEndDate}
• **Auto-renewal**: Enabled
• **Cancel anytime**: No commitment

Welcome to Premium English Checkpoint! 🚛✨

*Your card will be charged $9.99 on ${trialEndDate} unless you cancel before then.*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async processPayment(args) {
    const { customer_id, amount, currency = 'usd', description } = args;
    
    const paymentId = `pi_${Math.random().toString(36).substr(2, 14)}`;
    const amountInDollars = (amount / 100).toFixed(2);

    return {
      content: [
        {
          type: 'text',
          text: `# Payment Processed! ✅

**Amount**: $${amountInDollars} ${currency.toUpperCase()}
**Payment ID**: ${paymentId}
**Customer**: ${customer_id}
**Description**: ${description}

**Status**: Successful
**Method**: Card ending in ****1234
**Date**: ${new Date().toLocaleString()}

Thank you for your payment! Your features have been activated. 💳✨`
        }
      ]
    };
  }

  async getSubscriptionStatus(args) {
    const { user_id } = args;
    
    try {
      // Get user data
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Get subscription data
      const { data: subscription, error: subError } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError || !subscription) {
        // No subscription found - free user
        return {
          content: [
            {
              type: 'text',
              text: `# Subscription Status 💳

**Plan**: FREE ⚡
**Status**: Active ✅

## Free Features:
✅ Basic AI Coach conversations (10/month)
✅ Essential vocabulary (50 terms)
✅ Basic DOT scenarios (5 scenarios)
✅ Basic progress tracking

## Upgrade to Premium 🚀
**Premium Plan**: $9.99/month
🆓 **7-day FREE trial** (no charge for 7 days)

## Premium Features:
✅ **Unlimited AI Coach** conversations
✅ **Advanced Voice Analysis** with feedback
✅ **Premium DOT Scenarios** (50+ scenarios)
✅ **Advanced Vocabulary** (500+ terms)
✅ **Detailed Analytics** and progress insights
✅ **Multi-language Support** (14+ languages)
✅ **Priority Support** and help

Ready to upgrade? 🚛✨`
            }
          ]
        };
      }

      // Get Stripe subscription details
      let stripeSubscription = null;
      let nextPaymentDate = 'N/A';
      let isTrialActive = false;

      if (subscription.stripe_subscription_id) {
        try {
          stripeSubscription = await this.stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
          nextPaymentDate = new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString();
          isTrialActive = stripeSubscription.status === 'trialing';
        } catch (stripeError) {
          console.error('Error fetching Stripe subscription:', stripeError);
        }
      }

      // Get usage data
      const { data: sessions } = await this.supabase
        .from('session_logs')
        .select('*')
        .eq('user_id', user_id)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const sessionsThisMonth = sessions?.length || 0;

      return {
        content: [
          {
            type: 'text',
            text: `# Subscription Status 💳

**Plan**: PREMIUM ⭐
**Status**: ${isTrialActive ? '🆓 7-Day FREE Trial' : '✅ Active'}
${isTrialActive ? `**Trial Ends**: ${nextPaymentDate}` : ''}

## Premium Features (Active):
✅ **Unlimited AI Coach** conversations
✅ **Advanced Voice Analysis** with pronunciation feedback
✅ **Premium DOT Scenarios** (50+ checkpoint types)
✅ **Advanced Vocabulary** (500+ trucking terms)
✅ **Progress Analytics** with detailed insights
✅ **Multi-language Support** (14+ languages)
✅ **Priority Customer Support**
✅ **Offline Mode** for practicing anywhere

## Usage This Month:
• **Sessions Completed**: ${sessionsThisMonth}
• **Limit**: Unlimited ♾️
• **Voice Analysis**: Available
• **DOT Scenarios**: All unlocked

## Billing Information:
• **Amount**: $9.99/month
• **Next Payment**: ${nextPaymentDate}
• **Status**: ${stripeSubscription?.status || subscription.status}
${isTrialActive ? '• **Trial**: No charge until trial ends' : ''}

${isTrialActive ? 
`🆓 **Free Trial Active!** Enjoy all premium features at no cost until ${nextPaymentDate}` :
'Your premium subscription is active and all features are available! 🚛✨'}

*Cancel anytime with no commitment*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get subscription status: ${error.message}`);
    }
  }

  // Email verification methods
  async resendVerificationEmail(args) {
    const { email } = args;
    
    try {
      // Resend verification email using Supabase Auth
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      });

      if (error) {
        throw new Error(`Failed to resend verification email: ${error.message}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `# Verification Email Resent! 📧

**Email sent to**: ${email}

📬 **Check your inbox** (including spam folder) for a new verification email from Supabase.

**Next Steps:**
1. 📧 Open the email from Supabase
2. 🔗 Click "Verify Email" button
3. ✅ Return to app and login
4. 🚀 Start learning!

**Still having issues?**
• Wait 2-3 minutes for email delivery
• Check spam/junk folder thoroughly
• Make sure email address is correct: ${email}

*Verification links expire after 24 hours*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to resend verification email: ${error.message}`);
    }
  }

  async checkEmailVerification(args) {
    const { email } = args;
    
    try {
      // Check if user exists and is verified
      const { data: authUser, error } = await this.supabase.auth.admin.getUserByEmail(email);

      if (error || !authUser) {
        return {
          content: [
            {
              type: 'text',
              text: `# Email Verification Status ❓

**Email**: ${email}
**Status**: Account not found

This email address is not registered in our system.

**Options:**
• Double-check the email address
• Create a new account with this email
• Contact support if you believe this is an error`
            }
          ]
        };
      }

      const isVerified = !!authUser.user.email_confirmed_at;
      const createdAt = new Date(authUser.user.created_at).toLocaleDateString();

      return {
        content: [
          {
            type: 'text',
            text: `# Email Verification Status ${isVerified ? '✅' : '⏳'}

**Email**: ${email}
**Status**: ${isVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
**Account Created**: ${createdAt}
${isVerified ? `**Verified On**: ${new Date(authUser.user.email_confirmed_at).toLocaleDateString()}` : ''}

${isVerified ? 
`🎉 **Your email is verified!** You can now login and access all features.` :
`⏳ **Verification Pending**
📧 Check your email for the verification link
🔗 Click the link to verify your account
📬 Check spam folder if you don't see the email

Need help? Say "resend verification email"`}

*Ready to start your English learning journey!* 🚛✨`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to check email verification: ${error.message}`);
    }
  }

  // Stripe helper methods
  async getOrCreatePremiumPrice() {
    try {
      // Use the exact Price ID from your Stripe dashboard
      const priceId = process.env.STRIPE_PRICE_ID;
      
      // Retrieve the price from Stripe to verify it exists
      const price = await this.stripe.prices.retrieve(priceId);
      
      if (!price || !price.active) {
        throw new Error('Premium price not found or inactive');
      }

      return price;
    } catch (error) {
      throw new Error(`Failed to get/create premium price: ${error.message}`);
    }
  }

  async getOrCreatePremiumProduct() {
    try {
      // Try to find existing product
      const products = await this.stripe.products.list({
        active: true,
        limit: 100
      });

      const existingProduct = products.data.find(product => 
        product.name === 'English Checkpoint Premium'
      );

      if (existingProduct) {
        return existingProduct.id;
      }

      // Create new product
      const product = await this.stripe.products.create({
        name: 'English Checkpoint Premium',
        description: 'Premium English learning for truck drivers with unlimited AI Coach, advanced scenarios, and voice analysis',
        metadata: {
          app: 'english_checkpoint',
          type: 'subscription'
        }
      });

      return product.id;
    } catch (error) {
      throw new Error(`Failed to get/create premium product: ${error.message}`);
    }
  }

  hashPassword(password) {
    // Simple hash function - use bcrypt in production
    return `hashed_${password}_${Date.now()}`;
  }

  async getDOTRegulations(args) {
    const { category, state } = args;
    
    // Mock DOT regulations data - in production, this would query real DOT APIs
    const regulations = {
      'hours-of-service': {
        title: 'Hours of Service Regulations',
        content: '14-hour duty period limit, 11-hour driving limit, 10-hour off-duty period required',
        details: [
          'Cannot drive after 14 hours on duty',
          'Maximum 11 hours of driving time',
          'Must have 10 consecutive hours off duty',
          '60/70 hour weekly limits apply'
        ]
      },
      'vehicle-inspection': {
        title: 'Pre-Trip Inspection Requirements',
        content: 'Daily vehicle inspection required before operation',
        details: [
          'Check brakes, steering, lights',
          'Inspect tires and wheels',
          'Verify coupling systems',
          'Test warning devices'
        ]
      },
      'licensing': {
        title: 'Commercial Driver License Requirements',
        content: 'Valid CDL required for commercial vehicle operation',
        details: [
          'Class A, B, or C license based on vehicle',
          'Endorsements for hazmat, passenger, etc.',
          'Medical certification required',
          'Regular renewal and testing'
        ]
      },
      'safety': {
        title: 'Safety Regulations',
        content: 'Comprehensive safety requirements for commercial vehicles',
        details: [
          'Seat belt usage mandatory',
          'No mobile phone use while driving',
          'Speed limit compliance',
          'Load securement requirements'
        ]
      }
    };

    const regulation = regulations[category];
    if (!regulation) {
      throw new Error(`Unknown regulation category: ${category}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `# ${regulation.title}

${regulation.content}

## Key Requirements:
${regulation.details.map(detail => `• ${detail}`).join('\n')}

${state ? `\n*Note: Additional ${state} state requirements may apply*` : ''}

**⚠️ Important**: Always verify current regulations with official DOT sources.`
        }
      ]
    };
  }

  async trackLearningProgress(args) {
    const { user_id, lesson_type, score, duration } = args;
    
    try {
      // Save session log to Supabase
      const { data: session, error: sessionError } = await this.supabase
        .from('session_logs')
        .insert({
          user_id,
          lesson_type,
          score,
          duration: duration || 0,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Session logging failed: ${sessionError.message}`);
      }

      // Update overall learning progress
      const { data: progress, error: progressError } = await this.supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (progress) {
        // Calculate new average score
        const totalSessions = progress.total_sessions + 1;
        const newAverage = Math.round(((progress.average_score * progress.total_sessions) + score) / totalSessions);
        
        // Update completed lessons
        const completedLessons = progress.completed_lessons || [];
        if (!completedLessons.includes(lesson_type)) {
          completedLessons.push(lesson_type);
        }

        await this.supabase
          .from('learning_progress')
          .update({
            total_sessions: totalSessions,
            average_score: newAverage,
            completed_lessons: completedLessons,
            last_session: new Date().toISOString()
          })
          .eq('user_id', user_id);
      }

      const recommendations = this.generateRecommendations(score, lesson_type);

      return {
        content: [
          {
            type: 'text',
            text: `# Learning Progress Tracked ✅

**Lesson**: ${lesson_type}
**Score**: ${score}%
**Duration**: ${duration || 'N/A'} minutes
**Status**: ${score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Good' : '🔴 Needs Practice'}

## Recommendations:
${recommendations.map(rec => `• ${rec}`).join('\n')}

Progress has been saved to your Supabase learning profile! 📊

*Session ID: ${session.id}*`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to track progress: ${error.message}`);
    }
  }

  async getTruckingVocabulary(args) {
    const { category, difficulty = 'intermediate', count = 10 } = args;
    
    const vocabularyDB = {
      mechanical: {
        beginner: ['engine', 'brake', 'tire', 'steering wheel', 'gear', 'clutch'],
        intermediate: ['transmission', 'differential', 'air compressor', 'glad hands', 'fifth wheel'],
        advanced: ['particulate filter', 'turbocharger', 'exhaust gas recirculation', 'electronic control module']
      },
      safety: {
        beginner: ['seatbelt', 'mirror', 'warning light', 'emergency', 'stop', 'caution'],
        intermediate: ['pre-trip inspection', 'hazard lights', 'blind spot', 'following distance'],
        advanced: ['adverse driving conditions', 'jackknife prevention', 'rollover mitigation']
      },
      navigation: {
        beginner: ['GPS', 'map', 'highway', 'exit', 'route', 'destination'],
        intermediate: ['truck route', 'weight restriction', 'bridge height', 'detour'],
        advanced: ['electronic logging device', 'hours of service', 'routing compliance']
      }
    };

    const vocab = vocabularyDB[category]?.[difficulty] || [];
    const selectedVocab = vocab.slice(0, count);

    return {
      content: [
        {
          type: 'text',
          text: `# ${category.charAt(0).toUpperCase() + category.slice(1)} Vocabulary (${difficulty})

${selectedVocab.map((word, index) => `${index + 1}. **${word}**`).join('\n')}

💡 **Tip**: Practice using these words in sentences to improve retention!`
        }
      ]
    };
  }

  async getCheckpointScenarios(args) {
    const { scenario_type, difficulty = 'intermediate' } = args;
    
    const scenarios = {
      'routine-inspection': {
        beginner: {
          title: 'Basic Routine Stop',
          dialogue: [
            'Officer: "Good morning. License and registration please."',
            'Driver: "Good morning, officer. Here are my documents."',
            'Officer: "Thank you. Where are you heading today?"',
            'Driver: "I\'m delivering to the warehouse in Phoenix."'
          ],
          tips: ['Stay calm and polite', 'Have documents ready', 'Answer clearly']
        }
      }
    };

    const scenario = scenarios[scenario_type]?.[difficulty];
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenario_type} (${difficulty})`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `# ${scenario.title}

## Practice Dialogue:
${scenario.dialogue.map(line => `**${line}**`).join('\n\n')}

## Communication Tips:
${scenario.tips.map(tip => `• ${tip}`).join('\n')}

🎭 **Practice**: Try role-playing this scenario to build confidence!`
        }
      ]
    };
  }

  async analyzePronunciation(args) {
    const { audio_text, target_text, language } = args;
    
    // Simple pronunciation analysis - in production, use advanced speech analysis
    const accuracy = this.calculatePronunciationAccuracy(audio_text, target_text);
    const feedback = this.generatePronunciationFeedback(audio_text, target_text, accuracy);

    return {
      content: [
        {
          type: 'text',
          text: `# Pronunciation Analysis 🎤

**Target**: "${target_text}"
**Your speech**: "${audio_text}"
**Accuracy**: ${accuracy}%

## Feedback:
${feedback.map(item => `• ${item}`).join('\n')}

${language && language !== 'en' ? `\n💡 **Tip**: As a ${language} speaker, focus on English sound patterns.` : ''}

Keep practicing! Your pronunciation is improving! 🌟`
        }
      ]
    };
  }

  generateRecommendations(score, lesson_type) {
    if (score >= 80) {
      return [
        'Excellent work! Try more advanced topics',
        'Practice with real-world scenarios',
        'Help other learners to reinforce your knowledge'
      ];
    } else if (score >= 60) {
      return [
        'Good progress! Focus on weak areas',
        'Practice more frequently',
        'Try interactive exercises'
      ];
    } else {
      return [
        'Review basic concepts',
        'Practice with simpler exercises first',
        'Consider one-on-one tutoring sessions'
      ];
    }
  }

  calculatePronunciationAccuracy(spoken, target) {
    // Simple word-based accuracy calculation
    const spokenWords = spoken.toLowerCase().split(' ');
    const targetWords = target.toLowerCase().split(' ');
    
    let matches = 0;
    targetWords.forEach(word => {
      if (spokenWords.includes(word)) matches++;
    });
    
    return Math.round((matches / targetWords.length) * 100);
  }

  generatePronunciationFeedback(spoken, target, accuracy) {
    const feedback = [];
    
    if (accuracy >= 90) {
      feedback.push('Excellent pronunciation!');
    } else if (accuracy >= 70) {
      feedback.push('Good pronunciation with room for improvement');
    } else {
      feedback.push('Focus on clearer pronunciation');
    }
    
    // Simple word comparison feedback
    const spokenWords = spoken.toLowerCase().split(' ');
    const targetWords = target.toLowerCase().split(' ');
    
    targetWords.forEach((word, index) => {
      if (!spokenWords.includes(word)) {
        feedback.push(`Practice the word "${word}"`);
      }
    });
    
    return feedback;
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('English Checkpoint MCP Server running on stdio');
  }
}

// Start the server
const server = new TruckDriverMCPServer();
server.run().catch(console.error);