import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import express from 'express';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Middleware({ type: 'before' })
export class MethodValidationMiddleware implements ExpressMiddlewareInterface {
  
  private readonly allowedMethods = new Map<string, string[]>([
    // Chat sessions
    ['/v1/chats', ['GET', 'POST']],
    ['/v1/chats/:id', ['GET', 'DELETE', 'PATCH']],
    ['/v1/chats/:id/favorite', ['PATCH']],
    ['/v1/chats/:id/messages', ['GET', 'POST']],
    ['/v1/chats/:id/smart-chat', ['POST']],
    // Health check
    ['/v1/health', ['GET']],
  ]);

  use(req: express.Request, res: express.Response, next: express.NextFunction): void {
    // Skip validation for health endpoint
    if (req.path === '/v1/health') {
      return next();
    }

    const method = req.method;
    const path = req.path;

    // Check if this is a chat service path
    if (path.startsWith('/v1/chats')) {
      // Handle parameterized routes
      let routePattern = path;
      
      // Replace session IDs with :id parameter pattern
      routePattern = routePattern.replace(/\/v1\/chats\/[a-fA-F0-9]{24}/, '/v1/chats/:id');
      
      // Check allowed methods for this route
      const allowedMethods = this.allowedMethods.get(routePattern);
      
      if (allowedMethods && !allowedMethods.includes(method)) {
        throw new CredError(
          HTTPCODES.METHOD_NOT_ALLOWED, 
          CODES.InvalidQueryParam, 
          `Method ${method} not allowed for this endpoint. Allowed methods: ${allowedMethods.join(', ')}`
        );
      }
    }

    next();
  }
}
