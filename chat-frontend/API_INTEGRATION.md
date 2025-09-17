# 🔗 API Integration Guide

Comprehensive documentation for API integration patterns and practices in the Smart Chat Frontend.

## 📋 Table of Contents

- [🏗️ API Architecture](#️-api-architecture)
- [🔧 HTTP Client Setup](#-http-client-setup)
- [📡 API Service Layer](#-api-service-layer)
- [🔄 Request/Response Flow](#-requestresponse-flow)
- [🛡️ Error Handling](#️-error-handling)
- [🔐 Authentication & Headers](#-authentication--headers)
- [📊 TypeScript Types](#-typescript-types)
- [🧪 Testing API Calls](#-testing-api-calls)
- [🚀 Performance Optimization](#-performance-optimization)

## 🏗️ API Architecture

```
Frontend Application
├── React Components
├── Context/State Management
├── API Service Layer (chatAPI.ts)
├── HTTP Client (Axios)
└── Backend API (Port 3002)
    ├── Authentication Middleware
    ├── Rate Limiting
    ├── Request Validation
    └── Business Logic
```

### API Endpoint Structure

```
Base URL: http://localhost:3002/chats-service/api/v1

Endpoints:
├── /chats                    # Session management
├── /chats/:id                # Individual session operations
├── /chats/:id/messages       # Message operations
├── /chats/:id/smart-chat     # AI-powered responses
└── /health                   # Service health check
```

## 🔧 HTTP Client Setup

### Axios Configuration

```typescript
// services/httpClient.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { config } from '../config';

class HTTPClient {
  private client: AxiosInstance;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add required headers
        config.headers['Unique-Reference-Code'] = this.generateURC();
        config.headers['x-user-id'] = this.getUserId();
        
        // Add timestamp for request tracking
        config.metadata = { startTime: Date.now() };
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration = Date.now() - response.config.metadata?.startTime;
        console.log(`✅ API Response: ${response.status} in ${duration}ms`);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const { config, response } = error;
    
    // Retry logic for specific errors
    if (this.shouldRetry(error) && config && !config._retry) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= this.retryCount) {
        await this.delay(this.retryDelay * config._retryCount);
        return this.client.request(config);
      }
    }

    // Transform error for consistent handling
    throw this.transformError(error);
  }

  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }

  private transformError(error: AxiosError): APIError {
    if (error.response) {
      return new APIError(
        error.response.data?.message || 'API request failed',
        error.response.status,
        error.response.data
      );
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return new APIError('Network connection failed', 0);
    }
    
    if (error.code === 'TIMEOUT') {
      return new APIError('Request timeout', 408);
    }
    
    return new APIError('Unknown error occurred', 500);
  }

  private generateURC(): string {
    return `urc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    return localStorage.getItem('userId') || 'anonymous-user';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for making requests
  public async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const httpClient = new HTTPClient();
```

### Custom Error Class

```typescript
// types/errors.ts
export class APIError extends Error {
  public readonly status: number;
  public readonly data?: any;
  public readonly timestamp: Date;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
    this.timestamp = new Date();
  }

  public isNetworkError(): boolean {
    return this.status === 0;
  }

  public isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  public isServerError(): boolean {
    return this.status >= 500;
  }

  public isRetryable(): boolean {
    return this.isServerError() || this.isNetworkError();
  }
}
```

## 📡 API Service Layer

### Chat API Service

```typescript
// services/chatAPI.ts
import { httpClient } from './httpClient';
import { 
  ChatSession, 
  ChatMessage, 
  CreateSessionRequest,
  SendMessageRequest,
  SmartChatRequest,
  PaginatedResponse 
} from '../types/api';

export class ChatAPI {
  private readonly basePath = '/chats';

  // Session Management
  async getSessions(): Promise<ChatSession[]> {
    const response = await httpClient.get<ApiResponse<ChatSession[]>>(this.basePath);
    return response.data;
  }

  async createSession(request: CreateSessionRequest): Promise<ChatSession> {
    const response = await httpClient.post<ApiResponse<ChatSession>>(
      this.basePath, 
      request
    );
    return response.data;
  }

  async getSessionById(sessionId: string): Promise<ChatSession> {
    const response = await httpClient.get<ApiResponse<ChatSession>>(
      `${this.basePath}/${sessionId}`
    );
    return response.data;
  }

  async renameSession(sessionId: string, title: string): Promise<ChatSession> {
    const response = await httpClient.patch<ApiResponse<ChatSession>>(
      `${this.basePath}/${sessionId}`,
      { title }
    );
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await httpClient.delete(`${this.basePath}/${sessionId}`);
  }

  async toggleFavorite(sessionId: string): Promise<ChatSession> {
    const response = await httpClient.patch<ApiResponse<ChatSession>>(
      `${this.basePath}/${sessionId}/favorite`
    );
    return response.data;
  }

  // Message Management
  async getMessages(
    sessionId: string, 
    options?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ChatMessage>> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());

    const queryString = params.toString();
    const url = `${this.basePath}/${sessionId}/messages${queryString ? `?${queryString}` : ''}`;
    
    return httpClient.get<PaginatedResponse<ChatMessage>>(url);
  }

  async sendMessage(
    sessionId: string, 
    request: SendMessageRequest
  ): Promise<ChatMessage> {
    const response = await httpClient.post<ApiResponse<ChatMessage>>(
      `${this.basePath}/${sessionId}/messages`,
      request
    );
    return response.data;
  }

  async smartChat(
    sessionId: string, 
    request: SmartChatRequest
  ): Promise<ChatMessage> {
    const response = await httpClient.post<ApiResponse<ChatMessage>>(
      `${this.basePath}/${sessionId}/smart-chat`,
      request
    );
    return response.data;
  }

  // Utility Methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return httpClient.get('/health');
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      if (error instanceof APIError && error.status === 401) {
        return false;
      }
      throw error;
    }
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI();
```

### Hook-based API Integration

```typescript
// hooks/useAPI.ts
import { useState, useCallback } from 'react';
import { APIError } from '../types/errors';

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

interface UseAPIReturn<T, P extends any[]> extends UseAPIState<T> {
  execute: (...params: P) => Promise<T>;
  reset: () => void;
}

export function useAPI<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>
): UseAPIReturn<T, P> {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...params: P): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiFunction(...params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error instanceof APIError ? error : new APIError('Unknown error', 500);
      setState(prev => ({ ...prev, loading: false, error: apiError }));
      throw apiError;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// Usage example
const useCreateSession = () => {
  return useAPI(chatAPI.createSession.bind(chatAPI));
};
```

## 🔄 Request/Response Flow

### Typical API Call Flow

```typescript
// 1. Component initiates API call
const handleCreateSession = async (title: string) => {
  try {
    setLoading(true);
    
    // 2. Call API service method
    const newSession = await chatAPI.createSession({ title });
    
    // 3. Update local state
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    
    // 4. Show success feedback
    showToast('Session created successfully', 'success');
    
  } catch (error) {
    // 5. Handle errors
    if (error instanceof APIError) {
      showToast(error.message, 'error');
    } else {
      showToast('Failed to create session', 'error');
    }
  } finally {
    setLoading(false);
  }
};
```

### Optimistic Updates

```typescript
// Optimistic update pattern
const handleToggleFavorite = async (sessionId: string) => {
  // 1. Optimistically update UI
  setSessions(prev => prev.map(session => 
    session._id === sessionId 
      ? { ...session, isFavorite: !session.isFavorite }
      : session
  ));

  try {
    // 2. Make API call
    const updatedSession = await chatAPI.toggleFavorite(sessionId);
    
    // 3. Confirm update with server data
    setSessions(prev => prev.map(session => 
      session._id === sessionId ? updatedSession : session
    ));
    
  } catch (error) {
    // 4. Revert on error
    setSessions(prev => prev.map(session => 
      session._id === sessionId 
        ? { ...session, isFavorite: !session.isFavorite }
        : session
    ));
    
    showToast('Failed to update favorite status', 'error');
  }
};
```

## 🛡️ Error Handling

### Error Handling Strategy

```typescript
// Global error handler
export const handleApiError = (error: unknown, context?: string): string => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  if (error instanceof APIError) {
    switch (error.status) {
      case 401:
        // Handle authentication errors
        redirectToLogin();
        return 'Please log in again';
      
      case 403:
        return 'You do not have permission to perform this action';
      
      case 404:
        return 'The requested resource was not found';
      
      case 409:
        return 'This action conflicts with the current state';
      
      case 429:
        return 'Too many requests. Please wait a moment and try again';
      
      case 500:
      case 502:
      case 503:
        return 'Server error. Please try again later';
      
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

// Component error boundary for API errors
const APIErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <p className="text-red-600 mt-1">{handleApiError(error)}</p>
          <button 
            onClick={resetError}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Try again
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Error Recovery Patterns

```typescript
// Retry mechanism with exponential backoff
const useRetryableAPI = <T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>,
  maxRetries = 3
) => {
  const [retryCount, setRetryCount] = useState(0);
  
  const executeWithRetry = useCallback(async (...params: P): Promise<T> => {
    try {
      const result = await apiFunction(...params);
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      if (error instanceof APIError && error.isRetryable() && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(...params);
      }
      throw error;
    }
  }, [apiFunction, maxRetries, retryCount]);
  
  return { executeWithRetry, retryCount };
};
```

## 🔐 Authentication & Headers

### Required Headers

```typescript
// Header configuration
const REQUIRED_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': config.apiKey,
  'Unique-Reference-Code': '', // Generated per request
  'x-user-id': '', // User identifier
} as const;

// Header validation
const validateHeaders = (headers: Record<string, string>): boolean => {
  const requiredKeys = ['x-api-key', 'Unique-Reference-Code', 'x-user-id'];
  return requiredKeys.every(key => headers[key] && headers[key].trim() !== '');
};

// Header generation utilities
export const generateUniqueReferenceCode = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `urc-${timestamp}-${random}`;
};

export const getUserId = (): string => {
  // Try to get from localStorage, session, or generate
  return localStorage.getItem('userId') || 
         sessionStorage.getItem('userId') || 
         generateAnonymousUserId();
};

const generateAnonymousUserId = (): string => {
  const userId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('userId', userId);
  return userId;
};
```

### API Key Management

```typescript
// API key validation and rotation
class APIKeyManager {
  private apiKey: string;
  private isValid: boolean = true;
  private lastValidation: Date | null = null;
  private validationInterval = 5 * 60 * 1000; // 5 minutes

  constructor(initialKey: string) {
    this.apiKey = initialKey;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async validateApiKey(): Promise<boolean> {
    const now = new Date();
    
    // Skip validation if recently checked
    if (this.lastValidation && 
        (now.getTime() - this.lastValidation.getTime()) < this.validationInterval) {
      return this.isValid;
    }

    try {
      await chatAPI.healthCheck();
      this.isValid = true;
      this.lastValidation = now;
      return true;
    } catch (error) {
      if (error instanceof APIError && error.status === 401) {
        this.isValid = false;
        this.handleInvalidApiKey();
        return false;
      }
      // Other errors don't invalidate the API key
      return this.isValid;
    }
  }

  private handleInvalidApiKey(): void {
    console.error('Invalid API key detected');
    // Could trigger key refresh, user notification, etc.
    window.dispatchEvent(new CustomEvent('apiKeyInvalid'));
  }
}

export const apiKeyManager = new APIKeyManager(config.apiKey);
```

## 📊 TypeScript Types

### API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ChatSession {
  _id: string;
  title: string;
  isFavorite: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  context?: Record<string, any>;
  createdAt: string;
}

// Request types
export interface CreateSessionRequest {
  title: string;
}

export interface SendMessageRequest {
  content: string;
  sender: 'user' | 'assistant' | 'system';
  context?: Record<string, any>;
}

export interface SmartChatRequest {
  message: string;
  context?: string;
}

// Utility types
export type APIEndpoint = 
  | '/chats'
  | '/chats/:id'
  | '/chats/:id/messages'
  | '/chats/:id/smart-chat'
  | '/health';

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  endpoint: APIEndpoint;
  method: HTTPMethod;
  params?: Record<string, string>;
  data?: any;
  headers?: Record<string, string>;
}
```

### Type Guards

```typescript
// Type guards for runtime type checking
export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj === 'object' && 'data' in obj;
};

export const isPaginatedResponse = <T>(obj: any): obj is PaginatedResponse<T> => {
  return obj && 
         typeof obj === 'object' && 
         'data' in obj && 
         Array.isArray(obj.data) &&
         'pagination' in obj;
};

export const isChatSession = (obj: any): obj is ChatSession => {
  return obj &&
         typeof obj === 'object' &&
         typeof obj._id === 'string' &&
         typeof obj.title === 'string' &&
         typeof obj.isFavorite === 'boolean';
};

export const isChatMessage = (obj: any): obj is ChatMessage => {
  return obj &&
         typeof obj === 'object' &&
         typeof obj._id === 'string' &&
         typeof obj.sessionId === 'string' &&
         typeof obj.content === 'string' &&
         ['user', 'assistant', 'system'].includes(obj.sender);
};
```

## 🧪 Testing API Calls

### Mock Setup

```typescript
// __mocks__/chatAPI.ts
export const mockChatAPI = {
  getSessions: jest.fn(),
  createSession: jest.fn(),
  getSessionById: jest.fn(),
  renameSession: jest.fn(),
  deleteSession: jest.fn(),
  toggleFavorite: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  smartChat: jest.fn(),
  healthCheck: jest.fn(),
};

// Test data
export const mockSession: ChatSession = {
  _id: 'test-session-1',
  title: 'Test Session',
  isFavorite: false,
  lastMessageAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockMessage: ChatMessage = {
  _id: 'test-message-1',
  sessionId: 'test-session-1',
  sender: 'user',
  content: 'Hello, world!',
  createdAt: '2024-01-01T00:00:00.000Z',
};
```

### API Tests

```typescript
// chatAPI.test.ts
describe('ChatAPI', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getSessions', () => {
    it('should fetch sessions successfully', async () => {
      const mockResponse = {
        data: [mockSession],
        message: 'Sessions retrieved successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const sessions = await chatAPI.getSessions();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chats'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'x-api-key': expect.any(String),
            'Unique-Reference-Code': expect.any(String),
          }),
        })
      );

      expect(sessions).toEqual([mockSession]);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(chatAPI.getSessions()).rejects.toThrow('Network error');
    });
  });

  describe('createSession', () => {
    it('should create session with valid data', async () => {
      const newSession = { ...mockSession, title: 'New Session' };
      const mockResponse = {
        data: newSession,
        message: 'Session created successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatAPI.createSession({ title: 'New Session' });

      expect(result).toEqual(newSession);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chats'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Session' }),
        })
      );
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/apiIntegration.test.ts
describe('API Integration', () => {
  const testServer = setupTestServer();

  beforeAll(() => testServer.listen());
  afterEach(() => testServer.resetHandlers());
  afterAll(() => testServer.close());

  it('should handle complete session workflow', async () => {
    // 1. Create session
    const session = await chatAPI.createSession({ title: 'Integration Test' });
    expect(session.title).toBe('Integration Test');

    // 2. Send message
    const message = await chatAPI.sendMessage(session._id, {
      content: 'Test message',
      sender: 'user',
    });
    expect(message.content).toBe('Test message');

    // 3. Get messages
    const messages = await chatAPI.getMessages(session._id);
    expect(messages.data).toHaveLength(1);
    expect(messages.data[0]._id).toBe(message._id);

    // 4. Rename session
    const renamedSession = await chatAPI.renameSession(session._id, 'Renamed Session');
    expect(renamedSession.title).toBe('Renamed Session');

    // 5. Delete session
    await expect(chatAPI.deleteSession(session._id)).resolves.not.toThrow();
  });
});
```

## 🚀 Performance Optimization

### Request Optimization

```typescript
// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  public async deduplicate<T>(
    key: string, 
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

const requestDeduplicator = new RequestDeduplicator();

// Usage in API calls
export const getDedupedSessions = () => {
  return requestDeduplicator.deduplicate('sessions', () => chatAPI.getSessions());
};
```

### Caching Strategy

```typescript
// Simple cache implementation
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  public set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  public invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new APICache();

// Cached API wrapper
export const getCachedSessions = async (): Promise<ChatSession[]> => {
  const cacheKey = 'sessions';
  const cached = apiCache.get<ChatSession[]>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const sessions = await chatAPI.getSessions();
  apiCache.set(cacheKey, sessions);
  return sessions;
};
```

### Batch Operations

```typescript
// Batch API calls for efficiency
class BatchProcessor {
  private queue: Array<{ id: string; operation: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private processing = false;
  private batchSize = 5;
  private batchDelay = 100;

  public async add<T>(id: string, operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, operation, resolve, reject });
      this.processBatch();
    });
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      try {
        const results = await Promise.allSettled(
          batch.map(item => item.operation())
        );

        batch.forEach((item, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') {
            item.resolve(result.value);
          } else {
            item.reject(result.reason);
          }
        });
      } catch (error) {
        batch.forEach(item => item.reject(error));
      }

      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }

    this.processing = false;
  }
}

const batchProcessor = new BatchProcessor();
```

---

**This guide provides comprehensive patterns for integrating with the Chat Service API. Use these patterns to ensure consistent, reliable, and performant API interactions throughout the frontend application.**
