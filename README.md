# Microservices Architecture

This repository contains the microservices architecture with the following components:

## 🏗️ Architecture Overview

```
Root Directory/
├── 🎨 chat-frontend/             # React TypeScript Frontend (Port 3000/3003)
│   ├── src/
│   │   ├── components/           # React components (ChatInterface, SessionList, etc.)
│   │   ├── context/              # State management (ChatContext, UserContext, etc.)
│   │   ├── services/             # API integration layer
│   │   └── types/                # TypeScript type definitions
│   ├── public/                   # Static assets
│   ├── build/                    # Production build output
│   ├── Dockerfile                # Container configuration
│   ├── nginx.conf                # Production web server config
│   └── package.json              # Frontend dependencies
│
├── 🚀 chats-service/             # Node.js TypeScript Backend (Port 3002)
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/      # REST API endpoints (ChatsController)
│   │   │   ├── services/         # Business logic (ChatService, OpenAIService)
│   │   │   ├── models/           # MongoDB schemas with encryption
│   │   │   ├── middlewares/      # Auth, validation, error handling
│   │   │   ├── dto/              # Request/response validation
│   │   │   └── errors/           # Custom error system
│   │   ├── loaders/              # App initialization (DB, Express, IoC)
│   │   └── lib/                  # Utilities (Logger, Environment)
│   ├── test/                     # Unit tests with Jest
│   ├── Dockerfile                # Container configuration
│   └── package.json              # Backend dependencies
│
├── 📚 documentation-and-swagger/ # API Documentation Hub (Port 3001)
│   ├── docs/
│   │   └── chats-service-api.yaml # OpenAPI 3.0 specifications
│   ├── swagger-server.js         # Express server for Swagger UI
│   ├── api-tester.html          # Custom API testing interface
│   ├── Dockerfile                # Container configuration
│   └── package.json              # Documentation dependencies
│
├── 🧪 automation/                # Playwright Test Suite
│   ├── tests/                    # E2E API tests (86.7% coverage)
│   │   ├── authentication.spec.ts
│   │   ├── sessions.spec.ts
│   │   ├── messages.spec.ts
│   │   ├── smart-chat-negative.spec.ts
│   │   ├── user-isolation.spec.ts
│   │   └── setup/                # Test configuration
│   ├── playwright-report/        # HTML test results
│   ├── playwright.config.ts      # Test configuration
│   └── package.json              # Test dependencies
│
├── 🐳 Docker Infrastructure
│   ├── docker-compose.yml        # Multi-service orchestration
│   ├── docker-compose-local-mongo.yml # Local MongoDB setup
│   └── .dockerignore             # Container build exclusions
│
├── 🔧 DevOps & Scripts
│   ├── .github/                  # GitHub Actions & Copilot instructions
│   ├── quick-docker-test.sh      # Rapid testing script
│   ├── run-automation-tests.sh   # Test execution script
│   └── package.json              # Root project configuration
│
└── 📖 Documentation
    ├── README.md                 # This comprehensive guide
    ├── .gitignore                # Git exclusions
    └── Various service READMEs   # Service-specific documentation
```

### 🌐 Service Architecture

**Frontend Layer** (React + TypeScript)
- Modern React 19 with functional components and hooks
- Tailwind CSS for responsive styling
- Context API for state management
- Real-time chat interface with AI integration

**Backend Layer** (Node.js + TypeScript)
- RESTful API with routing-controllers
- MongoDB with Mongoose ODM
- Dependency injection with TypeDI
- Custom error handling and logging system

**AI Integration Layer**
- OpenAI GPT integration for smart responses
- Conversation context management
- Custom API key support per request
- Fallback-free real AI responses

**Infrastructure Layer**
- Docker containers for all services
- MongoDB database with authentication
- Nginx for frontend serving
- Health checks and monitoring

## 🎯 Services

### 1. 🎨 Chat Frontend (Port 3000/3003) ✅ Production Ready

