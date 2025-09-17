# Microservices Architecture

This repository contains the microservices architecture with the following components:

## 🏗️ Architecture Overview

```
Root Directory/
├── documentation-and-swagger/    # API documentation hub
│   ├── swagger-server.js         # Main documentation server
│   ├── package.json              # Hub dependencies
│   ├── docs/                     # API specifications
│   │   └── chats-service-api.yaml # Chat service OpenAPI spec
│   └── validate-docs.sh          # Documentation validation script
├── chats-service/                # Chat microservice
│   ├── src/                      # Source code
│   ├── test/                     # Tests
│   ├── package.json              # Service dependencies
│   └── README.md                 # Service documentation
└── README.md                     # This file
```

## � Services

### 1. Chat Storage Service (Port 3002) ✅ Available

- **Location**: `/chats-service/`
- **Description**: RAG Chat Storage microservice for managing chat sessions and messages

**Key Features:**

- Create/rename/delete chat sessions
- Mark sessions as favorites
- Add messages with automatic encryption
- Retrieve paginated message history
- API key authentication
- Rate limiting (60 requests/minute)

### 2. User Management Service (Port 3004) 🚧 Coming Soon

- **Location**: `/user-service/` (planned)
- **Description**: Comprehensive user management system

**Planned Features:**

- User registration and profiles
- Account management
- Preference settings
- Data export/import

## 📖 Documentation Hub

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
