#!/usr/bin/env ts-node

import { MongoDBSetup } from '../test/utils/mongodb-setup';

/**
 * Test script to verify MongoDB setup and cleanup functionality
 */

async function main() {
  try {
    console.log('🧪 Testing MongoDB setup utilities...\n');

    // Test connection
    console.log('1. Testing MongoDB connection...');
    const isConnected = await MongoDBSetup.checkConnection();
    if (!isConnected) {
      throw new Error('MongoDB connection test failed');
    }
    console.log('✅ Connection test passed\n');

    // Test initialization
    console.log('2. Testing database initialization...');
    await MongoDBSetup.initializeDatabase();
    console.log('✅ Initialization test passed\n');

    // Test cleanup
    console.log('3. Testing database cleanup...');
    await MongoDBSetup.cleanupDatabase();
    console.log('✅ Cleanup test passed\n');

    console.log('🎉 All MongoDB setup tests completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB setup test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  main();
}
