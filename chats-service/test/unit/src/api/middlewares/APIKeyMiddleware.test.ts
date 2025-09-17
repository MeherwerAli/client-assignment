import * as express from 'express';
import { CODES, HTTPCODES } from '../../../../../src/api/errors/errorCodeConstants';
import { APIKeyMiddleware } from '../../../../../src/api/middlewares/APIKeyMiddleware';

// Mock the env module
jest.mock('../../../../../src/env', () => ({
  env: {
    app: {
      apiKey: 'test-api-key'
    },
    isDevelopment: false,
    errors: {
      default: {
        errorCode: 'CHATS_SERVICE.GLOBAL.UNMAPPED-ERROR',
        errorMessage: 'Something went wrong, please try after sometime',
        errorDescription: 'Error is not mapped in the service, please check log for further info'
      }
    }
  }
}));

describe('APIKeyMiddleware', () => {
  let middleware: APIKeyMiddleware;
  let mockRequest: Partial<express.Request>;
  let mockResponse: Partial<express.Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new APIKeyMiddleware();
    mockRequest = {
      header: jest.fn()
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when API key is configured', () => {
    beforeEach(() => {
      const { env } = require('../../../../../src/env');
      (env.app as any).apiKey = 'test-api-key';
    });

    it('should call next() when valid API key is provided', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('test-api-key');

      middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when invalid API key is provided', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('invalid-key');

      expect(() => {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when API key header is missing', () => {
      (mockRequest.header as jest.Mock).mockReturnValue(undefined);

      expect(() => {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when API key header is empty string', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('');

      expect(() => {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when API key header is only whitespace', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('   ');

      expect(() => {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle API key with whitespace correctly', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('  test-api-key  ');

      middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error with correct error properties', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('invalid-key');

      let thrownError: any;
      try {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError.httpCode).toBe(HTTPCODES.UNAUTHORIZED);
      expect(thrownError.code).toBe(CODES.NotAuthorized);
    });
  });

  describe('when API key is not configured', () => {
    beforeEach(() => {
      const { env } = require('../../../../../src/env');
      (env.app as any).apiKey = undefined;
    });

    it('should call next() in development environment', () => {
      const { env } = require('../../../../../src/env');
      (env as any).isDevelopment = true;

      middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error in production environment', () => {
      const { env } = require('../../../../../src/env');
      (env as any).isDevelopment = false;

      expect(() => {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error with correct error properties when no API key configured in production', () => {
      const { env } = require('../../../../../src/env');
      (env as any).isDevelopment = false;

      let thrownError: any;
      try {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError.httpCode).toBe(HTTPCODES.UNAUTHORIZED);
      expect(thrownError.code).toBe(CODES.NotAuthorized);
    });
  });

  describe('when API key is empty string in configuration', () => {
    beforeEach(() => {
      const { env } = require('../../../../../src/env');
      (env.app as any).apiKey = '';
    });

    it('should call next() in development environment', () => {
      const { env } = require('../../../../../src/env');
      (env as any).isDevelopment = true;

      middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error in production environment', () => {
      const { env } = require('../../../../../src/env');
      (env as any).isDevelopment = false;

      expect(() => {
        middleware.use(mockRequest as express.Request, mockResponse as express.Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
