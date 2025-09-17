import { expect, test } from "@playwright/test";
import { ChatServiceAPI } from "./utils/api-helpers";

test.describe("Chat Service Health Check", () => {
  let api: ChatServiceAPI;

  test.beforeEach(async ({ request }) => {
    api = new ChatServiceAPI(request);
  });

  test("should return health status", async () => {
    const response = await api.healthCheck();

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("version");
    expect(typeof data.uptime).toBe("number");
    expect(data.uptime).toBeGreaterThan(0);
  });

  test("should handle health check without API key in development", async ({
    request,
  }) => {
    // Test without API key for development environment
    const response = await request.get(
      "http://localhost:3002/chats-service/api/v1/health",
      {
        headers: {
          "Unique-Reference-Code": "test-health-no-key",
        },
      }
    );

    // Should work in development, fail in production
    // Adjust based on your environment configuration
    if (process.env.NODE_ENV === "production") {
      expect(response.status()).toBe(401);
    } else {
      expect(response.ok()).toBeTruthy();
    }
  });
});
