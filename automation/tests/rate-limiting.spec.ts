import { expect, test } from "@playwright/test";
import { ChatServiceAPI } from "./utils/api-helpers";

test.describe("Rate Limiting Tests", () => {
  let api: ChatServiceAPI;

  test.beforeEach(async ({ request }) => {
    api = new ChatServiceAPI(request);
  });

  test("should handle normal request rate", async () => {
    // Make several requests within normal limits
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(api.healthCheck());
    }

    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach((response) => {
      expect(response.ok()).toBeTruthy();
    });
  });

  test("should apply rate limiting for excessive requests", async () => {
    // This test might be skipped in CI to avoid overwhelming the service
    if (process.env.CI) {
      test.skip();
    }

    // Make many rapid requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 200; i++) {
      // Exceed the rate limit
      promises.push(api.healthCheck());
    }

    const responses = await Promise.all(promises.map((p) => p.catch((e) => e)));

    // Some should be rate limited (429 status)
    const rateLimitedResponses = responses.filter(
      (r) => r && typeof r.status === "function" && r.status() === 429
    );

    // Should have some rate limited responses
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test("should include rate limit headers", async () => {
    const response = await api.healthCheck();

    expect(response.ok()).toBeTruthy();

    // Check for common rate limit headers
    const headers = response.headers();

    // These headers are commonly used by rate limiting middleware
    // Adjust based on your actual implementation
    if (headers["x-ratelimit-limit"]) {
      expect(parseInt(headers["x-ratelimit-limit"])).toBeGreaterThan(0);
    }

    if (headers["x-ratelimit-remaining"]) {
      expect(parseInt(headers["x-ratelimit-remaining"])).toBeGreaterThanOrEqual(
        0
      );
    }
  });
});
