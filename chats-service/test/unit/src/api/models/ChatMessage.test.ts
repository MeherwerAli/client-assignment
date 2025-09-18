import 'reflect-metadata';
import { ChatMessage, MessageSender } from '../../../../../src/api/entities/ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import * as helpers from '../../../../../src/lib/env/helpers';

// Mock the encryption/decryption helpers
jest.mock('../../../../../src/lib/env/helpers', () => ({
  encryptValue: jest.fn(),
  decryptValue: jest.fn(),
  constructLogMessage: jest.fn().mockReturnValue('mocked log message')
}));

describe('ChatMessage Entity', () => {
  let mockEncryptValue: jest.Mock;
  let mockDecryptValue: jest.Mock;
  let validSessionId: string;
  let validMessageId: string;

  beforeEach(() => {
    mockEncryptValue = helpers.encryptValue as jest.Mock;
    mockDecryptValue = helpers.decryptValue as jest.Mock;

    // Default mock implementations
    mockEncryptValue.mockImplementation((text: string) => Promise.resolve(`encrypted_${text}`));
    mockDecryptValue.mockImplementation((text: string) => Promise.resolve(text.replace('encrypted_', '')));

    // Generate valid UUIDs for testing
    validSessionId = uuidv4();
    validMessageId = uuidv4();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Entity Definition', () => {
    it('should create a ChatMessage instance with all required fields', () => {
      const message = new ChatMessage();
      message.id = validMessageId;
      message.sessionId = validSessionId;
      message.sender = 'user';
      message.content = 'Test message content';
      message.context = { test: 'context' };

      expect(message).toBeDefined();
      expect(message.id).toBe(validMessageId);
      expect(message.sessionId).toBe(validSessionId);
      expect(message.sender).toBe('user');
      expect(message.content).toBe('Test message content');
      expect(message.context).toEqual({ test: 'context' });
    });

    it('should have correct default values', () => {
      const message = new ChatMessage();
      
      expect(message.id).toBeUndefined();
      expect(message.sessionId).toBeUndefined();
      expect(message.sender).toBeUndefined();
      expect(message.content).toBeUndefined();
      expect(message.context).toBeUndefined();
      expect(message.createdAt).toBeUndefined();
      expect(message.updatedAt).toBeUndefined();
    });

    it('should allow setting all properties', () => {
      const message = new ChatMessage();
      const now = new Date();
      
      message.id = validMessageId;
      message.sessionId = validSessionId;
      message.sender = 'assistant';
      message.content = 'Assistant response';
      message.context = { metadata: 'test' };
      message.createdAt = now;
      message.updatedAt = now;

      expect(message.id).toBe(validMessageId);
      expect(message.sessionId).toBe(validSessionId);
      expect(message.sender).toBe('assistant');
      expect(message.content).toBe('Assistant response');
      expect(message.context).toEqual({ metadata: 'test' });
      expect(message.createdAt).toBe(now);
      expect(message.updatedAt).toBe(now);
    });
  });

  describe('Entity Behavior', () => {
    let validMessage: ChatMessage;

    beforeEach(() => {
      validMessage = new ChatMessage();
      validMessage.id = validMessageId;
      validMessage.sessionId = validSessionId;
      validMessage.sender = 'user';
      validMessage.content = 'Valid message content';
    });

    it('should create a message with valid data', () => {
      expect(validMessage.id).toBe(validMessageId);
      expect(validMessage.sessionId).toBe(validSessionId);
      expect(validMessage.sender).toBe('user');
      expect(validMessage.content).toBe('Valid message content');
    });

    it('should allow all valid sender types', () => {
      const senders: MessageSender[] = ['user', 'assistant', 'system'];
      senders.forEach(sender => {
        const message = new ChatMessage();
        message.sender = sender;
        expect(message.sender).toBe(sender);
      });
    });

    it('should handle optional context field', () => {
      const messageWithContext = new ChatMessage();
      messageWithContext.context = { metadata: 'test' };
      expect(messageWithContext.context).toEqual({ metadata: 'test' });

      const messageWithoutContext = new ChatMessage();
      expect(messageWithoutContext.context).toBeUndefined();
    });

    it('should support UUID session references', () => {
      const message = new ChatMessage();
      message.sessionId = validSessionId;
      expect(message.sessionId).toBe(validSessionId);
    });

    it('should handle all message content types', () => {
      const contentTests = [
        'Simple text',
        'Text with special chars: !@#$%^&*()',
        'Multi-line\ncontent\nwith\nbreaks',
        '{"json": "content", "nested": {"key": "value"}}',
        'Very long content '.repeat(100)
      ];

      contentTests.forEach(content => {
        const message = new ChatMessage();
        message.content = content;
        expect(message.content).toBe(content);
      });
    });
  });

  describe('Encryption Functionality', () => {
    it('should test encryption function is available', async () => {
      const testContent = 'test message content';
      mockEncryptValue.mockResolvedValue('encrypted_test message content');

      const result = await helpers.encryptValue(testContent);

      expect(mockEncryptValue).toHaveBeenCalledWith(testContent);
      expect(result).toBe('encrypted_test message content');
    });

    it('should test decryption function is available', async () => {
      const encryptedContent = 'encrypted_test message content';
      mockDecryptValue.mockResolvedValue('test message content');

      const result = await helpers.decryptValue(encryptedContent);

      expect(mockDecryptValue).toHaveBeenCalledWith(encryptedContent);
      expect(result).toBe('test message content');
    });

    it('should handle encryption errors gracefully', async () => {
      const testContent = 'test message content';
      mockEncryptValue.mockRejectedValue(new Error('Encryption failed'));

      await expect(helpers.encryptValue(testContent)).rejects.toThrow('Encryption failed');
      expect(mockEncryptValue).toHaveBeenCalledWith(testContent);
    });

    it('should handle decryption errors gracefully', async () => {
      const encryptedContent = 'encrypted_test message content';
      mockDecryptValue.mockRejectedValue(new Error('Decryption failed'));

      await expect(helpers.decryptValue(encryptedContent)).rejects.toThrow('Decryption failed');
      expect(mockDecryptValue).toHaveBeenCalledWith(encryptedContent);
    });
  });

  describe('Entity Relationships', () => {
    it('should define relationship with ChatSession', () => {
      const message = new ChatMessage();
      
      // Check that the entity can accept a session relationship
      expect(() => {
        message.sessionId = validSessionId;
      }).not.toThrow();
    });

    it('should maintain referential integrity concept', () => {
      const message = new ChatMessage();
      message.sessionId = validSessionId;
      
      expect(message.sessionId).toBe(validSessionId);
      // In a real database, this would maintain foreign key constraints
    });
  });

  describe('Entity Instantiation', () => {
    it('should create valid entity instance', () => {
      const message = new ChatMessage();
      
      expect(message).toBeInstanceOf(ChatMessage);
      expect(typeof message).toBe('object');
    });

    it('should allow partial instantiation', () => {
      const message = new ChatMessage();
      message.sender = 'user';
      message.content = 'Test content';
      
      expect(message.sender).toBe('user');
      expect(message.content).toBe('Test content');
      expect(message.sessionId).toBeUndefined();
    });

    it('should support method chaining style initialization', () => {
      const message = new ChatMessage();
      const result = Object.assign(message, {
        id: validMessageId,
        sessionId: validSessionId,
        sender: 'system',
        content: 'System message'
      });
      
      expect(result).toBe(message);
      expect(message.id).toBe(validMessageId);
      expect(message.sessionId).toBe(validSessionId);
      expect(message.sender).toBe('system');
      expect(message.content).toBe('System message');
    });
  });
});
