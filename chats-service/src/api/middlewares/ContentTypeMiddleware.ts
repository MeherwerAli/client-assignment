import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import express from 'express';
import { CredError } from '../errors/CredError';
import { CODES } from '../errors/errorCodeConstants';

@Middleware({ type: 'before' })
export class ContentTypeMiddleware implements ExpressMiddlewareInterface {
  use(req: express.Request, res: express.Response, next: express.NextFunction): void {
    // Skip content-type validation for GET requests and health checks
    if (req.method === 'GET' || req.path.includes('/health')) {
      return next();
    }

    // For POST, PUT, PATCH requests that expect JSON
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      
      // Check if content-type header is missing
      if (!contentType) {
        throw new CredError(StatusCodes.BAD_REQUEST, CODES.EmptyContentType, 'Content-Type header is required for this request');
      }
      
      // Check if content-type is not JSON
      if (!contentType.includes('application/json')) {
        throw new CredError(StatusCodes.BAD_REQUEST, CODES.InvalidContentType, 'Content-Type must be application/json');
      }
    }

    next();
  }
}
