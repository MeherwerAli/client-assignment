import 'reflect-metadata';
import { CODES } from '../../../../../src/api/errors/errorCodeConstants';
import { UserContextMiddleware } from '../../../../../src/api/middlewares/UserContextMiddleware';

// Mock helpers first
jest.mock('../../../../../src/lib/env/helpers', () => ({
  constructLogMessage: jest.fn((filename, method, headers) => `${filename}:${method}:${headers?.urc || 'unknown'}`)
}));

// Mock the Logger using manual mock
jest.mock('../../../../../src/lib/logger');

describe('UserContextMiddleware', () => {
  let middleware: UserContextMiddleware;

  beforeEach(() => {
    middleware = new UserContextMiddleware();
  });

  describe('use', () => {
    test('should extract valid user ID and attach to request', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': 'user123' },
        header: jest.fn().mockReturnValue('user123'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe('user123');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should accept alphanumeric user IDs', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': 'user123ABC' },
        header: jest.fn().mockReturnValue('user123ABC'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe('user123ABC');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should accept user IDs with minimum length', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': '123' },
        header: jest.fn().mockReturnValue('123'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should accept user IDs with maximum length', async () => {
      const maxLengthUserId = 'a'.repeat(50); // 50 characters
      const mockReq: any = {
        headers: { 'x-user-id': maxLengthUserId },
        header: jest.fn().mockReturnValue(maxLengthUserId),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe(maxLengthUserId);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should skip validation for health endpoint', async () => {
      const mockReq: any = {
        path: '/v1/health',
        header: jest.fn().mockReturnValue('test-urc')
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.header).toHaveBeenCalledWith('Unique-Reference-Code');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should throw MissingUserId error when x-user-id header is missing', async () => {
      const mockReq: any = {
        headers: {},
        header: jest.fn().mockReturnValue(undefined),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      try {
        await middleware.use(mockReq, mockRes, mockNext);
        fail('Expected method to throw');
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
        expect(error.code).toBe(CODES.MissingUserId);
      }
    });

    test('should throw MissingUserId error when x-user-id header is empty', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': '' },
        header: jest.fn().mockReturnValue(''),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      try {
        await middleware.use(mockReq, mockRes, mockNext);
        fail('Expected method to throw');
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
        expect(error.code).toBe(CODES.MissingUserId);
      }
    });

    test('should throw InvalidUserId error when user ID is too short', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': 'ab' },
        header: jest.fn().mockReturnValue('ab'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      try {
        await middleware.use(mockReq, mockRes, mockNext);
        fail('Expected method to throw');
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
        expect(error.code).toBe(CODES.InvalidUserId);
      }
    });

    test('should throw InvalidUserId error when user ID is too long', async () => {
      const tooLongUserId = 'a'.repeat(51); // 51 characters
      const mockReq: any = {
        headers: { 'x-user-id': tooLongUserId },
        header: jest.fn().mockReturnValue(tooLongUserId),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      try {
        await middleware.use(mockReq, mockRes, mockNext);
        fail('Expected method to throw');
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
        expect(error.code).toBe(CODES.InvalidUserId);
      }
    });

    test('should throw InvalidUserId error when user ID contains special characters', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': 'user123@#$' },
        header: jest.fn().mockReturnValue('user123@#$'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      try {
        await middleware.use(mockReq, mockRes, mockNext);
        fail('Expected method to throw');
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
        expect(error.code).toBe(CODES.InvalidUserId);
      }
    });

    test('should throw InvalidUserId error when user ID contains spaces', async () => {
      const mockReq: any = {
        headers: { 'x-user-id': 'user 123' },
        header: jest.fn().mockReturnValue('user 123'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      try {
        await middleware.use(mockReq, mockRes, mockNext);
        fail('Expected method to throw');
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
        expect(error.code).toBe(CODES.InvalidUserId);
      }
    });

    test('should handle case-sensitive headers correctly', async () => {
      const mockReq: any = {
        headers: { 'X-User-ID': 'user123' },
        header: jest.fn().mockReturnValue('user123'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe('user123');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle different HTTP methods', async () => {
      const mockReq: any = {
        method: 'POST',
        headers: { 'x-user-id': 'user123' },
        header: jest.fn().mockReturnValue('user123'),
        url: '/api/v1/chats'
      };
      const mockRes: any = {};
      const mockNext = jest.fn();

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe('user123');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
