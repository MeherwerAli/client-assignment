import { createParamDecorator } from 'routing-controllers';
import { isUUID } from 'class-validator';
import { CredError } from '../errors/CredError';
import { HTTPCODES, CODES } from '../errors/errorCodeConstants';

export function ValidatedParam(paramName: string, validation?: 'uuid') {
  return createParamDecorator({
    value: (action, value) => {
      const paramValue = action.request.params[paramName];

      if (!paramValue) {
        throw new CredError(HTTPCODES.BAD_REQUEST, CODES.NotFound, `${paramName} is required`);
      }

      if (validation === 'uuid' && !isUUID(paramValue)) {
        throw new CredError(
          HTTPCODES.BAD_REQUEST,
          CODES.InvalidQueryParam,
          `${paramName} must be a valid UUID`
        );
      }

      return paramValue;
    }
  });
}
