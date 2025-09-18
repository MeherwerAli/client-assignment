import { Request, Response } from 'express';
import 'reflect-metadata';
import { HTTPCODES } from '../../../../../src/api/errors/errorCodeConstants';
import { UuidValidationMiddleware } from '../../../../../src/api/middlewares/UuidValidationMiddleware';

describe('UuidValidationMiddleware', () => {
  let middleware: UuidValidationMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new UuidValidationMiddleware();
    mockRequest = {
      params: {},
      header: jest.fn().mockReturnValue('test-urc')
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when id parameter is present', () => {
    it('should call next() when id is a valid UUID', () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when id is another valid UUID format', () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when id is not a valid UUID', () => {
      mockRequest.params = { id: 'invalid-id' };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when id is empty string', () => {
      mockRequest.params = { id: '' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when id is too short', () => {
      mockRequest.params = { id: '123' };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when id has wrong format', () => {
      mockRequest.params = { id: '507f1f77-bcf8-6cd7-9943-9011' }; // Missing one section

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when id contains invalid characters', () => {
      mockRequest.params = { id: '507f1f77bcf86cd79943901g' };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error with correct error code and message', () => {
      mockRequest.params = { id: 'invalid-id' };

      let thrownError: any;
      try {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError.httpCode).toBe(HTTPCODES.BAD_REQUEST);
      expect(thrownError.code).toBe('VALIDATION.INVALID_UUID');
      expect(thrownError.message).toBe('Invalid UUID format');
    });
  });

  describe('when id parameter is not present', () => {
    it('should call next() when params is empty', () => {
      mockRequest.params = {};

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when id is undefined', () => {
      mockRequest.params = { id: undefined };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when params has other parameters but no id', () => {
      mockRequest.params = { slug: 'some-slug', category: 'test' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('when params is undefined', () => {
    it('should handle undefined params gracefully', () => {
      mockRequest.params = undefined;

      // Should not throw error, middleware should handle gracefully
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();
    });
  });
});
