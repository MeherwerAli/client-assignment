# Copilot Agent Implementation Guide: Microservices Chat Platform

This is a comprehensive microservices architecture with chat service, frontend, documentation hub, and automation testing. These instructions are authoritative. Do **NOT** hallucinate APIs, files, environment variables, or architectural layers not explicitly described here or already present in the repository.

---

## 1. Project Architecture Overview

```
Root/
├── chats-service/           # Node.js/TypeScript API (Port 3002)
├── chat-frontend/           # React/TypeScript UI 
├── documentation-and-swagger/ # API docs hub (Port 3001)
├── automation/              # Playwright test suite
└── docker-compose.yml       # Multi-container orchestration
```

### Development Workflow Commands
```bash
# Start all services (MongoDB + Chat Service)
docker-compose up -d

# Run comprehensive API tests 
cd automation && npm test

# Start documentation hub with dual testing UI
cd documentation-and-swagger && npm start

# Start frontend dev server
cd chat-frontend && npm run dev
```

---

## 2. Chat Service Architecture (chats-service/)

**Core Pattern**: Loader-based bootstrapping with TypeScript decorators and dependency injection.

- **Bootstrap**: `src/app.ts` via side-effect imports: `iocLoader` → `expressLoader` → `homeLoader` → `winstonLoader` → `DBLoader`
- **HTTP Server**: `routing-controllers#createExpressServer` with `defaultErrorHandler: false` (custom error handling)
- **DI Container**: `typedi` configured in `src/loaders/iocLoader.ts` for `routing-controllers` and `class-validator`
- **Logging**: Winston global config; scoped wrapper `new Logger(__filename)` pattern throughout
- **Environment**: Centralized in `src/env.ts`; path discovery via `getOsPaths`/`getPaths` helpers
- **Error System**: Custom `Error`/`CredError` classes + code mapping (`errorCodes.ts`, `errorCodeConstants.ts`) → `ErrorResponse` via global `ErrorHandleMiddleware`
- **Encryption**: `encryptValue`/`decryptValue` from `src/lib/env/helpers.ts` used in Mongoose pre-save hooks
- **Headers**: `URCHeaderMiddleware` enforces `Unique-Reference-Code` for request tracing

---

## 3. Component-Specific Guidance

### Frontend (chat-frontend/)
- **Tech Stack**: React 18 + TypeScript + Tailwind CSS + Context API
- **Development**: `npm run dev` (auto-reload), connects to chat service on port 3002
- **Key Features**: Session management, real-time messaging, AI chat toggle, favorites system
- **Architecture**: Component-based with centralized state management via React Context

### Documentation Hub (documentation-and-swagger/)
- **Purpose**: Centralized API documentation with dual testing interfaces
- **Ports**: Main hub (3001), Swagger UI (/docs), Custom tester (/api-tester)
- **Key Files**: `swagger-server.js` (main server), `docs/chats-service-api.yaml` (OpenAPI spec)
- **Testing**: Pre-configured with auth headers for immediate API testing

### Automation (automation/)
- **Framework**: Playwright with TypeScript
- **Test Structure**: `tests/*.spec.ts` organized by feature (auth, sessions, messages, etc.)
- **Commands**: `npm test` (headless), `npm run test:headed` (UI), `npm run test:debug`
- **Docker Integration**: `npm run test:docker` (full stack test with containers)

---

## 4. Chat Service Implementation (Current State)

**Chat service is FULLY IMPLEMENTED**. Current capabilities:

- ✅ Create/Rename/Delete chat sessions
- ✅ Mark/Unmark session as favorite  
- ✅ Add messages to session (user/assistant/system) with optional `context` payload
- ✅ Retrieve paginated message history per session
- ✅ API key protection, rate limiting, logging, encryption (message content)
- ✅ User isolation via `x-user-id` header
- ✅ Smart chat integration with OpenAI

**Route Structure**: `/chats-service/api/v1/chats/*` (note the service prefix in route)

**Required Headers**: 
- `x-api-key: dev-api-key-2024` (or production key)
- `Unique-Reference-Code: <any-unique-string>`
- `x-user-id: <user-identifier>` (for user isolation)

