#!/bin/bash

# Chat Frontend Development Setup Script
echo "🚀 Setting up Chat Frontend Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the chat-frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📋 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "📝 Please review and update the .env file with your specific configuration."
else
    echo "✅ Environment file already exists"
fi

# Check if backend is running
echo "🔍 Checking if chat service backend is running..."
if curl -f http://localhost:3002/chats-service/api/v1/health 2>/dev/null; then
    echo "✅ Chat service backend is running"
else
    echo "⚠️  Chat service backend is not running on port 3002"
    echo "   Please start the backend service before using the frontend"
fi

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type checking found some issues, but continuing..."
else
    echo "✅ Type checking passed"
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   • npm start       - Start development server"
echo "   • npm run build   - Build for production"
echo "   • npm test        - Run tests"
echo "   • npm run lint    - Check code style"
echo ""
echo "📱 The app will be available at http://localhost:3000"
echo "🔧 Make sure the chat service backend is running on port 3002"