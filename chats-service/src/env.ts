import * as dotenv from 'dotenv';
import * as path from 'path';
import { toNumber } from './lib/env/utils';

import * as pkg from '../package.json';
import { getOsEnv, getOsPaths, getPaths, normalizePort, toBool } from './lib/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({ path: path.join(process.cwd(), `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`) });

/**
 * Environment variables
 */
export const env = {
  node: getOsEnv('NODE_ENV') || 'development',
  isProduction: getOsEnv('NODE_ENV') === 'production',
  isTest: getOsEnv('NODE_ENV') === 'test',
  isDevelopment: getOsEnv('NODE_ENV') === 'development',
  app: {
    name: getOsEnv('APP_NAME') || (pkg as any).name,
    version: (pkg as any).version,
    description: (pkg as any).description,
    host: getOsEnv('APP_HOST') || 'localhost',
    schema: getOsEnv('APP_SCHEMA') || 'http',
    routePrefix: getOsEnv('APP_ROUTE_PREFIX') || '/chats-service/api',
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT') || '3002'),
    banner: toBool(getOsEnv('APP_BANNER') || 'true'),
    apiKey: getOsEnv('API_KEY'),
    rateWindowMs: toNumber(getOsEnv('RATE_LIMIT_WINDOW_MS')) || 60000,
    rateMax: toNumber(getOsEnv('RATE_LIMIT_MAX')) || 60,
    corsOrigin: getOsEnv('CORS_ORIGIN') || '*',
    dirs: {
      controllers: getOsPaths('CONTROLLERS') || getPaths(['src/api/controllers/**/*Controller.ts']),
      middlewares: getOsPaths('MIDDLEWARES') || getPaths(['src/api/middlewares/*Middleware.ts']),
      interceptors: getOsPaths('INTERCEPTORS') || getPaths(['src/api/interceptors/**/*Interceptor.ts']),
      resolvers: getOsPaths('RESOLVERS') || getPaths(['src/api/resolvers/**/*Resolver.ts'])
    }
  },
  constants: {
    aesIVBase64: getOsEnv('AES_IV_BASE64') || 'AAAAAAAAAAAAAAAAAAAAAA==',
    encryption: {
      algorithm: getOsEnv('ENCRYPTION_ALGORITHM') || 'aes-256-cbc',
      key: getOsEnv('BASE64_ENCRYPTION_KEY') || 'MzVjNWM0NmIxZTQ5YjA2MzZmM2JhODQ0NjI4ZDYwODQ=',
      iv: getOsEnv('BASE64_ENCRYPTION_IV') || 'Nzg5MjM0NzM4NzRmOWIwZA=='
    }
  },
  log: {
    level: getOsEnv('LOG_LEVEL') || 'info',
    json: toBool(getOsEnv('LOG_JSON')) || false,
    output: getOsEnv('LOG_OUTPUT') || 'stdout'
  },
  db: {
    mongoURL: getOsEnv('MONGO_URL') || 'mongodb://127.0.0.1:27017/ChatDB'
  },
  monitor: {
    enabled: toBool(getOsEnv('MONITOR_ENABLED')),
    route: getOsEnv('MONITOR_ROUTE') || '/status',
    username: getOsEnv('MONITOR_USERNAME') || 'admin',
    password: getOsEnv('MONITOR_PASSWORD') || 'admin'
  },
  openai: {
    apiKey: getOsEnv('OPENAI_API_KEY'),
    model: getOsEnv('OPENAI_MODEL') || 'gpt-3.5-turbo',
    maxTokens: toNumber(getOsEnv('OPENAI_MAX_TOKENS')) || 1000,
    temperature: parseFloat(getOsEnv('OPENAI_TEMPERATURE') || '0.7'),
    baseURL: getOsEnv('OPENAI_BASE_URL') || 'https://api.openai.com/v1'
  },
  errors: {
    errorPrefix: getOsEnv('ERROR_CODE_PREFIX') || 'CHATS_SERVICE',
    default: {
      errorCode: getOsEnv('DEFAULT_ERROR_CODE') || 'GLOBAL.UNMAPPED-ERROR',
      errorMessage: getOsEnv('DEFAULT_ERROR_MSG') || 'Something went wrong, please try after sometime',
      errorDescription:
        getOsEnv('DEFAULT_ERROR_DESC') || 'Error is not mapped in the service, please check log for further info'
    }
  }
};
