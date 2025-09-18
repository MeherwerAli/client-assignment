import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware, BadRequestError } from 'routing-controllers';
import Container, { Service } from 'typedi';
import { ValidationError } from 'class-validator';

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
    
    // Log the error for debugging
    console.log('Error object:', error);
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    
    let errors;
    
    // Handle routing-controllers BadRequestError specifically for validation errors
    if (error instanceof BadRequestError && error.message === 'Invalid body, check \'errors\' property for more info.') {
      // Extract validation errors from the errors property
      const validationErrors = (error as any).errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        const formattedErrors = this.formatValidationErrors(validationErrors);
        errors = formattedErrors;
      } else {
        errors = new ErrorResponse(error).get();
      }
    } else {
      errors = new ErrorResponse(error).get();
    }
    
    res.status(error.httpCode || StatusCodes.BAD_REQUEST);
    res.json({ errors });

    Container;
    next();
  }

  private formatValidationErrors(validationErrors: ValidationError[]): any[] {
    const formatted = [];
    
    for (const error of validationErrors) {
      if (error.constraints) {
        for (const constraintKey in error.constraints) {
          formatted.push({
            code: 'VALIDATION_ERROR',
            message: error.constraints[constraintKey],
            description: `Validation failed for property: ${error.property}`
          });
        }
      }
      
      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        formatted.push(...this.formatValidationErrors(error.children));
      }
    }
    
    return formatted.length > 0 ? formatted : [{
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      description: 'Request validation failed'
    }];
  }
}
