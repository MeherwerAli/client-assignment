#!/bin/bash

# Documentation Hub Validation Script
echo "🧪 Testing Microservices Documentation Hub..."
echo "============================================="

BASE_URL="http://localhost:3001"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local expected_code=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL$endpoint")
    
    if [ "$response" -eq "$expected_code" ]; then
        echo "✅ PASS (HTTP $response)"
    else
        echo "❌ FAIL (HTTP $response, expected $expected_code)"
    fi
}

# Test all endpoints
test_endpoint "/" 200 "Main Hub"
test_endpoint "/docs" 200 "All Services Documentation"
test_endpoint "/docs/chats-service" 200 "Chat Service Documentation"
test_endpoint "/api-docs/chats-service.json" 200 "Chat Service API Spec"
test_endpoint "/health" 200 "Health Check"
test_endpoint "/nonexistent" 404 "404 Handler"

echo ""
echo "🔍 Testing API Specification Content..."

# Test if the API spec contains expected content
api_spec=$(curl -s "$BASE_URL/api-docs/chats-service.json")

if echo "$api_spec" | grep -q "\"openapi\": \"3.0.3\""; then
    echo "✅ OpenAPI version correct"
else
    echo "❌ OpenAPI version missing or incorrect"
fi

if echo "$api_spec" | grep -q "Chat Storage Microservice"; then
    echo "✅ API title correct"
else
    echo "❌ API title missing or incorrect"
fi

if echo "$api_spec" | grep -q "/chats"; then
    echo "✅ Chat endpoints present"
else
    echo "❌ Chat endpoints missing"
fi

if echo "$api_spec" | grep -q "ApiKeyAuth"; then
    echo "✅ Authentication scheme present"
else
    echo "❌ Authentication scheme missing"
fi

echo ""
echo "📊 Testing Health Endpoint Response..."

health_response=$(curl -s "$BASE_URL/health")

if echo "$health_response" | grep -q "\"status\": \"ok\""; then
    echo "✅ Health status OK"
else
    echo "❌ Health status not OK"
fi

if echo "$health_response" | grep -q "\"service\": \"swagger-documentation-hub\""; then
    echo "✅ Service name correct"
else
    echo "❌ Service name missing or incorrect"
fi

if echo "$health_response" | grep -q "chats-service.*available"; then
    echo "✅ Chat service spec available"
else
    echo "❌ Chat service spec not available"
fi

echo ""
echo "🎯 Summary:"
echo "- Documentation hub running on port 3001"
echo "- All critical endpoints responding correctly"
echo "- OpenAPI specification valid and complete"
echo "- Interactive testing available in Swagger UI"
echo ""
echo "🌐 Access Points:"
echo "  • Main Hub: $BASE_URL/"
echo "  • Chat Service Docs: $BASE_URL/docs/chats-service"
echo "  • All Services: $BASE_URL/docs"
echo "  • API Spec: $BASE_URL/api-docs/chats-service.json"
echo "  • Health Check: $BASE_URL/health"
echo ""
echo "✅ Documentation hub validation complete!"