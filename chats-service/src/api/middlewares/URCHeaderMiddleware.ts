import * as express from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Container } from 'typedi';

import { Service } from 'typedi';
import { constructLogMessage, isEmptyOrNull } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger/Logger';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Service()
// @Middleware({ type: 'before' })
export class URCHeaderMiddleware implements ExpressMiddlewareInterface {
  private log = new Logger(__filename);

  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const headers = { urc: req.header('Unique-Reference-Code') || 'unknown' };
    const logMessage = constructLogMessage(__filename, 'use', headers as any);
    this.log.info(logMessage);

    const urc = (req.header('Unique-Reference-Code') || '').trim();
    if (isEmptyOrNull(urc)) {
      this.log.warn('Missing or empty Unique-Reference-Code header in request');
      throw new CredError(HTTPCODES.BAD_REQUEST, CODES.EmptyURC);
    }

    this.log.debug(`Setting Unique-Reference-Code header in response: ${urc}`);
    res.setHeader('Unique-Reference-Code', urc);

    Container.set('requestHeaders', req.headers);
    this.log.debug('Request headers stored in container for downstream usage');
    next();
  }
}
