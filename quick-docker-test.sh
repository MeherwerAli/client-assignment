#!/bin/bash

# Quick Docker Test Runner - builds and tests the chat service
# This script is useful for CI/CD or quick local testing

set -e

echo "🧪 Quick Docker Test for Chat Service"

# Navigate to project root
cd "$(dirname "$0")"

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Quick health check
echo "🔍 Performing health check..."
if curl -s -f http://localhost:3002/chats-service/api/v1/health \
   -H "x-api-key: dev-api-key-2024" \
   -H "Unique-Reference-Code: docker-test"; then
    echo "✅ Chat service is healthy!"
else
    echo "❌ Chat service health check failed!"
    docker-compose logs chat-service
    docker-compose down
    exit 1
fi

# Quick API test
echo "🚀 Testing basic API functionality..."

# Create session
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3002/chats-service/api/v1/chats \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key-12345" \
  -H "Unique-Reference-Code: docker-test-create" \
  -d '{"title": "Docker Test Session"}')

if echo "$SESSION_RESPONSE" | grep -q '"id"'; then
    echo "✅ Session creation works!"
    SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "📝 Created session: $SESSION_ID"
else
    echo "❌ Session creation failed!"
    echo "Response: $SESSION_RESPONSE"
    docker-compose down
    exit 1
fi

# Add message
MESSAGE_RESPONSE=$(curl -s -X POST "http://localhost:3002/chats-service/api/v1/chats/$SESSION_ID/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key-12345" \
  -H "Unique-Reference-Code: docker-test-message" \
  -d '{"sender": "user", "content": "Hello from Docker test!"}')

if echo "$MESSAGE_RESPONSE" | grep -q '"id"'; then
    echo "✅ Message creation works!"
else
    echo "❌ Message creation failed!"
    echo "Response: $MESSAGE_RESPONSE"
fi

# Get messages
MESSAGES_RESPONSE=$(curl -s "http://localhost:3002/chats-service/api/v1/chats/$SESSION_ID/messages" \
  -H "x-api-key: test-api-key-12345" \
  -H "Unique-Reference-Code: docker-test-get")

if echo "$MESSAGES_RESPONSE" | grep -q "Hello from Docker test!"; then
    echo "✅ Message retrieval works!"
else
    echo "❌ Message retrieval failed!"
    echo "Response: $MESSAGES_RESPONSE"
fi

# Cleanup
curl -s -X DELETE "http://localhost:3002/chats-service/api/v1/chats/$SESSION_ID" \
  -H "x-api-key: test-api-key-12345" \
  -H "Unique-Reference-Code: docker-test-cleanup" >/dev/null

echo "🧹 Stopping services..."
docker-compose down

echo "🎉 Docker test completed successfully!"
echo ""
echo "To run full automation tests, use: ./run-automation-tests.sh"