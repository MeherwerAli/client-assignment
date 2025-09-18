import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Logger } from '../lib/logger';

const connectDB = async () => {
  const log = new Logger(__filename);
  try {
    await AppDataSource.initialize();
    const options = AppDataSource.options as any;
    log.info(
      `Successfully connected to PostgreSQL: ${options.host}:${options.port} database: ${options.database}`
    );
  } catch (error: any) {
    log.error('Could not connect to PostgreSQL: ', JSON.stringify(error, null, 2));
    log.error('Error name:', error.name);
    log.error('Error message:', error.message);
    log.error('Error stack:', error.stack);
    throw error;
  }
};

export default connectDB;
