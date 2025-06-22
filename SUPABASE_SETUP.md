# 🚀 Supabase Setup Guide for English Checkpoint

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email
4. Once logged in, click "New Project"
5. Fill in project details:
   - **Project Name**: `english-checkpoint-truck-driver`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Organization**: Create new or use existing

## Step 2: Get Your Project Credentials

After project is created (takes ~2 minutes):

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Project API Keys** > **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Configure Environment Variables

Create the environment file with your credentials:

```bash
# In the client folder, create .env file
cd client
echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." >> .env
```

## Step 4: Database Setup (Optional Custom Tables)

Run these SQL commands in Supabase SQL Editor if you want custom user profiles:

```sql
-- Create user profiles table
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  language_preference text default 'en',
  learning_progress jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table user_profiles enable row level security;

-- Create policy for users to see and edit their own profile
create policy "Users can view own profile" 
  on user_profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on user_profiles for update 
  using (auth.uid() = id);

-- Create trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, first_name, last_name, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 5: Email Settings (Optional)

Configure custom email templates:

1. Go to **Authentication** > **Email Templates**
2. Customize:
   - **Confirm signup**: Welcome message for truck drivers
   - **Reset password**: Professional password reset email
   - **Magic link**: If using magic link login

## Step 6: Authentication Settings

1. Go to **Authentication** > **Settings**
2. Configure:
   - **Site URL**: `http://localhost:8080` (for development)
   - **Redirect URLs**: Add your production domain later
   - **Email confirmations**: Enable (recommended)
   - **Double confirm email changes**: Enable for security

## Step 7: Test Your Setup

1. Start your servers:
```bash
# Terminal 1 - Backend
node simple-server.cjs

# Terminal 2 - Frontend  
cd dist && python3 -m http.server 8080
```

2. Visit `http://localhost:8080`
3. Try creating an account
4. Check your email for confirmation
5. Test login after confirmation

## 🔧 Troubleshooting

### Issue: "Invalid API key"
- Double-check your VITE_SUPABASE_ANON_KEY in .env
- Make sure .env is in the client folder
- Rebuild: `npm run build`

### Issue: "User not confirmed"
- Check your email for confirmation link
- Check spam folder
- Use resend confirmation feature

### Issue: Email not working
- Verify email settings in Supabase dashboard
- For production, configure custom SMTP

## 📊 Database Structure

Your Supabase project includes:

- **auth.users**: Built-in user authentication
- **user_profiles**: Custom user data (optional)
- **Real-time subscriptions**: For live features (future)
- **Row Level Security**: Data protection

## 🚀 Production Deployment

When deploying to production:

1. Update Site URL in Supabase settings
2. Add production domain to redirect URLs  
3. Update .env with production URLs
4. Configure custom SMTP for emails
5. Set up custom domain (optional)

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

Your English Checkpoint app now has enterprise-level authentication! 🚛✨