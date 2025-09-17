import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { constructLogMessage } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Service()
@Middleware({ type: 'before' })
export class UserContextMiddleware implements ExpressMiddlewareInterface {
  private log = new Logger(__filename);

  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const headers = { urc: req.header('Unique-Reference-Code') || 'unknown' };
    const logMessage = constructLogMessage(__filename, 'use', headers as any);
    this.log.info(logMessage);

    // Skip user validation for health endpoint
    if (req.path === '/v1/health') {
      this.log.debug('Skipping user validation for health endpoint');
      next();
      return;
    }

    const userIdHeader = (req.header('x-user-id') || '').trim();

    // Check if user ID is missing or empty
    if (!userIdHeader || userIdHeader === '') {
      this.log.warn('Missing x-user-id header');
      throw new CredError(HTTPCODES.BAD_REQUEST, CODES.MissingUserId, 'x-user-id header is required');
    }

    // Validate user ID format (alphanumeric, underscore, hyphen)
    const userIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!userIdPattern.test(userIdHeader)) {
      this.log.warn(`Invalid user ID format: ${userIdHeader}`);
      throw new CredError(
        HTTPCODES.BAD_REQUEST,
        CODES.InvalidUserId,
        'x-user-id must contain only alphanumeric characters, underscores, and hyphens'
      );
    }

    // Validate user ID length (3-50 characters)
    if (userIdHeader.length < 3 || userIdHeader.length > 50) {
      this.log.warn(`Invalid user ID length: ${userIdHeader} (length: ${userIdHeader.length})`);
      throw new CredError(HTTPCODES.BAD_REQUEST, CODES.InvalidUserId, 'x-user-id must be between 3 and 50 characters');
    }

    // Attach user ID to request for use in controllers
    (req as any).userId = userIdHeader;
    this.log.debug(`Successfully validated user ID: ${userIdHeader}`);

    next();
  }
}
