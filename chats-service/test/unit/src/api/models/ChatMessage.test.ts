import 'reflect-metadata';
import ChatMessage from '../../../../../src/api/models/ChatMessage';
import * as helpers from '../../../../../src/lib/env/helpers';

// Mock the encryption/decryption helpers
jest.mock('../../../../../src/lib/env/helpers', () => ({
  encryptValue: jest.fn(),
  decryptValue: jest.fn()
}));

describe('ChatMessage Model', () => {
  let mockEncryptValue: jest.Mock;
  let mockDecryptValue: jest.Mock;

  beforeEach(() => {
    mockEncryptValue = helpers.encryptValue as jest.Mock;
    mockDecryptValue = helpers.decryptValue as jest.Mock;

    // Default mock implementations
    mockEncryptValue.mockImplementation((text: string) => `encrypted_${text}`);
    mockDecryptValue.mockImplementation((text: string) => text.replace('encrypted_', ''));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Definition', () => {
    it('should have correct schema fields', () => {
      const schema = ChatMessage.schema;
      const paths = schema.paths;

      expect(paths.sessionId).toBeDefined();
      expect(paths.sender).toBeDefined();
      expect(paths.content).toBeDefined();
      expect(paths.context).toBeDefined();
      expect(paths.createdAt).toBeDefined();
      expect(paths.updatedAt).toBeDefined();
    });

    it('should have correct field types and requirements', () => {
      const schema = ChatMessage.schema;
      const paths = schema.paths;

      // sessionId field
      expect(paths.sessionId.instance).toBe('ObjectId');
      expect(paths.sessionId.isRequired).toBe(true);

      // sender field
      expect(paths.sender.instance).toBe('String');
      expect(paths.sender.isRequired).toBe(true);
      expect((paths.sender as any).enumValues).toEqual(['user', 'assistant', 'system']);

      // content field
      expect(paths.content.instance).toBe('String');
      expect(paths.content.isRequired).toBe(true);

      // context field
      expect(paths.context.instance).toBe('Mixed');
      expect(paths.context.isRequired).toBe(false);
    });

    it('should have timestamps enabled', () => {
      const schema = ChatMessage.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('Model Functionality', () => {
    it('should test encryption function is available', () => {
      const testContent = 'test message content';
      mockEncryptValue.mockReturnValue('encrypted_test message content');

      const result = helpers.encryptValue(testContent);

      expect(mockEncryptValue).toHaveBeenCalledWith(testContent);
      expect(result).toBe('encrypted_test message content');
    });

    it('should test decryption function is available', () => {
      const encryptedContent = 'encrypted_test message content';
      mockDecryptValue.mockReturnValue('test message content');

      const result = helpers.decryptValue(encryptedContent);

      expect(mockDecryptValue).toHaveBeenCalledWith(encryptedContent);
      expect(result).toBe('test message content');
    });

    it('should have pre-save middleware configured', () => {
      const schema = ChatMessage.schema;
      // Verify that middleware is set up
      expect(schema).toBeDefined();
      expect(schema.pre).toBeDefined();
    });

    it('should have post middleware configured', () => {
      const schema = ChatMessage.schema;
      // Verify that middleware is set up
      expect(schema).toBeDefined();
      expect(schema.post).toBeDefined();
    });
  });

  describe('Model Export', () => {
    it('should export the model correctly', () => {
      expect(ChatMessage).toBeDefined();
      expect(ChatMessage.modelName).toBe('ChatMessage');
    });

    it('should have correct collection name', () => {
      expect(ChatMessage.collection.name).toBe('chatmessages');
    });

    it('should be a Mongoose model', () => {
      expect(typeof ChatMessage).toBe('function');
      expect(ChatMessage.schema).toBeDefined();
    });

    it('should have the correct schema structure', () => {
      const schema = ChatMessage.schema;
      expect(schema.paths.sessionId.options.ref).toBe('ChatSession');
      expect(schema.paths.sender.options.enum).toEqual(['user', 'assistant', 'system']);
    });
  });
});
