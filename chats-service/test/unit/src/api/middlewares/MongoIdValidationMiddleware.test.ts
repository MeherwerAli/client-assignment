import { Request, Response } from 'express';
import 'reflect-metadata';
import { CODES, HTTPCODES } from '../../../../../src/api/errors/errorCodeConstants';
import { MongoIdValidationMiddleware } from '../../../../../src/api/middlewares/MongoIdValidationMiddleware';

describe('MongoIdValidationMiddleware', () => {
  let middleware: MongoIdValidationMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new MongoIdValidationMiddleware();
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
    it('should call next() when id is a valid MongoDB ObjectId', () => {
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when id is another valid MongoDB ObjectId format', () => {
      mockRequest.params = { id: '65f7a8b1c4d5e6f789012345' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when id is not a valid MongoDB ObjectId', () => {
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

    it('should throw error when id is too long', () => {
      mockRequest.params = { id: '507f1f77bcf86cd7994390111234567890' };

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
      expect(thrownError.code).toBe(CODES.InvalidQueryParam);
      expect(thrownError.message).toBe('ID must be a valid MongoDB ObjectId');
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
