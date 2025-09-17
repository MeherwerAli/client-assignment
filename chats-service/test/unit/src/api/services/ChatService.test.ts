import 'reflect-metadata';
import { CODES, HTTPCODES } from '../../../../../src/api/errors/errorCodeConstants';
import { IRequestHeaders } from '../../../../../src/api/Interface/IRequestHeaders';
import ChatMessage from '../../../../../src/api/models/ChatMessage';
import ChatSession from '../../../../../src/api/models/ChatSession';
import { ChatService } from '../../../../../src/api/services/ChatService';
import { OpenAIService } from '../../../../../src/api/services/OpenAIService';

// Mock Logger with the exact approach that works for Controller tests
jest.mock('../../../../../src/lib/logger');

// Mock the helpers module to use our manual mock
jest.mock('../../../../../src/lib/env/helpers', () => ({
  constructLogMessage: jest.fn((filename, method, headers) => `${filename}:${method}:${headers?.urc || 'unknown'}`),
  decryptValue: jest.fn(async (value: any) => value), // Return value as-is for testing
  encryptValue: jest.fn(async (value: any) => value) // Return value as-is for testing
}));

// Mock the models
jest.mock('../../../../../src/api/models/ChatSession');
jest.mock('../../../../../src/api/models/ChatMessage');

// Mock OpenAIService
jest.mock('../../../../../src/api/services/OpenAIService', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    generateChatCompletion: jest.fn(),
    buildConversationContext: jest.fn(),
    validateConfiguration: jest.fn()
  }))
}));

