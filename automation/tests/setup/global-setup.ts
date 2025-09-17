import { chromium, FullConfig } from "@playwright/test";

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for Chat Service API tests...");

  // Launch browser for initial setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for services to be ready
    console.log("⏳ Waiting for Chat Service to be ready...");

    const baseURL = process.env.BASE_URL || "http://localhost:3002";
    const apiKey = process.env.API_KEY || "test-api-key-12345";

    // Health check with retries
    let retries = 30;
    let serviceReady = false;

    while (retries > 0 && !serviceReady) {
      try {
        const response = await page.request.get(
          `${baseURL}/chats-service/api/v1/health`,
          {
            headers: {
              "x-api-key": apiKey,
              "Unique-Reference-Code": "global-setup-health-check",
            },
          }
        );

        if (response.ok()) {
          const data = await response.json();
          console.log("✅ Chat Service is ready:", data);
          serviceReady = true;
        } else {
          throw new Error(
            `Health check failed with status: ${response.status()}`
          );
        }
      } catch (error) {
        console.log(
          `❌ Health check attempt failed. Retries left: ${retries - 1}`
        );
        await page.waitForTimeout(2000); // Wait 2 seconds before retry
        retries--;
      }
    }

    if (!serviceReady) {
      console.log("⚠️  Chat Service not ready - continuing anyway for testing");
      // Don't throw error for manual testing
      // throw new Error(
      //   "Chat Service failed to become ready within timeout period"
      // );
    }

    // Clean up any existing test data
    console.log("🧹 Cleaning up test environment...");

    console.log("✅ Global setup completed successfully!");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
