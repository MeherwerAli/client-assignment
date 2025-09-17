import { createParamDecorator } from 'routing-controllers';
import { isMongoId } from 'class-validator';
import { CredError } from '../errors/CredError';
import { HTTPCODES, CODES } from '../errors/errorCodeConstants';

export function ValidatedParam(paramName: string, validation?: 'mongoId') {
  return createParamDecorator({
    value: (action, value) => {
      const paramValue = action.request.params[paramName];

      if (!paramValue) {
        throw new CredError(HTTPCODES.BAD_REQUEST, CODES.NotFound, `${paramName} is required`);
      }

      if (validation === 'mongoId' && !isMongoId(paramValue)) {
        throw new CredError(
          HTTPCODES.BAD_REQUEST,
          CODES.InvalidQueryParam,
          `${paramName} must be a valid MongoDB ObjectId`
        );
      }

      return paramValue;
    }
  });
}
