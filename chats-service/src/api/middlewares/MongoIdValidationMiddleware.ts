import { isMongoId } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { constructLogMessage, isEmptyOrNull } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger/Logger';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Service()
@Middleware({ type: 'before' })
export class MongoIdValidationMiddleware implements ExpressMiddlewareInterface {
  private log = new Logger(__filename);

  use(request: Request, response: Response, next: NextFunction): void {
    const headers = { urc: (request.header('Unique-Reference-Code') as string) || 'unknown' };
    const logMessage = constructLogMessage(__filename, 'use', headers as any);
    this.log.info(logMessage);

    // Check if the route has an 'id' parameter that should be a MongoDB ObjectId
    if (!isEmptyOrNull(request.params.id) && !isMongoId(request.params.id)) {
      this.log.warn(`Invalid MongoDB ObjectId provided: ${request.params.id}`);
      throw new CredError(HTTPCODES.BAD_REQUEST, CODES.InvalidQueryParam, 'Invalid session ID format - must be a valid MongoDB ObjectId');
    }

    if (!isEmptyOrNull(request.params.id)) {
      this.log.debug(`Valid MongoDB ObjectId validated: ${request.params.id}`);
    }

    next();
  }
}
