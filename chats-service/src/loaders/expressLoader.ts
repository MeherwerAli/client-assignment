import { Application } from 'express';
import rateLimit from 'express-rate-limit';
import { useExpressServer } from 'routing-controllers';
import express from 'express';
import cors from 'cors';

import { env } from '../env';

export const expressLoader = () => {
  // Create Express app first
  const expressApp: Application = express();

  // Add CORS
  expressApp.use(cors({
    origin: env.app.corsOrigin === '*' ? true : env.app.corsOrigin
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.app.rateWindowMs,
    max: env.app.rateMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  expressApp.use(limiter);

  // Global pre-routing middleware for all API routes - this runs BEFORE routing-controllers
  expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Only apply to chat service API routes - check if path contains chats
    if (!req.path.includes('/chats')) {
      return next();
    }

    const method = req.method;
    const path = req.path;

    // 1. Method validation FIRST - before API key to ensure 405 takes precedence
    const allowedMethods = new Map<string, string[]>([
      ['/v1/chats', ['GET', 'POST']],
      ['/v1/chats/:id', ['GET', 'DELETE', 'PATCH']],
      ['/v1/chats/:id/favorite', ['PATCH']],
      ['/v1/chats/:id/messages', ['GET', 'POST']],
      ['/v1/chats/:id/smart-chat', ['POST']],
    ]);

    // Normalize path for pattern matching - handle both with and without route prefix
    let routePattern = path;
    // Remove any route prefix to get the controller-level path
    routePattern = routePattern.replace(/^\/chats-service\/api/, '');
    routePattern = routePattern.replace(/\/v1\/chats\/[a-fA-F0-9]{24}/, '/v1/chats/:id');
    
    const allowedMethodsForRoute = allowedMethods.get(routePattern);
    if (allowedMethodsForRoute && !allowedMethodsForRoute.includes(method)) {
      return res.status(405).json({
        errors: [{
          code: 'CHATS_SERVICE.InvalidQueryParam',
          message: `Method ${method} not allowed for this endpoint. Allowed methods: ${allowedMethodsForRoute.join(', ')}`,
          description: 'HTTP method not supported for this endpoint'
        }]
      });
    }

    // 2. Content-Type validation SECOND - before API key  
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = req.headers['content-type'];
      
      if (!contentType) {
        return res.status(400).json({
          errors: [{
            code: 'CHATS_SERVICE.EmptyContentType',
            message: 'Content-Type header is required for this request',
            description: 'Content-Type header must be provided for requests with body'
          }]
        });
      }
      
      if (!contentType.includes('application/json')) {
        return res.status(400).json({
          errors: [{
            code: 'CHATS_SERVICE.InvalidContentType',
            message: 'Content-Type must be application/json',
            description: 'Only application/json content type is supported'
          }]
        });
      }
    }

    // 3. API Key validation LAST - lowest precedence
    const apiKeyHeader = (req.header('x-api-key') || '').trim();
    const expected = env.app.apiKey;

    if (!apiKeyHeader || apiKeyHeader !== expected) {
      return res.status(401).json({
        errors: [{
          code: 'CHATS_SERVICE.NotAuthorized',
          message: 'API key is required',
          description: 'Valid API key must be provided in x-api-key header'
        }]
      });
    }

    return next();
  });

  // Configure routing-controllers on the existing Express app
  useExpressServer(expressApp, {
    classTransformer: true,
    routePrefix: env.app.routePrefix,
    defaultErrorHandler: false,
    controllers: env.app.dirs.controllers,
    middlewares: env.app.dirs.middlewares,
    interceptors: env.app.dirs.interceptors
  });

  if (!env.isTest) {
    expressApp.listen(env.app.port);
  }
};
expressLoader();
