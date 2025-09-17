import { execSync } from 'child_process';
import path from 'path';

/**
 * MongoDB setup utilities for tests
 * Handles database initialization and cleanup for automation tests
 */

export class MongoDBSetup {
  private static readonly MONGO_SCRIPT_PATH = path.join(__dirname, '../../scripts/init-mongo.js');

  /**
   * Initialize MongoDB with collections, validators, and indexes
   * Should be called before running automation tests
   */
  static async initializeDatabase(): Promise<void> {
    try {
      console.log('🗄️  Initializing MongoDB for tests...');

      // Use the Docker MongoDB connection with authentication
      const mongoUrl = 'mongodb://admin:password123@localhost:27017/chat_storage?authSource=admin';

      // Build mongo command with authentication
      const mongoCommand = ['mongosh', `"${mongoUrl}"`, '--quiet', '--file', `"${this.MONGO_SCRIPT_PATH}"`].join(' ');

      // Execute the initialization script
      execSync(mongoCommand, {
        stdio: 'inherit',
        cwd: path.dirname(this.MONGO_SCRIPT_PATH)
      });

      console.log('✅ MongoDB initialization completed successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MongoDB:', error);
      throw new Error(`MongoDB initialization failed: ${error}`);
    }
  }

  /**
   * Clean up test data and reset database state
   * Should be called after running automation tests
   */
  static async cleanupDatabase(): Promise<void> {
    try {
      console.log('🧹 Cleaning up MongoDB test data...');

      const mongoUrl = 'mongodb://admin:password123@localhost:27017/chat_storage?authSource=admin';

      // JavaScript commands to clean up test data
      const cleanupScript = `
        db = db.getSiblingDB("chat_storage");
        
        // Drop test collections to clean state
        db.chatsessions.deleteMany({});
        db.chatmessages.deleteMany({});
        
        print("Database cleanup completed successfully!");
      `;

      // Create temporary cleanup script
      const tempScriptPath = path.join(__dirname, 'temp-cleanup.js');
      require('fs').writeFileSync(tempScriptPath, cleanupScript);

      try {
        const mongoCommand = ['mongosh', `"${mongoUrl}"`, '--quiet', '--file', `"${tempScriptPath}"`].join(' ');

        execSync(mongoCommand, {
          stdio: 'inherit',
          cwd: path.dirname(tempScriptPath)
        });

        console.log('✅ MongoDB cleanup completed successfully');
      } finally {
        // Clean up temporary script
        require('fs').unlinkSync(tempScriptPath);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup MongoDB:', error);
      throw new Error(`MongoDB cleanup failed: ${error}`);
    }
  }

  /**
   * Check if MongoDB is available and accessible
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const mongoUrl = 'mongodb://admin:password123@localhost:27017/chat_storage?authSource=admin';

      const testScript = `
        db = db.getSiblingDB("chat_storage");
        print("MongoDB connection test successful");
      `;

      const tempScriptPath = path.join(__dirname, 'temp-connection-test.js');
      require('fs').writeFileSync(tempScriptPath, testScript);

      try {
        const mongoCommand = ['mongosh', `"${mongoUrl}"`, '--quiet', '--file', `"${tempScriptPath}"`].join(' ');

        execSync(mongoCommand, {
          stdio: 'pipe',
          cwd: path.dirname(tempScriptPath)
        });

        return true;
      } finally {
        require('fs').unlinkSync(tempScriptPath);
      }
    } catch (error) {
      console.error('❌ MongoDB connection test failed:', error);
      return false;
    }
  }
}
