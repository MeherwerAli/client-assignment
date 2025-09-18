import { ChatService } from '../../../../../src/api/services/ChatService';
import { OpenAIService, OpenAIResponse } from '../../../../../src/api/services/OpenAIService';
import { IRequestHeaders } from '../../../../../src/api/Interface/IRequestHeaders';
import { Repository } from 'typeorm';
import { ChatSession } from '../../../../../src/api/entities/ChatSession';
import { ChatMessage } from '../../../../../src/api/entities/ChatMessage';

// Mock Logger with the exact approach that works for Controller tests
jest.mock('../../../../../src/lib/logger');

// Mock the helpers module to use our manual mock
jest.mock('../../../../../src/lib/env/helpers', () => ({
  constructLogMessage: jest.fn().mockReturnValue('mocked log message'),
  encryptValue: jest.fn().mockImplementation((value) => Promise.resolve(`encrypted_${value}`)),
  decryptValue: jest.fn().mockImplementation((value) => Promise.resolve(value.replace('encrypted_', '')))
}));

// Mock TypeORM
jest.mock('../../../../../src/database/data-source');

// Mock OpenAIService
jest.mock('../../../../../src/api/services/OpenAIService', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    generateChatCompletion: jest.fn(),
    buildConversationContext: jest.fn(),
    validateConfiguration: jest.fn()
  }))
}));

