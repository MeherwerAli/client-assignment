import { Application } from 'express';
import rateLimit from 'express-rate-limit';
import { createExpressServer } from 'routing-controllers';

import { env } from '../env';

export const expressLoader = () => {
  const expressApp: Application = createExpressServer({
    cors: {
      origin: env.app.corsOrigin === '*' ? true : env.app.corsOrigin
    },
    classTransformer: true,
    routePrefix: env.app.routePrefix,
    defaultErrorHandler: false,
    controllers: env.app.dirs.controllers,
    middlewares: env.app.dirs.middlewares,
    interceptors: env.app.dirs.interceptors
  });

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.app.rateWindowMs,
    max: env.app.rateMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  expressApp.use(limiter);

  if (!env.isTest) {
    expressApp.listen(env.app.port);
  }
};
expressLoader();
