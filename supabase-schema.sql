-- Supabase Database Schema for English Checkpoint Truck Driver App
-- Run this in your Supabase SQL Editor to create all required tables

-- 1. Users table (main user accounts)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  subscription_status VARCHAR(50) DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Learning progress table (overall user progress)
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]',
  streak_days INTEGER DEFAULT 0,
  last_session TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Session logs table (individual learning sessions)
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_type VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER DEFAULT 0, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 4. Subscriptions table (Stripe subscription data)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan_type VARCHAR(50) NOT NULL, -- basic, premium, enterprise
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payments table (payment history)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- succeeded, failed, pending
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Vocabulary table (custom trucking vocabulary)
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- mechanical, safety, navigation, etc.
  difficulty VARCHAR(50) NOT NULL, -- beginner, intermediate, advanced
  word VARCHAR(255) NOT NULL,
  definition TEXT,
  example_sentence TEXT,
  pronunciation VARCHAR(255),
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DOT scenarios table (checkpoint practice scenarios)
CREATE TABLE IF NOT EXISTS dot_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_type VARCHAR(100) NOT NULL, -- routine-inspection, violation, etc.
  difficulty VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  dialogue JSONB NOT NULL, -- array of dialogue lines
  tips JSONB DEFAULT '[]', -- array of communication tips
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User achievements table (gamification)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL, -- first_week, vocabulary_master, etc.
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_completed_at ON session_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON vocabulary(difficulty);
CREATE INDEX IF NOT EXISTS idx_dot_scenarios_type ON dot_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Policies for learning_progress table
CREATE POLICY "Users can view own progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON learning_progress FOR ALL USING (auth.uid() = user_id);

-- Policies for session_logs table
CREATE POLICY "Users can view own sessions" ON session_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON session_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (true);

-- Policies for payments table
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage payments" ON payments FOR ALL USING (true);

-- Policies for user_achievements table
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for vocabulary and scenarios (no auth required)
CREATE POLICY "Public read access" ON vocabulary FOR SELECT USING (true);
CREATE POLICY "Public read access" ON dot_scenarios FOR SELECT USING (true);

-- Insert some sample vocabulary data
INSERT INTO vocabulary (category, difficulty, word, definition, example_sentence) VALUES
('mechanical', 'beginner', 'engine', 'The motor that powers the truck', 'Check the engine oil before starting your trip.'),
('mechanical', 'beginner', 'brake', 'System used to stop the vehicle', 'Test your brakes during the pre-trip inspection.'),
('mechanical', 'intermediate', 'transmission', 'System that changes gears', 'The automatic transmission makes driving easier.'),
('mechanical', 'advanced', 'differential', 'Distributes power to wheels', 'The differential allows wheels to turn at different speeds.'),
('safety', 'beginner', 'seatbelt', 'Safety restraint system', 'Always wear your seatbelt while driving.'),
('safety', 'intermediate', 'blind spot', 'Area not visible in mirrors', 'Check your blind spots before changing lanes.'),
('navigation', 'beginner', 'GPS', 'Global positioning system', 'Use GPS to find the best truck routes.'),
('navigation', 'intermediate', 'truck route', 'Roads designated for commercial vehicles', 'Stay on designated truck routes to avoid restrictions.');

-- Insert some sample DOT scenarios
INSERT INTO dot_scenarios (scenario_type, difficulty, title, dialogue, tips) VALUES
('routine-inspection', 'beginner', 'Basic Routine Stop', 
 '["Officer: Good morning. License and registration please.", "Driver: Good morning, officer. Here are my documents.", "Officer: Thank you. Where are you heading today?", "Driver: I am delivering to the warehouse in Phoenix."]',
 '["Stay calm and polite", "Have documents ready", "Answer clearly and honestly"]'),
('routine-inspection', 'intermediate', 'Logbook Check',
 '["Officer: Can I see your logbook please?", "Driver: Of course, here it is.", "Officer: I see you have been driving for 9 hours today. When did you start?", "Driver: I started at 6 AM this morning after my 10-hour break."]',
 '["Keep accurate logbook records", "Know your hours of service", "Be prepared to explain your schedule"]'),
('violation', 'intermediate', 'Minor Equipment Issue',
 '["Officer: I noticed your left turn signal is not working.", "Driver: Oh no, I did not notice that. It was working this morning.", "Officer: You will need to get it fixed before continuing.", "Driver: I understand. Is there a repair shop nearby?"]',
 '["Stay calm when cited for violations", "Ask for repair recommendations", "Take responsibility professionally"]');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;