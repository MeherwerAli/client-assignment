import * as express from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Container } from 'typedi';

import { Service } from 'typedi';
import { Error } from '../errors/Error';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

@Service()
// @Middleware({ type: 'before' }) // Removed global middleware - not needed for chat service
export class HeaderMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const authorizeHeader = (req.header('Authorization') || '').trim();
    if (!authorizeHeader) {
      throw new Error(HTTPCODES.BAD_REQUEST, CODES.EmptyAuthorization);
    }
    if (authorizeHeader.indexOf('Bearer') < 0) {
      throw new Error(HTTPCODES.BAD_REQUEST, CODES.NotAuthorized);
    }

    const urc = (req.header('Unique-Reference-Code') || '').trim();
    if (!urc) {
      throw new Error(HTTPCODES.BAD_REQUEST, CODES.EmptyURC);
    }
    res.setHeader('Unique-Reference-Code', urc);

    Container.set('requestHeaders', req.headers);
    next();
  }
}
