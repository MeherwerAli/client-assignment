import { DataSource } from 'typeorm';
import { env } from '../env';
import { ChatSession } from '../api/entities/ChatSession';
import { ChatMessage } from '../api/entities/ChatMessage';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  synchronize: true, // Auto-create tables for local development
  logging: env.isProduction ? false : true,
  entities: [ChatSession, ChatMessage],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscribers/**/*.ts'],
  ssl: false, // Disable SSL for local development
});