- **Location**: `/chat-frontend/`
- **Description**: Modern React TypeScript frontend with real-time chat interface

**Key Features:**

- **User Management**: Multi-user support with isolated sessions
- **Chat Interface**: Real-time messaging with smart AI responses  
- **Session Management**: Create, rename, delete, and favorite chat sessions
- **API Key Management**: Dual key management (Service Auth + OpenAI)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Error Handling**: Comprehensive error messages and user feedback
- **State Management**: React Context API for global state

**Technology Stack:**
- React 19 + TypeScript
- Tailwind CSS for styling
- Context API for state management
- Axios for API communication
- Docker containerization with Nginx

### 2. 🚀 Chat Service (Port 3002) ✅ Production Ready

- **Location**: `/chats-service/`
- **Description**: Robust Node.js TypeScript backend with AI integration

**Key Features:**

- **Session Management**: Create, rename, delete chat sessions with user isolation
- **Message Handling**: Add/retrieve messages with automatic encryption
- **AI Integration**: Real OpenAI GPT responses with conversation context
- **Authentication**: API key protection with clear error messages
- **Rate Limiting**: 60 requests/minute with proper throttling
- **User Isolation**: Complete data separation between users
- **Encryption**: Sensitive data encryption at rest
- **Comprehensive Logging**: Winston-based logging with request tracing

**Technology Stack:**
- Node.js + TypeScript
- Express with routing-controllers
- MongoDB with Mongoose ODM
- TypeDI for dependency injection
- OpenAI API integration
- Docker containerization

### 3. � Documentation Hub (Port 3001) ✅ Available

- **Location**: `/documentation-and-swagger/`
- **Description**: Centralized API documentation with dual testing interfaces

**Key Features:**

- **Swagger UI**: Interactive API documentation
- **Custom API Tester**: Simplified testing interface
- **Service Health Monitoring**: Real-time service status
- **Pre-configured Authentication**: Ready-to-use API testing
- **Responsive Design**: Works on all devices

### 4. 🧪 Automation Testing Suite ✅ Comprehensive Coverage

- **Location**: `/automation/`
- **Description**: Playwright-based end-to-end testing suite

**Test Coverage (86.7% Success Rate):**

- **Authentication Tests**: API key validation and user isolation
- **Session Management**: CRUD operations and favorites
- **Message Handling**: Creation, retrieval, and pagination
- **Smart Chat**: AI integration and error scenarios
- **Rate Limiting**: Throttling and protection mechanisms
- **Error Handling**: Comprehensive error response validation
- **User Isolation**: Multi-user data separation

**Technology Stack:**
- Playwright for E2E testing
- TypeScript test specifications
- HTML reporting with detailed results
- CI/CD ready test automation

## � Docker Deployment

### Quick Start (All Services)

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Service Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Frontend** | 3003 | http://localhost:3003 | ✅ Ready |
| **Backend API** | 3002 | http://localhost:3002/chats-service/api | ✅ Ready |
| **Documentation** | 3001 | http://localhost:3001 | ✅ Ready |
| **MongoDB** | 27017 | mongodb://localhost:27017 | ✅ Ready |

### Environment Configuration

Each service includes comprehensive environment configuration:

- **Frontend**: React app settings, API URLs, feature flags
- **Backend**: Database URLs, API keys, security settings
- **Documentation**: Port configuration and service discovery
- **Database**: Authentication, storage, and replication settings

### Health Monitoring

All services include health checks:

```bash
# Check all service health
curl http://localhost:3001/health        # Documentation Hub
curl http://localhost:3002/chats-service/api/v1/chats \
  -H "x-api-key: dev-api-key-2024" \
  -H "x-user-id: health-check" \
  -H "Unique-Reference-Code: health-123"  # Chat Service
curl http://localhost:3003               # Frontend
```

## �📖 Documentation Hub

A centralized documentation hub with **dual testing interfaces** for all microservices.

