import 'reflect-metadata';
import { ChatsController } from '../../../../../src/api/controllers/ChatsController';
import { AddMessageDto, GetMessagesDto, SmartChatDto } from '../../../../../src/api/dto';
import { ChatService } from '../../../../../src/api/services/ChatService';

// Mock the ChatService
jest.mock('../../../../../src/api/services/ChatService');

// Mock constructLogMessage and Logger
jest.mock('../../../../../src/lib/env/helpers', () => ({
  constructLogMessage: jest.fn().mockReturnValue('mocked log message'),
  isEmptyOrNull: jest.fn(value => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'number' && isNaN(value)) return true;
    return !value;
  })
}));

// Mock the Logger using manual mock
jest.mock('../../../../../src/lib/logger');

// Mock env
jest.mock('../../../../../src/env', () => ({
  env: {
    app: {
      version: '1.0.0'
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

describe('ChatsController', () => {
  let chatsController: ChatsController;
  let mockChatService: jest.Mocked<ChatService>;
  const testUserId = 'test-user-123';
  const mockReq = { userId: testUserId };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ChatService methods
    mockChatService = {
      createSession: jest.fn(),
      renameSession: jest.fn(),
      toggleFavorite: jest.fn(),
      deleteSession: jest.fn(),
      addMessage: jest.fn(),
      getMessages: jest.fn(),
      smartChat: jest.fn(),
      getUserSessions: jest.fn()
    } as any;

    chatsController = new ChatsController(mockChatService);
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createSessionDto = { title: 'Test Session' };
      const urc = 'test-urc-123';

      mockChatService.createSession.mockResolvedValue(mockSession as any);

      const result = await chatsController.createSession(createSessionDto, urc, mockReq);

      expect(mockChatService.createSession).toHaveBeenCalledWith('Test Session', testUserId, { urc: 'test-urc-123' });
      expect(result).toEqual(mockSession);
    });

    it('should create a session with empty title', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'New chat',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createSessionDto = { title: '' };
      const urc = 'test-urc-123';

      mockChatService.createSession.mockResolvedValue(mockSession as any);

      const result = await chatsController.createSession(createSessionDto, urc, mockReq);

      expect(mockChatService.createSession).toHaveBeenCalledWith('', testUserId, { urc: 'test-urc-123' });
      expect(result).toEqual(mockSession);
    });

    it('should create a session with undefined title', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'New chat',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createSessionDto = { title: undefined as any };
      const urc = 'test-urc-123';

      mockChatService.createSession.mockResolvedValue(mockSession as any);

      const result = await chatsController.createSession(createSessionDto, urc, mockReq);

      expect(mockChatService.createSession).toHaveBeenCalledWith(undefined, testUserId, { urc: 'test-urc-123' });
      expect(result).toEqual(mockSession);
    });

    it('should throw error when service fails', async () => {
      const createSessionDto = { title: 'Test Session' };
      const urc = 'test-urc-123';
      const error = new Error('Service error');

      mockChatService.createSession.mockRejectedValue(error);

      await expect(chatsController.createSession(createSessionDto, urc, mockReq)).rejects.toThrow('Service error');
    });
  });

  describe('renameSession', () => {
    it('should rename session successfully', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Updated Title',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const renameSessionDto = { title: 'Updated Title' };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.renameSession.mockResolvedValue(mockSession as any);

      const result = await chatsController.renameSession(sessionId, renameSessionDto, urc, mockReq);

      expect(mockChatService.renameSession).toHaveBeenCalledWith('session-id-123', 'Updated Title', 'test-user-123', {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockSession);
    });

    it('should handle empty title', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: '',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const renameSessionDto = { title: '' };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.renameSession.mockResolvedValue(mockSession as any);

      const result = await chatsController.renameSession(sessionId, renameSessionDto, urc, mockReq);

      expect(mockChatService.renameSession).toHaveBeenCalledWith('session-id-123', '', testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw error when service fails', async () => {
      const renameSessionDto = { title: 'Updated Title' };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const error = new Error('Service error');

      mockChatService.renameSession.mockRejectedValue(error);

      await expect(chatsController.renameSession(sessionId, renameSessionDto, urc, mockReq)).rejects.toThrow(
        'Service error'
      );
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite to true successfully', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const toggleFavoriteDto = { isFavorite: true };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.toggleFavorite.mockResolvedValue(mockSession as any);

      const result = await chatsController.toggleFavorite(sessionId, toggleFavoriteDto, urc, mockReq);

      expect(mockChatService.toggleFavorite).toHaveBeenCalledWith('session-id-123', true, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockSession);
    });

    it('should toggle favorite to false successfully', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const toggleFavoriteDto = { isFavorite: false };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.toggleFavorite.mockResolvedValue(mockSession as any);

      const result = await chatsController.toggleFavorite(sessionId, toggleFavoriteDto, urc, mockReq);

      expect(mockChatService.toggleFavorite).toHaveBeenCalledWith('session-id-123', false, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw error when service fails', async () => {
      const toggleFavoriteDto = { isFavorite: true };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const error = new Error('Service error');

      mockChatService.toggleFavorite.mockRejectedValue(error);

      await expect(chatsController.toggleFavorite(sessionId, toggleFavoriteDto, urc, mockReq)).rejects.toThrow(
        'Service error'
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      const mockSession = {
        _id: 'session-id-123',
        title: 'Test Session',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.deleteSession.mockResolvedValue(mockSession as any);

      const result = await chatsController.deleteSession(sessionId, urc, mockReq);

      expect(mockChatService.deleteSession).toHaveBeenCalledWith('session-id-123', testUserId, { urc: 'test-urc-123' });
      expect(result).toEqual(mockSession);
    });

    it('should throw error when service fails', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const error = new Error('Service error');

      mockChatService.deleteSession.mockRejectedValue(error);

      await expect(chatsController.deleteSession(sessionId, urc, mockReq)).rejects.toThrow('Service error');
    });
  });

  describe('addMessage', () => {
    it('should add message successfully with context', async () => {
      const mockMessage = {
        _id: 'message-id-123',
        sessionId: 'session-id-123',
        sender: 'user',
        content: 'Test message',
        context: { test: 'context' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const addMessageDto: AddMessageDto = {
        sender: 'user',
        content: 'Test message',
        context: { test: 'context' }
      };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.addMessage.mockResolvedValue(mockMessage as any);

      const result = await chatsController.addMessage(sessionId, addMessageDto, urc, mockReq);

      expect(mockChatService.addMessage).toHaveBeenCalledWith(
        'session-id-123',
        'user',
        'Test message',
        { test: 'context' },
        'test-user-123',
        { urc: 'test-urc-123' }
      );
      expect(result).toEqual(mockMessage);
    });

    it('should add message successfully without context', async () => {
      const mockMessage = {
        _id: 'message-id-123',
        sessionId: 'session-id-123',
        sender: 'assistant',
        content: 'Test response',
        context: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const addMessageDto: AddMessageDto = {
        sender: 'assistant',
        content: 'Test response',
        context: undefined
      };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.addMessage.mockResolvedValue(mockMessage as any);

      const result = await chatsController.addMessage(sessionId, addMessageDto, urc, mockReq);

      expect(mockChatService.addMessage).toHaveBeenCalledWith(
        'session-id-123',
        'assistant',
        'Test response',
        undefined,
        'test-user-123',
        { urc: 'test-urc-123' }
      );
      expect(result).toEqual(mockMessage);
    });

    it('should add system message successfully', async () => {
      const mockMessage = {
        _id: 'message-id-123',
        sessionId: 'session-id-123',
        sender: 'system',
        content: 'System message',
        context: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const addMessageDto: AddMessageDto = {
        sender: 'system',
        content: 'System message',
        context: null
      };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';

      mockChatService.addMessage.mockResolvedValue(mockMessage as any);

      const result = await chatsController.addMessage(sessionId, addMessageDto, urc, mockReq);

      expect(mockChatService.addMessage).toHaveBeenCalledWith(
        'session-id-123',
        'system',
        'System message',
        null,
        'test-user-123',
        {
          urc: 'test-urc-123'
        }
      );
      expect(result).toEqual(mockMessage);
    });

    it('should throw error when service fails', async () => {
      const addMessageDto: AddMessageDto = {
        sender: 'user',
        content: 'Test message',
        context: null
      };
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const error = new Error('Service error');

      mockChatService.addMessage.mockRejectedValue(error);

      await expect(chatsController.addMessage(sessionId, addMessageDto, urc, mockReq)).rejects.toThrow('Service error');
    });
  });

  describe('getMessages', () => {
    const mockMessages = [
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

    it('should get messages with default pagination', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 50, skip: 0 };

      mockChatService.getMessages.mockResolvedValue(mockMessages as any);

      const result = await chatsController.getMessages(sessionId, urc, query, mockReq);

      expect(mockChatService.getMessages).toHaveBeenCalledWith('session-id-123', 50, 0, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockMessages);
    });

    it('should get messages with custom pagination', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 10, skip: 5 };

      mockChatService.getMessages.mockResolvedValue(mockMessages as any);

      const result = await chatsController.getMessages(sessionId, urc, query, mockReq);

      expect(mockChatService.getMessages).toHaveBeenCalledWith('session-id-123', 10, 5, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockMessages);
    });

    it('should get messages with only limit specified', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 20, skip: 0 };

      mockChatService.getMessages.mockResolvedValue(mockMessages as any);

      const result = await chatsController.getMessages(sessionId, urc, query, mockReq);

      expect(mockChatService.getMessages).toHaveBeenCalledWith('session-id-123', 20, 0, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockMessages);
    });

    it('should get messages with only skip specified', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 50, skip: 15 };

      mockChatService.getMessages.mockResolvedValue(mockMessages as any);

      const result = await chatsController.getMessages(sessionId, urc, query, mockReq);

      expect(mockChatService.getMessages).toHaveBeenCalledWith('session-id-123', 50, 15, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockMessages);
    });

    it('should get messages with zero values', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 0, skip: 0 };

      mockChatService.getMessages.mockResolvedValue(mockMessages as any);

      const result = await chatsController.getMessages(sessionId, urc, query, mockReq);

      expect(mockChatService.getMessages).toHaveBeenCalledWith('session-id-123', 0, 0, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual(mockMessages);
    });

    it('should return empty array when no messages found', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 50, skip: 0 };

      mockChatService.getMessages.mockResolvedValue([]);

      const result = await chatsController.getMessages(sessionId, urc, query, mockReq);

      expect(mockChatService.getMessages).toHaveBeenCalledWith('session-id-123', 50, 0, testUserId, {
        urc: 'test-urc-123'
      });
      expect(result).toEqual([]);
    });

    it('should throw error when service fails', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const query: GetMessagesDto = { limit: 50, skip: 0 };
      const error = new Error('Service error');

      mockChatService.getMessages.mockRejectedValue(error);

      await expect(chatsController.getMessages(sessionId, urc, query, mockReq)).rejects.toThrow('Service error');
    });
  });

  describe('smartChat', () => {
    it('should process smart chat successfully', async () => {
      const mockResponse = {
        userMessage: {
          id: 'msg-1',
          content: 'How are you?',
          timestamp: new Date()
        },
        assistantMessage: {
          id: 'msg-2',
          content: 'I am doing well, thank you!',
          timestamp: new Date()
        },
        tokensUsed: {
          prompt: 20,
          completion: 10,
          total: 30
        },
        conversationLength: 2
      };

      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const body: SmartChatDto = {
        message: 'How are you?',
        context: undefined
      };

      mockChatService.smartChat.mockResolvedValue(mockResponse as any);

      const result = await chatsController.smartChat(sessionId, body, urc, mockReq);

      expect(mockChatService.smartChat).toHaveBeenCalledWith(
        'session-id-123',
        'How are you?',
        undefined,
        'test-user-123',
        {
          urc: 'test-urc-123'
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should process smart chat with context successfully', async () => {
      const mockResponse = {
        userMessage: {
          id: 'msg-1',
          content: 'Hello',
          timestamp: new Date()
        },
        assistantMessage: {
          id: 'msg-2',
          content: 'Hi there!',
          timestamp: new Date()
        },
        tokensUsed: {
          prompt: 15,
          completion: 5,
          total: 20
        },
        conversationLength: 2
      };

      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const body: SmartChatDto = {
        message: 'Hello',
        context: 'test context'
      };

      mockChatService.smartChat.mockResolvedValue(mockResponse as any);

      const result = await chatsController.smartChat(sessionId, body, urc, mockReq);

      expect(mockChatService.smartChat).toHaveBeenCalledWith(
        'session-id-123',
        'Hello',
        'test context',
        'test-user-123',
        {
          urc: 'test-urc-123'
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when service fails', async () => {
      const sessionId = 'session-id-123';
      const urc = 'test-urc-123';
      const body: SmartChatDto = {
        message: 'Hello',
        context: undefined
      };
      const error = new Error('Service error');

      mockChatService.smartChat.mockRejectedValue(error);

      await expect(chatsController.smartChat(sessionId, body, urc, mockReq)).rejects.toThrow('Service error');
    });
  });

  describe('constructor', () => {
    it('should initialize with ChatService dependency', () => {
      const newController = new ChatsController(mockChatService);
      expect(newController).toBeInstanceOf(ChatsController);
    });

    it('should have private log property initialized', () => {
      const newController = new ChatsController(mockChatService);
      expect(newController).toHaveProperty('log');
    });
  });
});
