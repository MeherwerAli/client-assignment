#!/bin/bash

# Start both backend and frontend for full development setup
echo "🚀 Starting Full Chat Application Stack..."

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to start backend
start_backend() {
    echo "🔧 Starting chat service backend..."
    cd ../chats-service
    
    if [ ! -f "package.json" ]; then
        echo "❌ Backend package.json not found. Please ensure the chats-service directory exists."
        return 1
    fi
    
    # Install backend dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Start backend in background
    npm run serve:local > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ Backend started with PID: $BACKEND_PID"
    echo "📋 Backend logs are being written to backend.log"
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is responding
    if curl -f http://localhost:3002/chats-service/api/v1/health 2>/dev/null; then
        echo "✅ Backend is responding on port 3002"
    else
        echo "⚠️  Backend may still be starting up..."
    fi
    
    cd ../chat-frontend
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting chat frontend..."
    
    # Install frontend dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Ensure environment file exists
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✅ Created .env file"
    fi
    
    echo "🌐 Starting frontend development server..."
    npm start
}

# Check if ports are available
if check_port 3002; then
    echo "⚠️  Port 3002 is already in use. Backend may already be running."
    echo "   Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Aborting startup"
        exit 1
    fi
else
    start_backend
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Frontend may already be running."
    echo "   Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Aborting frontend startup"
        exit 1
    fi
fi

echo ""
echo "🎯 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start frontend (this will block)
start_frontend