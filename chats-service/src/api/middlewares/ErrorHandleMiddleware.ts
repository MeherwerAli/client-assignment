import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import Container, { Service } from 'typedi';

import { env } from '../../env';
import { Logger } from '../../lib/logger';
import { ErrorResponse } from '../errors/ErrorResponse';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  public isProduction = env.isProduction;
  private log = new Logger(__filename);

  constructor() {}

  public error(error: HttpError, req: express.Request, res: express.Response, next: express.NextFunction): void {
    const logMessage = `ErrorHandleMiddleware, error, urc: ${req.headers['Unique-Reference-Code']}`;
    this.log.info(`${logMessage}, method ${req.method}, url ${req.url}`);
    console.log(error);
    const errors = new ErrorResponse(error).get();
    res.status(error.httpCode || StatusCodes.BAD_REQUEST);
    res.json({ errors });

    Container;
    next();
  }
}
