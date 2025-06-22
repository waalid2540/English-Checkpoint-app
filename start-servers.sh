#!/bin/bash

echo "🚛 Starting English Checkpoint Servers..."
echo "========================================"

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "simple-server.cjs" 2>/dev/null || true
pkill -f "python.*900" 2>/dev/null || true
pkill -f "serve.*900" 2>/dev/null || true

sleep 2

# Start backend
echo "🚀 Starting backend server on port 3003..."
node simple-server.cjs &
BACKEND_PID=$!

sleep 3

# Test backend
if curl -s http://localhost:3003/api/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:3003"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server on port 9000..."
cd dist
python3 -m http.server 9000 &
FRONTEND_PID=$!
cd ..

sleep 3

# Test frontend
if curl -s http://localhost:9000 > /dev/null; then
    echo "✅ Frontend server is running on http://localhost:9000"
    echo ""
    echo "🎉 All servers are running!"
    echo ""
    echo "📱 Access your app at: http://localhost:9000"
    echo "🔧 Backend API at: http://localhost:3003"
    echo ""
    echo "🔐 Features available:"
    echo "  - Login/Signup with Supabase authentication"
    echo "  - AI Coach with GPT-4 and Google TTS"
    echo "  - Voice conversation with speech recognition"
    echo "  - Multi-language support"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    # Wait for user interrupt
    wait
else
    echo "❌ Frontend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi