import { isUUID } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { constructLogMessage, isEmptyOrNull } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger/Logger';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Service()
@Middleware({ type: 'before' })
export class UuidValidationMiddleware implements ExpressMiddlewareInterface {
  private log = new Logger(__filename);

  use(request: Request, response: Response, next: NextFunction): void {
    const headers = { urc: (request.header('Unique-Reference-Code') as string) || 'unknown' };
    const logMessage = constructLogMessage(__filename, 'use', headers as any);
    this.log.info(logMessage);

    // Check if the route has an 'id' parameter that should be a UUID
    if (!isEmptyOrNull(request.params.id) && !isUUID(request.params.id)) {
      this.log.warn(`Invalid UUID provided: ${request.params.id}`);
      throw CredError.createError(HTTPCODES.BAD_REQUEST, CODES.InvalidQueryParam);
    }

    if (!isEmptyOrNull(request.params.id)) {
      this.log.debug(`Valid UUID validated: ${request.params.id}`);
    }

    next();
  }
}
