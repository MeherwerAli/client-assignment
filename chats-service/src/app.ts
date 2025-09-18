import 'dotenv/config';
import 'reflect-metadata';

import './loaders/iocLoader';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import connectDB from './loaders/DBLoader';
import './loaders/homeLoader';
import { winstonLoader } from './loaders/winstonLoader';

const log = new Logger(__filename);

(async function initiateLoader() {
  try {
    await connectDB();
    await winstonLoader();
    
    // Only start Express server after database is connected
    await import('./loaders/expressLoader');
    
    banner(log);
  } catch (error: any) {
    log.error(`Error while initializing the app`, { error });
  }
})();