---

## 5. Development Standards (MUST FOLLOW)

### Logging Pattern
```typescript
private log = new Logger(__filename);
const logMessage = constructLogMessage(__filename, 'methodName', headers);
this.log.info(logMessage);
```

### Error Handling  
```typescript
throw new CredError(HTTPCODES.BAD_REQUEST, CODES.SomeCode);
// OR
Error.createError(...)
```

### Controller Structure
```typescript
@JsonController('/v1/chats')
@UseBefore(bodyParser.json(), URCHeaderMiddleware, APIKeyMiddleware)
export class ChatsController {
  constructor(private chatService: ChatService) {}
}
```

### Service Injection
```typescript
@Service()
export class ChatService {
  // Service methods here
}
```

**Critical**: Always use `@Service()` decorator and constructor injection. Follow the loader-based bootstrap pattern.

---

## 6. Testing Strategy

### API Testing (automation/)
- **Coverage**: Authentication, rate limiting, error handling, user isolation, smart chat
- **Headers**: Tests validate required headers (`x-api-key`, `Unique-Reference-Code`, `x-user-id`)
- **Validation**: Comprehensive API contract testing with Playwright
- **Run Tests**: `cd automation && npm test` or `npm run test:docker` for full stack

### Unit Testing (chats-service/test/)
- **Location**: `test/unit/src/` mirrors `src/` structure  
- **Pattern**: Follow existing `NotificationsController.test.ts` patterns
- **Mocking**: Use jest spies and DI container mocking

---

## 7. Environment & Configuration

### Required Environment Variables (chats-service/.env)
```bash
API_KEY=dev-api-key-2024
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
CORS_ORIGIN=*
MONGO_URL=mongodb://localhost:27017/chats_db
OPENAI_API_KEY=<your-key>  # For smart chat
```

### Docker Development
```bash
# Start MongoDB + Chat Service
docker-compose up -d

# Check service health
curl http://localhost:3002/chats-service/api/health \
  -H "x-api-key: dev-api-key-2024"
```

---

## 8. Extension Guidelines

### Adding New Features
1. **Routes**: Add to existing controllers or create new ones in `src/api/controllers/`
2. **Services**: Business logic in `src/api/services/` with `@Service()` decorator
3. **Models**: Mongoose schemas in `src/api/models/` with encryption where needed
4. **DTOs**: Request/response validation in `src/api/dto/`
5. **Tests**: Both unit (`test/unit/`) and integration (`automation/tests/`)

### Frontend Integration
- **API Client**: Frontend uses axios with base URL `http://localhost:3002/chats-service/api`
- **Auth Headers**: Frontend manages API key and URC generation
- **State**: React Context API for session and message state management

### Documentation
- **OpenAPI**: Update `documentation-and-swagger/docs/chats-service-api.yaml`
- **Testing UI**: Documentation hub provides interactive API testing at `http://localhost:3001`

---

## 9. Architecture Constraints

**DO NOT:**
- Remove existing middleware chain or change bootstrap order
- Implement authentication beyond API key (external auth service handles users)  
- Add new top-level directories without architectural review
- Modify the route prefix pattern (`/chats-service/api/v1/*`)
- Change the loader-based initialization sequence in `src/app.ts`

**DO:**
- Follow the established DI container patterns
- Use the existing error code mapping system
- Maintain the encryption pattern for sensitive data
- Preserve the Winston logging configuration
- Keep the header-based request tracing (`Unique-Reference-Code`)

---

## 10. Quick Reference

### Start Development
```bash
# Backend
docker-compose up -d
cd chats-service && npm run dev

# Frontend  
cd chat-frontend && npm run dev

# Documentation
cd documentation-and-swagger && npm start

# Run Tests
cd automation && npm test
```

### Key Files
- `chats-service/src/app.ts` - Application bootstrap
- `chats-service/src/api/controllers/ChatsController.ts` - Main API endpoints
- `chat-frontend/src/` - React frontend application
- `automation/tests/` - Playwright API tests
- `docker-compose.yml` - Multi-service orchestration

**Need clarification on architecture decisions?** Reference the comprehensive patterns in existing controllers and services before making assumptions.