### Quick Start

```bash
# Navigate to documentation directory
cd documentation-and-swagger

# Install dependencies for documentation hub
npm install

# Start the documentation server
npm start

# Or run in development mode with auto-reload
npm run dev
```

The documentation hub will be available at:

- **🏠 Main Hub**: http://localhost:3001/
- **📚 Swagger UI**: http://localhost:3001/docs
- **🧪 Custom API Tester**: http://localhost:3001/api-tester
- **🔍 Health Check**: http://localhost:3001/health

### 🔑 API Authentication

All APIs require authentication using the `x-api-key` header:

**Example for testing:** `test-api-key-12345`

**Required Headers:**

- `x-api-key: test-api-key-12345`
- `Unique-Reference-Code: REQ-123456789` (any unique string)

### Testing Options

**Option 1: Swagger UI** - Standard OpenAPI documentation interface

- Access: http://localhost:3001/docs
- Click "Authorize" and enter: `test-api-key-12345`

**Option 2: Custom API Tester** - Simplified interface with guaranteed response display

- Access: http://localhost:3001/api-tester
- Pre-configured with authentication headers
- Interactive workflow with auto-filled session IDs

### Environment Variables

The documentation hub supports the following environment variables:

- `SWAGGER_PORT`: Port for the documentation server (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

## 🛠️ Development

### Running Services

#### Chat Service

```bash
cd chats-service
npm install
npm start    # Starts on port 3002
```

#### Documentation Hub

```bash
cd documentation-and-swagger
npm install
npm start    # Starts on port 3001
```

### Adding New Services

To add documentation for a new service:

1. Create an OpenAPI specification file in `documentation-and-swagger/docs/[service-name]-api.yaml`
2. Update `documentation-and-swagger/swagger-server.js` to load the new specification
3. Add the service to the hub landing page
4. Update the service navigation URLs

### Testing the Documentation

#### Using Swagger UI

1. Navigate to the service documentation page
2. Click "Try it out" on any endpoint
3. Fill in required parameters and headers
4. Click "Execute" to test the API

#### Required Headers (Chat Service)

All chat service endpoints require:

- `x-api-key`: API key for authentication
- `Unique-Reference-Code`: Request tracing header

#### Authentication

The chat service uses API key authentication. Set the API key in the Swagger UI:

1. Click the "Authorize" button
2. Enter your API key
3. Click "Authorize"

## 🧪 Testing

### Documentation Validation

```bash
cd documentation-and-swagger
./validate-docs.sh
```

### Service Tests

```bash
cd chats-service
npm test
```

## 📊 Features

### Interactive Documentation

- **Try It Out**: Test endpoints directly from the documentation
- **Request/Response Examples**: Complete examples for all operations
- **Schema Validation**: Automatic validation of request/response data
- **Error Handling**: Comprehensive error code documentation

### Service Navigation

- **Hub Dashboard**: Overview of all services with status
- **Direct Links**: Quick access to individual service documentation
- **Health Monitoring**: Real-time service health checks

### Developer Experience

- **Auto-reload**: Development mode with automatic reloading
- **Pretty URLs**: Clean, readable documentation URLs
- **Responsive Design**: Works on desktop and mobile devices
- **Custom Styling**: Enhanced UI with service-specific branding

## 🔍 Troubleshooting

### Common Issues

**Documentation not loading:**

- Check that the YAML file is valid OpenAPI 3.0 format
- Verify file paths in `swagger-server.js`
- Check console for error messages

**API testing fails:**

- Ensure the service is running on the correct port
- Verify API key is set correctly
- Check CORS configuration for cross-origin requests

**Port conflicts:**

- Change `SWAGGER_PORT` environment variable
- Ensure no other services are using port 3001

### Health Checks

Monitor service health:

```bash
# Documentation hub health
curl http://localhost:3001/health

# Chat service health
curl http://localhost:3002/chats-service/api/v1/chats/health
```

## 📞 Support

For technical support or questions about the APIs:

- Review the service-specific documentation
- Check the troubleshooting section
- Contact the development team

## 🚀 Future Enhancements

- [ ] API versioning support
- [ ] Real-time API status monitoring
- [ ] Custom documentation themes
- [ ] API usage analytics
- [ ] Automated testing integration
- [ ] Performance metrics dashboard

---

_Last updated: September 15, 2025_

### Adding New Services

To add documentation for a new service:

1. Create an OpenAPI specification file in `docs/[service-name]-api.yaml`
2. Update `swagger-server.js` to load the new specification
3. Add the service to the hub landing page
4. Update the service navigation URLs

Example:

```javascript
// In swagger-server.js
const newServiceSpec = loadSwaggerSpec(path.join(__dirname, 'docs', 'new-service-api.yaml'));

// Add to swaggerOptions.urls
{
  url: '/api-docs/new-service.json',
  name: 'New Service'
}
```

## 🧪 Testing the Documentation

### Using Swagger UI

1. Navigate to the service documentation page
2. Click "Try it out" on any endpoint
3. Fill in required parameters and headers
4. Click "Execute" to test the API

### Required Headers

All chat service endpoints require:

- `x-api-key`: API key for authentication
- `Unique-Reference-Code`: Request tracing header

### Authentication

The chat service uses API key authentication. Set the API key in the Swagger UI:

1. Click the "Authorize" button
2. Enter your API key
3. Click "Authorize"

## 📊 Features

### Interactive Documentation

- **Try It Out**: Test endpoints directly from the documentation
- **Request/Response Examples**: Complete examples for all operations
- **Schema Validation**: Automatic validation of request/response data
- **Error Handling**: Comprehensive error code documentation

### Service Navigation

- **Hub Dashboard**: Overview of all services with status
- **Direct Links**: Quick access to individual service documentation
- **Health Monitoring**: Real-time service health checks

### Developer Experience

- **Auto-reload**: Development mode with automatic reloading
- **Pretty URLs**: Clean, readable documentation URLs
- **Responsive Design**: Works on desktop and mobile devices
- **Custom Styling**: Enhanced UI with service-specific branding

## 🛠️ Development

### Project Structure

```
docs/
├── chats-service-api.yaml     # Chat service OpenAPI specification
└── [future-service-apis]      # Additional service specifications

swagger-server.js              # Express server for Swagger UI
package.json                   # Documentation hub dependencies
README.md                      # This file
```

### Adding Endpoints

To document new endpoints in existing services:

1. Update the relevant YAML file in `docs/`
2. Follow OpenAPI 3.0 specification format
3. Include complete examples and error responses
4. Test the documentation in Swagger UI

### Custom Styling

The documentation hub includes custom CSS for:

- Service navigation headers
- Enhanced color schemes
- Mobile-responsive design
- Improved readability

## 🔍 Troubleshooting

### Common Issues

**Documentation not loading:**

- Check that the YAML file is valid OpenAPI 3.0 format
- Verify file paths in `swagger-server.js`
- Check console for error messages

**API testing fails:**

- Ensure the service is running on the correct port
- Verify API key is set correctly
- Check CORS configuration for cross-origin requests

**Port conflicts:**

- Change `SWAGGER_PORT` environment variable
- Ensure no other services are using port 3001

### Health Checks

Monitor service health at `/health`:

```bash
curl http://localhost:3001/health
```

## 📞 Support

For technical support or questions about the API documentation:

- Review the service-specific documentation
- Check the troubleshooting section
- Contact the development team

## 🚀 Future Enhancements

- [ ] API versioning support
- [ ] Authentication integration with auth service
- [ ] Real-time API status monitoring
- [ ] Custom documentation themes
- [ ] API usage analytics
- [ ] Automated testing integration
- [ ] Performance metrics dashboard

---

_Last updated: September 15, 2025_
