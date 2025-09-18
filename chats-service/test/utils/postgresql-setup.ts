import { DataSource } from 'typeorm';
import { ChatSession } from '../../src/api/entities/ChatSession';
import { ChatMessage } from '../../src/api/entities/ChatMessage';

export class PostgreSQLSetup {
  private static testDataSource: DataSource;

  /**
   * Get test database configuration
   */
  private static getTestDataSource(): DataSource {
    if (!this.testDataSource) {
      this.testDataSource = new DataSource({
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        username: process.env.TEST_DB_USERNAME || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'password',
        database: process.env.TEST_DB_NAME || 'chats_test_db',
        entities: [ChatSession, ChatMessage],
        synchronize: true, // Auto-create tables for tests
        dropSchema: false, // Don't drop schema automatically
        logging: false, // Disable logging for tests
        ssl: false
      });
    }
    return this.testDataSource;
  }

  /**
   * Initialize test database
   */
  static async initializeDatabase(): Promise<void> {
    try {
      const dataSource = this.getTestDataSource();
      
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
        console.log('✅ Test database connection established');
      }

      // Clear existing data
      await this.cleanupDatabase();

      // Create test data
      await this.seedTestData();
      
      console.log('✅ Test database initialized with seed data');
    } catch (error) {
      console.error('❌ Failed to initialize test database:', error);
      throw error;
    }
  }

  /**
   * Clean up test database
   */
  static async cleanupDatabase(): Promise<void> {
    try {
      const dataSource = this.getTestDataSource();
      
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      // Clear all tables in proper order (messages first due to foreign key)
      await dataSource.query('DELETE FROM chat_messages');
      await dataSource.query('DELETE FROM chat_sessions');
      
      console.log('✅ Test database cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup test database:', error);
      throw error;
    }
  }

  /**
   * Check database connection
   */
  static async checkConnection(): Promise<void> {
    try {
      const dataSource = this.getTestDataSource();
      
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      // Simple query to verify connection
      await dataSource.query('SELECT 1');
      console.log('✅ Test database connection is healthy');
    } catch (error) {
      console.error('❌ Test database connection failed:', error);
      throw error;
    }
  }

  /**
   * Seed test data
   */
  static async seedTestData(): Promise<void> {
    try {
      const dataSource = this.getTestDataSource();
      
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      const sessionRepository = dataSource.getRepository(ChatSession);
      const messageRepository = dataSource.getRepository(ChatMessage);

      // Create test sessions (don't specify id, let it auto-generate)
      const testSession1 = sessionRepository.create({
        title: 'Test Chat Session 1',
        userId: 'test-user-1',
        isFavorite: false
      });

      const testSession2 = sessionRepository.create({
        title: 'Test Chat Session 2',
        userId: 'test-user-1',
        isFavorite: true
      });

      const testSession3 = sessionRepository.create({
        title: 'Another User Session',
        userId: 'test-user-2',
        isFavorite: false
      });

      const savedSessions = await sessionRepository.save([testSession1, testSession2, testSession3]);

      // Create test messages
      const testMessages = [
        messageRepository.create({
          sessionId: savedSessions[0].id,
          sender: 'user',
          content: 'Hello, this is a test message',
          context: null,
          session: savedSessions[0]
        }),
        messageRepository.create({
          sessionId: savedSessions[0].id,
          sender: 'assistant',
          content: 'Hello! How can I help you today?',
          context: null,
          session: savedSessions[0]
        }),
        messageRepository.create({
          sessionId: savedSessions[1].id,
          sender: 'user',
          content: 'Can you help me with coding?',
          context: { language: 'typescript' },
          session: savedSessions[1]
        }),
        messageRepository.create({
          sessionId: savedSessions[1].id,
          sender: 'assistant',
          content: 'Of course! I can help you with TypeScript coding.',
          context: null,
          session: savedSessions[1]
        })
      ];

      await messageRepository.save(testMessages);

      console.log('✅ Test data seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed test data:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  static async closeConnection(): Promise<void> {
    try {
      const dataSource = this.getTestDataSource();
      
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        console.log('✅ Test database connection closed');
      }
    } catch (error) {
      console.error('❌ Failed to close test database connection:', error);
      throw error;
    }
  }

  /**
   * Reset database (cleanup + seed)
   */
  static async resetDatabase(): Promise<void> {
    await this.cleanupDatabase();
    await this.seedTestData();
  }

  /**
   * Get test data source instance for direct access in tests
   */
  static getDataSource(): DataSource {
    return this.getTestDataSource();
  }
}