// Mock env
jest.mock('../../../../../src/env', () => ({
  env: {
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

describe('ChatService', () => {
  let chatService: ChatService;
  let mockHeaders: IRequestHeaders;
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  let testUserId: string;

  // Mock implementations
  const MockedChatSession = ChatSession as jest.Mocked<typeof ChatSession>;
  const MockedChatMessage = ChatMessage as jest.Mocked<typeof ChatMessage>;

  beforeEach(() => {
    jest.clearAllMocks();

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
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatSession.create.mockResolvedValue(mockSession as any);

      const result = await chatService.createSession('Test Session', testUserId, mockHeaders);

      expect(MockedChatSession.create).toHaveBeenCalledWith({
        title: 'Test Session',
        userId: testUserId
      });
      expect(result).toEqual(mockSessionData);
    });

    it('should create a session with default title when title is empty', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'New chat',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatSession.create.mockResolvedValue(mockSession as any);

      const result = await chatService.createSession('', testUserId, mockHeaders);

      expect(MockedChatSession.create).toHaveBeenCalledWith({
        title: 'New chat',
        userId: 'test-user-123'
      });
      expect(result).toEqual(mockSessionData);
    });

    it('should create a session with default title when title is null', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'New chat',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatSession.create.mockResolvedValue(mockSession as any);

      const result = await chatService.createSession(null as any, testUserId, mockHeaders);

      expect(MockedChatSession.create).toHaveBeenCalledWith({
        title: 'New chat',
        userId: 'test-user-123'
      });
      expect(result).toEqual(mockSessionData);
    });

    it('should throw error when ChatSession.create fails', async () => {
      const error = new Error('Database operation failed');
      MockedChatSession.create.mockRejectedValue(error);

      await expect(chatService.createSession('Test Session', testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });
  });

  describe('renameSession', () => {
    it('should rename session successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Updated Title',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatSession.findOneAndUpdate.mockResolvedValue(mockSession as any);

      const result = await chatService.renameSession('session-id-123', 'Updated Title', testUserId, mockHeaders);

      expect(MockedChatSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session-id-123', userId: testUserId },
        { title: 'Updated Title' },
        { new: true }
      );
      expect(result).toEqual(mockSessionData);
    });

    it('should throw error when trying to rename non-existent session', async () => {
      MockedChatSession.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        chatService.renameSession('non-existent-id', 'New Title', testUserId, mockHeaders)
      ).rejects.toThrow();
    });

    it('should throw error when database operation fails', async () => {
      const error = new Error('Database operation failed');
      MockedChatSession.findOneAndUpdate.mockRejectedValue(error);

      await expect(chatService.renameSession('session-id-123', 'New Title', testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite to true successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatSession.findOneAndUpdate.mockResolvedValue(mockSession as any);

      const result = await chatService.toggleFavorite('session-id-123', true, testUserId, mockHeaders);

      expect(MockedChatSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session-id-123', userId: testUserId },
        { isFavorite: true },
        { new: true }
      );
      expect(result).toEqual(mockSessionData);
    });

    it('should toggle favorite to false successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatSession.findOneAndUpdate.mockResolvedValue(mockSession as any);

      const result = await chatService.toggleFavorite('session-id-123', false, testUserId, mockHeaders);

      expect(MockedChatSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session-id-123', userId: testUserId },
        { isFavorite: false },
        { new: true }
      );
      expect(result).toEqual(mockSessionData);
    });

    it('should throw CredError when session not found', async () => {
      MockedChatSession.findOneAndUpdate.mockResolvedValue(null);

      const error = await chatService
        .toggleFavorite('non-existent-id', true, testUserId, mockHeaders)
        .catch(err => err);

      expect(error).toHaveProperty('httpCode', HTTPCODES.NOT_FOUND);
      expect(error).toHaveProperty('code', CODES.NotFound);
    });

    it('should throw error when database operation fails', async () => {
      const error = new Error('Database operation failed');
      MockedChatSession.findOneAndUpdate.mockRejectedValue(error);

      await expect(chatService.toggleFavorite('session-id-123', true, testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session and all messages successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatMessage.deleteMany.mockResolvedValue({ deletedCount: 5 } as any);
      MockedChatSession.findOneAndDelete.mockResolvedValue(mockSession as any);

      const result = await chatService.deleteSession('session-id-123', testUserId, mockHeaders);

      expect(MockedChatMessage.deleteMany).toHaveBeenCalledWith({ sessionId: 'session-id-123' });
      expect(MockedChatSession.findOneAndDelete).toHaveBeenCalledWith({ _id: 'session-id-123', userId: testUserId });
      expect(result).toEqual(mockSessionData);
    });

    it('should throw CredError when session not found', async () => {
      MockedChatMessage.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      MockedChatSession.findOneAndDelete.mockResolvedValue(null);

      const error = await chatService.deleteSession('non-existent-id', testUserId, mockHeaders).catch(err => err);

      expect(error).toHaveProperty('httpCode', HTTPCODES.NOT_FOUND);
      expect(error).toHaveProperty('code', CODES.NotFound);
    });

    it('should delete session even when no messages exist', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      MockedChatMessage.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      MockedChatSession.findOneAndDelete.mockResolvedValue(mockSession as any);

      const result = await chatService.deleteSession('session-id-123', testUserId, mockHeaders);

      expect(MockedChatMessage.deleteMany).toHaveBeenCalledWith({ sessionId: 'session-id-123' });
      expect(MockedChatSession.findOneAndDelete).toHaveBeenCalledWith({ _id: 'session-id-123', userId: testUserId });
      expect(result).toEqual(mockSessionData);
    });

    it('should throw error when message deletion fails', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        userId: testUserId,
        isFavorite: false,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({
          _id: 'session-id-123',
          title: 'Test Session',
          userId: testUserId,
          isFavorite: false,
          lastMessageAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      const error = new Error('Database operation failed');
      MockedChatSession.findOneAndDelete.mockResolvedValue(mockSession as any);
      MockedChatMessage.deleteMany.mockRejectedValue(error);

      await expect(chatService.deleteSession('session-id-123', testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });

    it('should throw error when session deletion fails', async () => {
      const error = new Error('Database operation failed');
      MockedChatMessage.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      MockedChatSession.findOneAndDelete.mockRejectedValue(error);

      await expect(chatService.deleteSession('session-id-123', testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });
  });

  describe('addMessage', () => {
    it('should add message successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      const mockMessageData = {
        _id: 'message-id-123',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Test message',
        context: { test: 'context' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockMessage = {
        ...mockMessageData,
        toJSON: () => mockMessageData
      };

      MockedChatSession.findOne.mockResolvedValue(mockSession as any);
      MockedChatMessage.create.mockResolvedValue(mockMessage as any);
      MockedChatSession.findOneAndUpdate.mockResolvedValue(mockSession as any);

      const result = await chatService.addMessage(
        'session-id-123',
        'user',
        'Test message',
        { test: 'context' },
        testUserId,
        mockHeaders
      );

      expect(MockedChatSession.findOne).toHaveBeenCalledWith({ _id: 'session-id-123', userId: testUserId });
      expect(MockedChatMessage.create).toHaveBeenCalledWith({
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Test message',
        context: { test: 'context' }
      });
      expect(MockedChatSession.findByIdAndUpdate).toHaveBeenCalledWith('session-id-123', {
        lastMessageAt: mockMessageData.createdAt
      });
      expect(result).toEqual(mockMessageData);
    });

    it('should add message without context successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      const mockMessageData = {
        _id: 'message-id-123',
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'Test response',
        context: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockMessage = {
        ...mockMessageData,
        toJSON: () => mockMessageData
      };

      MockedChatSession.findOne.mockResolvedValue(mockSession as any);
      MockedChatMessage.create.mockResolvedValue(mockMessage as any);
      MockedChatSession.findOneAndUpdate.mockResolvedValue(mockSession as any);

      const result = await chatService.addMessage(
        'session-id-123',
        'assistant',
        'Test response',
        undefined,
        testUserId,
        mockHeaders
      );

      expect(MockedChatMessage.create).toHaveBeenCalledWith({
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'Test response',
        context: undefined
      });
      expect(result).toEqual(mockMessageData);
    });

    it('should throw CredError when session not found', async () => {
      MockedChatSession.findOne.mockResolvedValue(null);

      const error = await chatService
        .addMessage('non-existent-id', 'user', 'Test message', null, testUserId, mockHeaders)
        .catch(err => err);

      expect(error).toHaveProperty('httpCode', HTTPCODES.NOT_FOUND);
      expect(error).toHaveProperty('code', CODES.NotFound);
    });

    it('should throw error when session lookup fails', async () => {
      const error = new Error('Database operation failed');
      MockedChatSession.findOne.mockRejectedValue(error);

      await expect(
        chatService.addMessage('session-id-123', 'user', 'Test message', null, testUserId, mockHeaders)
      ).rejects.toThrow('Database operation failed');
    });

    it('should throw error when message creation fails', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const error = new Error('Database operation failed');
      MockedChatSession.findOne.mockResolvedValue(mockSession as any);
      MockedChatMessage.create.mockRejectedValue(error);

      await expect(
        chatService.addMessage('session-id-123', 'user', 'Test message', null, testUserId, mockHeaders)
      ).rejects.toThrow('Database operation failed');
    });

    it('should throw error when session update fails', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockMessage = {
        _id: 'message-id-123',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Test message',
        context: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({
          _id: 'message-id-123',
          sessionId: 'session-id-123',
          sender: 'user',
          content: 'Test message',
          context: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      const error = new Error('Database operation failed');
      MockedChatSession.findOne.mockResolvedValue(mockSession as any);
      MockedChatMessage.create.mockResolvedValue(mockMessage as any);
      MockedChatSession.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        chatService.addMessage('session-id-123', 'user', 'Test message', null, testUserId, mockHeaders)
      ).rejects.toThrow('Database operation failed');
    });
  });

  describe('getMessages', () => {
    const mockMessagesData = [
      {
        _id: 'message-id-3',
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'Latest message',
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-03')
      },
      {
        _id: 'message-id-2',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Middle message',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02')
      },
      {
        _id: 'message-id-1',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Oldest message',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ];

    const mockMessages = mockMessagesData.map(data => ({
      ...data,
      toJSON: () => data
    }));

    beforeEach(() => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        userId: testUserId,
        isFavorite: false,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      MockedChatSession.findOne.mockResolvedValue(mockSession as any);

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMessages)
      };
      MockedChatMessage.find.mockReturnValue(mockFind as any);
    });

    it('should get messages with default pagination', async () => {
      const result = await chatService.getMessages('session-id-123', undefined, undefined, testUserId, mockHeaders);

      expect(MockedChatMessage.find).toHaveBeenCalledWith({ sessionId: 'session-id-123' });
      expect(result).toEqual(mockMessagesData);

      // Verify the chain methods were called with correct parameters
      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(50);
    });

    it('should get messages with custom pagination', async () => {
      const result = await chatService.getMessages('session-id-123', 10, 5, testUserId, mockHeaders);

      expect(MockedChatMessage.find).toHaveBeenCalledWith({ sessionId: 'session-id-123' });
      expect(result).toEqual(mockMessagesData);

      // Verify the chain methods were called with correct parameters
      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockFind.skip).toHaveBeenCalledWith(5);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
    });

    it('should sanitize limit to maximum of 100', async () => {
      await chatService.getMessages('session-id-123', 200, 0, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.limit).toHaveBeenCalledWith(100);
    });

    it('should sanitize limit to minimum of 1', async () => {
      await chatService.getMessages('session-id-123', 0, 0, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.limit).toHaveBeenCalledWith(50); // 0 becomes 50 (default)
    });

    it('should sanitize negative limit to default', async () => {
      await chatService.getMessages('session-id-123', -5, 0, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.limit).toHaveBeenCalledWith(1); // Math.max(NaN || 50, 1) = Math.max(50, 1) = 50, but Number(-5) = -5, Math.max(-5, 1) = 1
    });

    it('should sanitize negative skip to 0', async () => {
      await chatService.getMessages('session-id-123', 10, -5, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.skip).toHaveBeenCalledWith(0);
    });

    it('should handle string parameters and convert them to numbers', async () => {
      await chatService.getMessages('session-id-123', '20' as any, '10' as any, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.limit).toHaveBeenCalledWith(20);
      expect(mockFind.skip).toHaveBeenCalledWith(10);
    });

    it('should handle invalid string parameters and use defaults', async () => {
      await chatService.getMessages('session-id-123', 'invalid' as any, 'invalid' as any, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.limit).toHaveBeenCalledWith(50);
      expect(mockFind.skip).toHaveBeenCalledWith(0);
    });

    it('should handle null parameters and use defaults', async () => {
      await chatService.getMessages('session-id-123', null as any, null as any, testUserId, mockHeaders);

      const mockFind = MockedChatMessage.find({ sessionId: 'session-id-123' });
      expect(mockFind.limit).toHaveBeenCalledWith(50);
      expect(mockFind.skip).toHaveBeenCalledWith(0);
    });

    it('should throw error when database operation fails', async () => {
      const error = new Error('Database operation failed');
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(error)
      };
      MockedChatMessage.find.mockReturnValue(mockFind as any);

      await expect(chatService.getMessages('session-id-123', 10, 0, testUserId, mockHeaders)).rejects.toThrow(
        'Database operation failed'
      );
    });

    it('should return empty array when no messages found', async () => {
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };
      MockedChatMessage.find.mockReturnValue(mockFind as any);

      const result = await chatService.getMessages('session-id-123', 10, 0, testUserId, mockHeaders);

      expect(result).toEqual([]);
    });
  });

  describe('smartChat', () => {
    it('should process smart chat successfully', async () => {
      const mockSessionData = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        ...mockSessionData,
        toJSON: () => mockSessionData
      };

      const mockConversationHistory = [
        {
          _id: 'msg-1',
          sessionId: 'session-id-123',
          sender: 'user',
          content: 'Hello',
          createdAt: new Date('2023-01-01'),
          toJSON: () => ({
            _id: 'msg-1',
            sessionId: 'session-id-123',
            sender: 'user',
            content: 'Hello',
            createdAt: new Date('2023-01-01')
          })
        }
      ];

      const mockUserMessage = {
        _id: 'msg-2',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'How are you?',
        createdAt: new Date(),
        toJSON: () => ({
          _id: 'msg-2',
          sessionId: 'session-id-123',
          sender: 'user',
          content: 'How are you?',
          createdAt: new Date()
        })
      };

      const mockAssistantMessage = {
        _id: 'msg-3',
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'I am doing well, thank you!',
        createdAt: new Date(),
        toJSON: () => ({
          _id: 'msg-3',
          sessionId: 'session-id-123',
          sender: 'assistant',
          content: 'I am doing well, thank you!',
          createdAt: new Date()
        })
      };

      const mockOpenAIResponse = {
        content: 'I am doing well, thank you!',
        finishReason: 'stop',
        tokensUsed: { prompt: 20, completion: 10, total: 30 }
      };

      const mockConversationContext = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ];

      MockedChatSession.findOne.mockResolvedValue(mockSession as any);

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockConversationHistory)
      };
      MockedChatMessage.find.mockReturnValue(mockFind as any);

      mockOpenAIService.buildConversationContext.mockReturnValue(mockConversationContext as any);
      mockOpenAIService.generateChatCompletion.mockResolvedValue(mockOpenAIResponse);

      MockedChatMessage.create
        .mockResolvedValueOnce(mockUserMessage as any)
        .mockResolvedValueOnce(mockAssistantMessage as any);

      MockedChatSession.findByIdAndUpdate.mockResolvedValue(mockSession as any);
      MockedChatMessage.countDocuments.mockResolvedValue(3);

      const result = await chatService.smartChat('session-id-123', 'How are you?', undefined, testUserId, mockHeaders);

      expect(MockedChatSession.findOne).toHaveBeenCalledWith({ _id: 'session-id-123', userId: testUserId });
      expect(mockOpenAIService.buildConversationContext).toHaveBeenCalledWith([
        { sender: 'user', content: 'Hello', createdAt: new Date('2023-01-01') }
      ]);
      expect(mockOpenAIService.generateChatCompletion).toHaveBeenCalledWith(
        [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
          { role: 'user', content: 'How are you?' }
        ],
        mockHeaders
      );

      expect(MockedChatMessage.create).toHaveBeenCalledTimes(2);
      expect(MockedChatMessage.create).toHaveBeenNthCalledWith(1, {
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'How are you?',
        context: undefined
      });
      expect(MockedChatMessage.create).toHaveBeenNthCalledWith(2, {
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'I am doing well, thank you!',
        context: {
          tokensUsed: { prompt: 20, completion: 10, total: 30 },
          finishReason: 'stop'
        }
      });

      expect(result.userMessage.content).toBe('How are you?');
      expect(result.assistantMessage.content).toBe('I am doing well, thank you!');
      expect(result.tokensUsed).toEqual({ prompt: 20, completion: 10, total: 30 });
      expect(result.conversationLength).toBe(3);
    });

    it('should process smart chat with context successfully', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({ _id: 'session-id-123', title: 'Test Session' })
      };

      const mockUserMessage = {
        _id: 'msg-1',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Hello',
        createdAt: new Date(),
        toJSON: () => ({ _id: 'msg-1', content: 'Hello', createdAt: new Date() })
      };

      const mockAssistantMessage = {
        _id: 'msg-2',
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'Hi there!',
        createdAt: new Date(),
        toJSON: () => ({ _id: 'msg-2', content: 'Hi there!', createdAt: new Date() })
      };

      MockedChatSession.findOne.mockResolvedValue(mockSession as any);

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };
      MockedChatMessage.find.mockReturnValue(mockFind as any);

      mockOpenAIService.buildConversationContext.mockReturnValue([
        { role: 'system', content: 'You are a helpful assistant.' }
      ] as any);
      mockOpenAIService.generateChatCompletion.mockResolvedValue({
        content: 'Hi there!',
        finishReason: 'stop',
        tokensUsed: { prompt: 15, completion: 5, total: 20 }
      });

      MockedChatMessage.create
        .mockResolvedValueOnce(mockUserMessage as any)
        .mockResolvedValueOnce(mockAssistantMessage as any);

      MockedChatSession.findByIdAndUpdate.mockResolvedValue(mockSession as any);
      MockedChatMessage.countDocuments.mockResolvedValue(2);

      const result = await chatService.smartChat('session-id-123', 'Hello', 'test context', testUserId, mockHeaders);

      expect(MockedChatMessage.create).toHaveBeenNthCalledWith(1, {
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Hello',
        context: { userContext: 'test context' }
      });

      expect(result.userMessage.content).toBe('Hello');
      expect(result.assistantMessage.content).toBe('Hi there!');
    });

    it('should throw CredError when session not found', async () => {
      MockedChatSession.findOne.mockResolvedValue(null);

      const error = await chatService
        .smartChat('non-existent-id', 'Hello', undefined, testUserId, mockHeaders)
        .catch(err => err);

      expect(error).toHaveProperty('httpCode', HTTPCODES.NOT_FOUND);
      expect(error).toHaveProperty('code', CODES.NotFound);
    });

    it('should throw error when session lookup fails', async () => {
      const dbError = new Error('Database operation failed');
      MockedChatSession.findOne.mockRejectedValue(dbError);

      await expect(
        chatService.smartChat('session-id-123', 'Hello', undefined, testUserId, mockHeaders)
      ).rejects.toThrow('Database operation failed');
    });

    it('should throw error when OpenAI service fails', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        toJSON: () => ({ _id: 'session-id-123', title: 'Test Session' })
      };

      MockedChatSession.findOne.mockResolvedValue(mockSession as any);

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };
      MockedChatMessage.find.mockReturnValue(mockFind as any);

      mockOpenAIService.buildConversationContext.mockReturnValue([
        { role: 'system', content: 'You are a helpful assistant.' }
      ] as any);

      const openAIError = new Error('OpenAI API error');
      mockOpenAIService.generateChatCompletion.mockRejectedValue(openAIError);

      await expect(
        chatService.smartChat('session-id-123', 'Hello', undefined, testUserId, mockHeaders)
      ).rejects.toThrow('OpenAI API error');
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions filtered by userId', async () => {
      const mockSessions = [
        {
          _id: 'session1',
          title: 'Chat 1',
          userId: testUserId,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: () => ({
            _id: 'session1',
            title: 'Chat 1',
            userId: testUserId,
            isFavorite: false,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        },
        {
          _id: 'session2',
          title: 'Chat 2',
          userId: testUserId,
          isFavorite: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: () => ({
            _id: 'session2',
            title: 'Chat 2',
            userId: testUserId,
            isFavorite: true,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSessions)
      };

      MockedChatSession.find.mockReturnValue(mockQuery as any);

      const result = await chatService.getUserSessions(testUserId, mockHeaders);

      expect(MockedChatSession.find).toHaveBeenCalledWith({ userId: testUserId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ lastMessageAt: -1, createdAt: -1 });
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Chat 1');
      expect(result[1].title).toBe('Chat 2');
    });

    it('should return empty array when user has no sessions', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };

      MockedChatSession.find.mockReturnValue(mockQuery as any);

      const result = await chatService.getUserSessions(testUserId, mockHeaders);

      expect(MockedChatSession.find).toHaveBeenCalledWith({ userId: testUserId });
      expect(result).toEqual([]);
    });

    it('should handle database error', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database operation failed'))
      };

      MockedChatSession.find.mockReturnValue(mockQuery as any);

      await expect(chatService.getUserSessions(testUserId, mockHeaders)).rejects.toThrow('Database operation failed');
    });
  });
});