// Mock env with proper structure
jest.mock('../../../../../src/env', () => ({
  env: {
    node: 'test',
    isProduction: false,
    isTest: true,
    isDevelopment: false,
    app: {
      name: 'test-chat-service',
      version: '1.0.0',
      description: 'Test Chat Service',
      host: 'localhost',
      schema: 'http',
      routePrefix: '/chats-service/api',
      port: 3002,
      banner: true,
      apiKey: 'test-api-key',
      rateWindowMs: 60000,
      rateMax: 60,
      corsOrigin: '*',
      dirs: {
        controllers: ['src/api/controllers/**/*Controller.ts'],
        middlewares: ['src/api/middlewares/*Middleware.ts'],
        interceptors: ['src/api/interceptors/**/*Interceptor.ts'],
        resolvers: ['src/api/resolvers/**/*Resolver.ts']
      }
    },
    constants: {
      aesIVBase64: 'AAAAAAAAAAAAAAAAAAAAAA==',
      encryption: {
        algorithm: 'aes-256-cbc',
        key: 'MzVjNWM0NmIxZTQ5YjA2MzZmM2JhODQ0NjI4ZDYwODQ=',
        iv: 'Nzg5MjM0NzM4NzRmOWIwZA=='
      }
    },
    log: {
      level: 'info',
      json: false,
      output: 'stdout'
    },
    db: {
      mongoURL: 'mongodb://127.0.0.1:27017/ChatDB',
      host: 'localhost',
      port: 5432,
      username: 'chatuser',
      password: 'chatpass',
      database: 'chats_db_test',
      schema: 'public'
    },
    monitor: {
      enabled: false,
      route: '/status',
      username: 'admin',
      password: 'admin'
    },
    openai: {
      apiKey: 'test-openai-key',
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
      baseURL: 'https://api.openai.com/v1'
    },
    errors: {
      errorPrefix: 'CHATS_SERVICE',
      default: {
        errorCode: 'GLOBAL.UNMAPPED-ERROR',
        errorMessage: 'Something went wrong, please try after sometime',
        errorDescription: 'Error is not mapped in the service, please check log for further info'
      }
    }
  }
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let mockHeaders: IRequestHeaders;
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  let mockSessionRepository: jest.Mocked<Repository<ChatSession>>;
  let mockMessageRepository: jest.Mocked<Repository<ChatMessage>>;
  let testUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repositories
    mockSessionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn()
    } as any;

    mockMessageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn()
    } as any;

    // Mock AppDataSource.getRepository
    const { AppDataSource } = require('../../../../../src/database/data-source');
    AppDataSource.getRepository = jest.fn((entity) => {
      if (entity === ChatSession) return mockSessionRepository;
      if (entity === ChatMessage) return mockMessageRepository;
      return {};
    });

    // Create a mock OpenAIService instance
    mockOpenAIService = {
      generateChatCompletion: jest.fn(),
      buildConversationContext: jest.fn(),
      validateConfiguration: jest.fn()
    } as any;

    chatService = new ChatService(mockOpenAIService);
    mockHeaders = { urc: 'test-urc-123' };
    testUserId = 'test-user-123';
  });

  describe('createSession', () => {
    it('should create a session with provided title', async () => {
      const mockSessionData = {
        id: 'session-id-123',
        title: 'Test Session',
        userId: testUserId,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() {
          return {
            id: this.id,
            title: this.title,
            userId: this.userId,
            isFavorite: this.isFavorite,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
          };
        }
      };

      mockSessionRepository.create.mockReturnValue(mockSessionData as any);
      mockSessionRepository.save.mockResolvedValue(mockSessionData as any);

      const result = await chatService.createSession('Test Session', testUserId, mockHeaders);

      expect(mockSessionRepository.create).toHaveBeenCalledWith({
        title: 'Test Session',
        userId: testUserId
      });
      expect(mockSessionRepository.save).toHaveBeenCalledWith(mockSessionData);
      expect(result).toEqual(mockSessionData.toJSON());
    });

    it('should create a session with default title when title is empty', async () => {
      const mockSessionData = {
        id: 'session-id-123',
        title: 'New chat',
        userId: testUserId,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() {
          return {
            id: this.id,
            title: this.title,
            userId: this.userId,
            isFavorite: this.isFavorite,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
          };
        }
      };

      mockSessionRepository.create.mockReturnValue(mockSessionData as any);
      mockSessionRepository.save.mockResolvedValue(mockSessionData as any);

      const result = await chatService.createSession('', testUserId, mockHeaders);

      expect(mockSessionRepository.create).toHaveBeenCalledWith({
        title: 'New chat',
        userId: testUserId
      });
      expect(result).toEqual(mockSessionData.toJSON());
    });

    it('should throw error when session creation fails', async () => {
      const error = new Error('Database operation failed');
      mockSessionRepository.create.mockReturnValue({} as any);
      mockSessionRepository.save.mockRejectedValue(error);

      await expect(chatService.createSession('Test Session', testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions sorted by last message time', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          userId: testUserId,
          isFavorite: false,
          lastMessageAt: new Date('2024-01-02'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          toJSON: function() { return { id: this.id, title: this.title, userId: this.userId, isFavorite: this.isFavorite, lastMessageAt: this.lastMessageAt, createdAt: this.createdAt, updatedAt: this.updatedAt }; }
        },
        {
          id: 'session-2',
          title: 'Session 2',
          userId: testUserId,
          isFavorite: true,
          lastMessageAt: new Date('2024-01-03'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-03'),
          toJSON: function() { return { id: this.id, title: this.title, userId: this.userId, isFavorite: this.isFavorite, lastMessageAt: this.lastMessageAt, createdAt: this.createdAt, updatedAt: this.updatedAt }; }
        }
      ];

      mockSessionRepository.find.mockResolvedValue(mockSessions as any);

      const result = await chatService.getUserSessions(testUserId, mockHeaders);

      expect(mockSessionRepository.find).toHaveBeenCalledWith({
        where: { userId: testUserId },
        order: { lastMessageAt: 'DESC', createdAt: 'DESC' }
      });
      expect(result).toEqual([mockSessions[1].toJSON(), mockSessions[0].toJSON()]);
    });

    it('should return empty array when user has no sessions', async () => {
      mockSessionRepository.find.mockResolvedValue([]);

      const result = await chatService.getUserSessions(testUserId, mockHeaders);

      expect(result).toEqual([]);
    });
  });

  describe('addMessage', () => {
    it('should add a message to an existing session', async () => {
      const sessionId = 'session-id-123';
      const content = 'Test message content';
      const sender = 'user';
      const context = { test: 'context' };

      const mockSession = {
        id: sessionId,
        userId: testUserId,
        title: 'Test Session',
        lastMessageAt: new Date()
      };

      const mockMessage = {
        id: 'message-id-123',
        sessionId,
        sender,
        content,
        context,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() {
          return {
            id: this.id,
            sessionId: this.sessionId,
            sender: this.sender,
            content: this.content,
            context: this.context,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
          };
        }
      };

      mockSessionRepository.findOne.mockResolvedValue(mockSession as any);
      mockMessageRepository.create.mockReturnValue(mockMessage as any);
      mockMessageRepository.save.mockResolvedValue(mockMessage as any);
      mockSessionRepository.save.mockResolvedValue(mockSession as any);

      const result = await chatService.addMessage(sessionId, sender, content, context, testUserId, mockHeaders);

      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: sessionId, userId: testUserId }
      });
      expect(mockMessageRepository.create).toHaveBeenCalledWith({
        sessionId,
        sender,
        content,
        context
      });
      expect(mockMessageRepository.save).toHaveBeenCalledWith(mockMessage);
      expect(result).toEqual(mockMessage.toJSON());
    });

    it('should throw error when session is not found', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);

      await expect(
        chatService.addMessage('non-existent-session', 'user', 'content', null, testUserId, mockHeaders)
      ).rejects.toThrow();
    });
  });

  describe('smartChat', () => {
    it('should handle smart chat request successfully', async () => {
      const sessionId = 'session-id-123';
      const userMessage = 'What is TypeScript?';
      const mockSession = {
        id: sessionId,
        userId: testUserId,
        title: 'TypeScript Questions'
      };

      const mockMessages = [
        { sender: 'user', content: 'Previous question', createdAt: new Date() },
        { sender: 'assistant', content: 'Previous answer', createdAt: new Date() }
      ];

      const mockAIResponse: OpenAIResponse = {
        content: 'TypeScript is a superset of JavaScript...',
        finishReason: 'stop',
        tokensUsed: { prompt: 10, completion: 20, total: 30 }
      };

      mockSessionRepository.findOne.mockResolvedValue(mockSession as any);
      mockMessageRepository.find.mockResolvedValue(mockMessages as any);
      mockOpenAIService.buildConversationContext.mockReturnValue([
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
        { role: 'user', content: userMessage }
      ]);
      mockOpenAIService.generateChatCompletion.mockResolvedValue(mockAIResponse);

      // Mock message creation and saving
      const mockUserMessage = {
        id: 'user-msg-id',
        sessionId,
        sender: 'user',
        content: userMessage,
        toJSON: function() { return { id: this.id, sessionId: this.sessionId, sender: this.sender, content: this.content }; }
      };
      const mockAssistantMessage = {
        id: 'assistant-msg-id',
        sessionId,
        sender: 'assistant',
        content: mockAIResponse.content,
        toJSON: function() { return { id: this.id, sessionId: this.sessionId, sender: this.sender, content: this.content }; }
      };

      mockMessageRepository.create
        .mockReturnValueOnce(mockUserMessage as any)
        .mockReturnValueOnce(mockAssistantMessage as any);
      mockMessageRepository.save
        .mockResolvedValueOnce(mockUserMessage as any)
        .mockResolvedValueOnce(mockAssistantMessage as any);
      mockSessionRepository.save.mockResolvedValue(mockSession as any);

      const result = await chatService.smartChat(sessionId, userMessage, null, testUserId, mockHeaders);

      expect(mockOpenAIService.generateChatCompletion).toHaveBeenCalled();
      expect(result).toEqual({
        userMessage: mockUserMessage.toJSON(),
        assistantMessage: mockAssistantMessage.toJSON()
      });
    });

    it('should throw error when session is not found', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);

      await expect(
        chatService.smartChat('non-existent-session', 'message', null, testUserId, mockHeaders)
      ).rejects.toThrow();
    });

    it('should handle OpenAI service errors', async () => {
      const sessionId = 'session-id-123';
      const mockSession = { id: sessionId, userId: testUserId };

      mockSessionRepository.findOne.mockResolvedValue(mockSession as any);
      mockMessageRepository.find.mockResolvedValue([]);
      mockOpenAIService.buildConversationContext.mockReturnValue([]);
      mockOpenAIService.generateChatCompletion.mockRejectedValue(new Error('OpenAI API error'));

      await expect(
        chatService.smartChat(sessionId, 'message', null, testUserId, mockHeaders)
      ).rejects.toThrow('OpenAI API error');
    });
  });
});
