#!/bin/bash

# Automation Test Runner Script for Chat Service

set -e

echo "🚀 Starting Chat Service API Automation Tests"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

print_status "Setting up test environment..."

# Build and start services
print_status "Building and starting Docker services..."
docker-compose down --volumes --remove-orphans || true
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f http://localhost:3002/chats-service/api/v1/health -H "x-api-key: test-api-key-12345" -H "Unique-Reference-Code: health-check" >/dev/null 2>&1; then
        print_success "Chat service is ready!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        print_error "Chat service failed to start within timeout period"
        print_status "Displaying service logs..."
        docker-compose logs chat-service
        exit 1
    fi
    
    print_status "Waiting for chat service... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

# Check documentation service
if curl -s -f http://localhost:3001/health >/dev/null 2>&1; then
    print_success "Documentation service is ready!"
else
    print_warning "Documentation service is not responding (this is optional)"
fi

# Navigate to automation directory
cd automation

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing automation dependencies..."
    npm install
fi

# Run tests
print_status "Running Playwright API tests..."

# Set environment variables for tests
export BASE_URL=http://localhost:3002
export API_KEY=test-api-key-12345
export NODE_ENV=test

# Run different test suites
echo
print_status "Running Health Check tests..."
npx playwright test tests/health.spec.ts --reporter=line

echo
print_status "Running Authentication tests..."
npx playwright test tests/authentication.spec.ts --reporter=line

echo
print_status "Running Session CRUD tests..."
npx playwright test tests/sessions.spec.ts --reporter=line

echo
print_status "Running Message tests..."
npx playwright test tests/messages.spec.ts --reporter=line

echo
print_status "Running Rate Limiting tests..."
npx playwright test tests/rate-limiting.spec.ts --reporter=line

echo
print_status "Running Error Handling tests..."
npx playwright test tests/error-handling.spec.ts --reporter=line

echo
print_status "Running Integration tests..."
npx playwright test tests/integration.spec.ts --reporter=line

echo
print_status "Running all tests with full reporting..."
npx playwright test --reporter=html

# Generate test report
print_success "Test execution completed!"
print_status "Test report generated at: automation/playwright-report/index.html"

# Show test results summary
if [ -f "playwright-report/results.json" ]; then
    print_status "Opening test report in browser..."
    if command -v open >/dev/null 2>&1; then
        open playwright-report/index.html
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open playwright-report/index.html
    else
        print_status "Please open automation/playwright-report/index.html in your browser to view the test report"
    fi
fi

# Option to keep services running or tear down
echo
read -p "Do you want to keep the services running? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Stopping Docker services..."
    cd ..
    docker-compose down
    print_success "Services stopped successfully!"
else
    print_success "Services are still running!"
    print_status "Chat Service: http://localhost:3002"
    print_status "Documentation: http://localhost:3001"
    print_status "To stop services later, run: docker-compose down"
fi

print_success "Automation test suite completed! 🎉"