export const HTTPCODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  TOO_MANY_REQUEST: 429,
  TOO_MANY_REQUESTS: 429,
  PAYMENT_REQUIRED: 402,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

export const CODES = {
  InvalidBody: 'InvalidBody',
  EmptyContentType: 'EmptyContentType',
  InvalidContentType: 'InvalidContentType',
  EmptyAuthorization: 'EmptyAuthorization',
  NotAuthorized: 'NotAuthorized',
  EmptyURC: 'EmptyURC',
  InvalidURC: 'InvalidURC',
  InvalidQueryParam: 'InvalidQueryParam',
  MissingUserId: 'MissingUserId',
  InvalidUserId: 'InvalidUserId',
  GenericErrorMessage: 'GenericErrorMessage',
  NotFound: 'NotFound',
  OpenAIError: 'OpenAIError',
  OpenAIQuotaExceeded: 'OpenAIQuotaExceeded',
  OpenAIInvalidRequest: 'OpenAIInvalidRequest',
  OpenAIRateLimit: 'OpenAIRateLimit'
};
