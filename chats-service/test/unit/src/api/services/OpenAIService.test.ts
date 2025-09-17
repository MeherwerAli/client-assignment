import 'reflect-metadata';
import { CODES, HTTPCODES } from '../../../../../src/api/errors/errorCodeConstants';
import { IRequestHeaders } from '../../../../../src/api/Interface/IRequestHeaders';
import { ChatMessage, OpenAIService } from '../../../../../src/api/services/OpenAIService';

// Logger is mocked globally in test/setup.ts

// Mock the helpers
jest.mock('../../../../../src/lib/env/helpers', () => ({
  constructLogMessage: jest.fn((filename, method, headers) => `${filename}:${method}:${headers?.urc || 'unknown'}`),
  isEmptyOrNull: jest.fn(value => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'number' && isNaN(value)) return true;
    return !value;
  })
}));

// Mock OpenAI
const mockCreate = jest.fn();

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: class {
      chat = {
        completions: {
          create: mockCreate
        }
      };
    }
  };
});

// Mock env
jest.mock('../../../../../src/env', () => ({
  env: {
    openai: {
      apiKey: 'test-api-key',
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7
    },
    errors: {
      errorPrefix: 'TEST_',
      default: {
        errorCode: 'GENERIC_ERROR',
        errorMessage: 'Generic error message',
        errorDescription: 'Generic error description'
      }
    }
  }
}));

// Mock constructLogMessage and Logger
jest.mock('../../../../../src/lib/env/helpers', () => ({
  constructLogMessage: jest.fn().mockReturnValue('mocked log message')
}));

