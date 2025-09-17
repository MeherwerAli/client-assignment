import express from 'express';

import { env } from '../env';

export const homeLoader = () => {
  const expressApp = express();
  expressApp.get(env.app.routePrefix, (req: express.Request, res: express.Response) => {
    return res.json({
      name: env.app.name,
      version: env.app.version,
      description: env.app.description
    });
  });
};
homeLoader();
