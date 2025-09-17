import { FullConfig } from "@playwright/test";

/**
 * Global teardown for Playwright tests
 * This runs once after all tests
 */
async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global teardown for Chat Service API tests...");

  try {
    // Clean up test data if needed
    console.log("🗑️ Cleaning up test data...");

    // Add any cleanup logic here
    // For example, truncate test collections, reset database state, etc.

    console.log("✅ Global teardown completed successfully!");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
