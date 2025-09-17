import { CODES } from './errorCodeConstants';

const errors: { [key: string]: { code: string; message?: string; description?: string } } = {
  [CODES.InvalidBody]: {
    code: 'GLOBAL.BODY_INVALID',
    message: 'Invalid Request Parameters',
    description: 'Invalid Request Parameters'
  },
  [CODES.NotAuthorized]: {
    code: 'AUTH.INVALID_API_KEY',
    message: 'Authentication failed: Incorrect Service Authentication Key',
    description: 'The provided API key is invalid. Please check your service authentication key.'
  },
  [CODES.GenericErrorMessage]: {
    code: 'GLOBAL.INTERVAL_SERVER_ERROR',
    message: 'There is some issue. Please contact administrator',
    description: 'There is some issue. Please contact administrator'
  },
  [CODES.NotFound]: {
    code: 'GLOBAL.NOT_FOUND',
    message: 'Not Found',
    description: 'Not Found'
  },
  [CODES.OpenAIError]: {
    code: 'OPENAI.GENERAL_ERROR',
    message: 'OpenAI service error',
    description: 'An error occurred while communicating with OpenAI service'
  },
  [CODES.OpenAIQuotaExceeded]: {
    code: 'OPENAI.QUOTA_EXCEEDED',
    message: 'OpenAI quota exceeded',
    description: 'OpenAI API quota has been exceeded. Please check your usage limits.'
  },
  [CODES.OpenAIInvalidRequest]: {
    code: 'OPENAI.INVALID_REQUEST',
    message: 'Invalid OpenAI request',
    description: 'The request to OpenAI service is invalid'
  },
  [CODES.OpenAIRateLimit]: {
    code: 'OPENAI.RATE_LIMIT',
    message: 'OpenAI rate limit exceeded',
    description: 'Too many requests to OpenAI service. Please try again later.'
  }
};

export const constantErrors = Object.assign({}, errors);
