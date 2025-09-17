import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Playwright configuration for Chat Service API testing
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["junit", { outputFile: "playwright-report/results.xml" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3002",
    extraHTTPHeaders: {
      "x-api-key": process.env.API_KEY || "test-api-key-12345",
      "Unique-Reference-Code": "automation-test-" + Date.now(),
    },
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chat-service-api",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Configure global setup and teardown */
  globalSetup: require.resolve("./tests/setup/global-setup.ts"),
  globalTeardown: require.resolve("./tests/setup/global-teardown.ts"),

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'cd ../chats-service && npm run serve',
  //   port: 3002,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
