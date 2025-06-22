#!/bin/bash

echo "🚛 English Checkpoint - Supabase Setup Helper"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f "client/.env" ]; then
    echo "❌ .env file not found in client folder"
    exit 1
fi

echo "📋 Current .env configuration:"
echo "$(cat client/.env)"
echo ""

# Ask for Supabase URL
echo "🔗 Enter your Supabase Project URL (from Settings > API):"
echo "Example: https://abcdefghijklmnop.supabase.co"
read -p "URL: " SUPABASE_URL

# Ask for Anon Key
echo ""
echo "🔑 Enter your Supabase Anon Key (from Settings > API):"
echo "Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
read -p "Key: " SUPABASE_KEY

# Update .env file
echo "VITE_SUPABASE_URL=$SUPABASE_URL" > client/.env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY" >> client/.env

echo ""
echo "✅ .env file updated!"
echo ""
echo "📋 New configuration:"
echo "$(cat client/.env)"
echo ""

# Build the app
echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Start backend: node simple-server.cjs"
    echo "2. Start frontend: cd dist && python3 -m http.server 8080"
    echo "3. Visit: http://localhost:8080"
    echo "4. Create an account and test authentication!"
    echo ""
    echo "📚 See SUPABASE_SETUP.md for detailed instructions"
else
    echo ""
    echo "❌ Build failed. Please check your configuration."
fi