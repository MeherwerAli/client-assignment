import { CODES, HTTPCODES } from '../../../../../src/api/errors/errorCodeConstants';

describe('errorCodeConstants', () => {
  it('should have correct HTTPCODES', () => {
    const expectedHttpCodes = {
      SUCCESS: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      NOT_FOUND: 404,
      TOO_MANY_REQUEST: 429,
      TOO_MANY_REQUESTS: 429,
      PAYMENT_REQUIRED: 402,
      INTERNAL_SERVER_ERROR: 500,
      BAD_GATEWAY: 502,
      SERVICE_UNAVAILABLE: 503
    };
    expect(HTTPCODES).toEqual(expectedHttpCodes);
  });

  it('should have correct CODES', () => {
    const expectedCodes = {
      EmptyAuthorization: 'EmptyAuthorization',
      EmptyContentType: 'EmptyContentType',
      EmptyURC: 'EmptyURC',
      GenericErrorMessage: 'GenericErrorMessage',
      InvalidBody: 'InvalidBody',
      InvalidContentType: 'InvalidContentType',
      InvalidQueryParam: 'InvalidQueryParam',
      InvalidURC: 'InvalidURC',
      InvalidUserId: 'InvalidUserId',
      MissingUserId: 'MissingUserId',
      NotAuthorized: 'NotAuthorized',
      NotFound: 'NotFound',
      OpenAIError: 'OpenAIError',
      OpenAIInvalidRequest: 'OpenAIInvalidRequest',
      OpenAIQuotaExceeded: 'OpenAIQuotaExceeded',
      OpenAIRateLimit: 'OpenAIRateLimit'
    };
    expect(CODES).toEqual(expectedCodes);
  });
});