jest.mock('../../../../../src/lib/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

describe('OpenAIService', () => {
  let openAIService: OpenAIService;
  let mockHeaders: IRequestHeaders;

  beforeEach(() => {
    jest.clearAllMocks();
    openAIService = new OpenAIService();
    mockHeaders = { urc: 'test-urc-123' };
  });

  describe('constructor', () => {
    it('should initialize successfully with valid API key', () => {
      expect(openAIService).toBeDefined();
    });

    it('should throw error when API key is missing', () => {
      // Temporarily backup the original env
      const originalEnv = require('../../../../../src/env').env;

      // Mock env without API key
      require('../../../../../src/env').env = {
        ...originalEnv,
        openai: {
          ...originalEnv.openai,
          apiKey: undefined
        }
      };

      // Now try to create a new service
      expect(() => {
        const { OpenAIService } = require('../../../../../src/api/services/OpenAIService');
        new OpenAIService();
      }).toThrow('OPENAI_API_KEY environment variable is required');

      // Restore original env
      require('../../../../../src/env').env = originalEnv;
    });
  });

  describe('generateChatCompletion', () => {
    it('should generate chat completion successfully', async () => {
      const mockMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const mockCompletion = {
        choices: [
          {
            message: { content: 'Hello! How can I help you today?' },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25
        }
      };

      mockCreate.mockResolvedValue(mockCompletion);

      const result = await openAIService.generateChatCompletion(mockMessages, mockHeaders);

      expect(result).toEqual({
        content: 'Hello! How can I help you today?',
        finishReason: 'stop',
        tokensUsed: {
          prompt: 10,
          completion: 15,
          total: 25
        }
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: mockMessages,
        max_tokens: 1000,
        temperature: 0.7
      });
    });

    it('should throw CredError when OpenAI returns no content', async () => {
      const mockMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const mockCompletion = {
        choices: [
          {
            message: { content: null },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 0,
          total_tokens: 10
        }
      };

      mockCreate.mockResolvedValue(mockCompletion);

      await expect(openAIService.generateChatCompletion(mockMessages, mockHeaders)).rejects.toThrow();
    });

    it('should handle quota exceeded error', async () => {
      const mockMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const quotaError = new Error('Quota exceeded');
      (quotaError as any).type = 'insufficient_quota';
      mockCreate.mockRejectedValue(quotaError);

      const error = await openAIService.generateChatCompletion(mockMessages, mockHeaders).catch(err => err);

      expect(error.code).toBe(CODES.OpenAIQuotaExceeded);
      expect(error.httpCode).toBe(HTTPCODES.PAYMENT_REQUIRED);
    });

    it('should handle invalid request error', async () => {
      const mockMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const invalidError = new Error('Invalid request');
      (invalidError as any).type = 'invalid_request_error';
      mockCreate.mockRejectedValue(invalidError);

      const error = await openAIService.generateChatCompletion(mockMessages, mockHeaders).catch(err => err);

      expect(error.code).toBe(CODES.OpenAIInvalidRequest);
      expect(error.httpCode).toBe(HTTPCODES.BAD_REQUEST);
    });

    it('should handle rate limit error', async () => {
      const mockMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      mockCreate.mockRejectedValue(rateLimitError);

      const error = await openAIService.generateChatCompletion(mockMessages, mockHeaders).catch(err => err);

      expect(error.code).toBe(CODES.OpenAIRateLimit);
      expect(error.httpCode).toBe(HTTPCODES.TOO_MANY_REQUESTS);
    });

    it('should handle generic OpenAI error', async () => {
      const mockMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const genericError = new Error('Something went wrong');
      mockCreate.mockRejectedValue(genericError);

      const error = await openAIService.generateChatCompletion(mockMessages, mockHeaders).catch(err => err);

      expect(error.code).toBe(CODES.OpenAIError);
      expect(error.httpCode).toBe(HTTPCODES.INTERNAL_SERVER_ERROR);
    });
  });

  describe('buildConversationContext', () => {
    it('should build conversation context with system message', () => {
      const conversationHistory = [
        { sender: 'user', content: 'Hello', createdAt: new Date() },
        { sender: 'assistant', content: 'Hi there!', createdAt: new Date() },
        { sender: 'user', content: 'How are you?', createdAt: new Date() }
      ];

      const result = openAIService.buildConversationContext(conversationHistory);

      expect(result).toEqual([
        {
          role: 'system',
          content: 'You are a helpful assistant. Provide clear, accurate, and helpful responses to user questions.'
        },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' }
      ]);
    });

    it('should skip system messages from conversation history', () => {
      const conversationHistory = [
        { sender: 'system', content: 'System message', createdAt: new Date() },
        { sender: 'user', content: 'Hello', createdAt: new Date() },
        { sender: 'assistant', content: 'Hi there!', createdAt: new Date() }
      ];

      const result = openAIService.buildConversationContext(conversationHistory);

      expect(result).toEqual([
        {
          role: 'system',
          content: 'You are a helpful assistant. Provide clear, accurate, and helpful responses to user questions.'
        },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ]);
    });

    it('should handle empty conversation history', () => {
      const conversationHistory: any[] = [];

      const result = openAIService.buildConversationContext(conversationHistory);

      expect(result).toEqual([
        {
          role: 'system',
          content: 'You are a helpful assistant. Provide clear, accurate, and helpful responses to user questions.'
        }
      ]);
    });
  });

  describe('validateConfiguration', () => {
    it('should return true for valid configuration', async () => {
      const mockCompletion = {
        choices: [
          {
            message: { content: 'Hi' },
            finish_reason: 'stop'
          }
        ]
      };

      mockCreate.mockResolvedValue(mockCompletion);

      const result = await openAIService.validateConfiguration(mockHeaders);

      expect(result).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });
    });

    it('should return false for invalid configuration', async () => {
      const error = new Error('Invalid API key');
      mockCreate.mockRejectedValue(error);

      const result = await openAIService.validateConfiguration(mockHeaders);

      expect(result).toBe(false);
    });

    it('should return false when no content is returned', async () => {
      const mockCompletion = {
        choices: [
          {
            message: { content: null },
            finish_reason: 'stop'
          }
        ]
      };

      mockCreate.mockResolvedValue(mockCompletion);

      const result = await openAIService.validateConfiguration(mockHeaders);

      expect(result).toBe(false);
    });
  });
});
