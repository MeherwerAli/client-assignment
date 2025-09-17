import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { env } from '../../env';
import { constructLogMessage, isEmptyOrNull } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Service()
@Middleware({ type: 'before' })
export class APIKeyMiddleware implements ExpressMiddlewareInterface {
  private log = new Logger(__filename);

  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const headers = { urc: req.header('Unique-Reference-Code') || 'unknown' };
    const logMessage = constructLogMessage(__filename, 'use', headers as any);
    this.log.info(logMessage);

    // Skip API key validation for health endpoint
    if (req.path === '/v1/health') {
      this.log.debug('Skipping API key validation for health endpoint');
      next();
      return;
    }

    const apiKeyHeader = (req.header('x-api-key') || '').trim();
    const expected = env.app.apiKey;

    // If no API key configured, allow in development
    if (isEmptyOrNull(expected)) {
      if (env.isDevelopment) {
        this.log.warn('No API key configured, allowing access in development mode');
        next();
        return;
      }
      this.log.error('No API key configured in production environment');
      throw new CredError(HTTPCODES.UNAUTHORIZED, CODES.NotAuthorized);
    }

    if (isEmptyOrNull(apiKeyHeader) || apiKeyHeader !== expected) {
      this.log.warn('Invalid or missing API key in request');
      throw new CredError(HTTPCODES.UNAUTHORIZED, CODES.NotAuthorized);
    }

    this.log.debug('API key validation successful');
    next();
  }
}
