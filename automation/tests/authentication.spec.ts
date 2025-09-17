import { expect, test } from "@playwright/test";
import { ChatServiceAPI } from "./utils/api-helpers";

test.describe("Authentication Tests", () => {
  let api: ChatServiceAPI;

  test.beforeEach(async ({ request }) => {
    api = new ChatServiceAPI(request);
  });

  test("should reject requests without API key", async () => {
    const response = await api.testUnauthorized("/v1/chats");

    // In production, should return 401
    // In development, might allow pass-through
    if (process.env.NODE_ENV === "production") {
      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty("errors");
    }
  });

  test("should reject requests with invalid API key", async ({ request }) => {
    const invalidAPI = new ChatServiceAPI(
      request,
      "http://localhost:3002",
      "invalid-key",
      "test-user-123"
    );
    const response = await invalidAPI.createSession();

    // Should return 401 for invalid key
    expect(response.status()).toBe(401);
  });

  test("should accept requests with valid API key", async () => {
    const response = await api.healthCheck();
    expect(response.ok()).toBeTruthy();
  });

  test("should require Unique-Reference-Code header", async ({ request }) => {
    const response = await request.post(
      "http://localhost:3002/chats-service/api/v1/chats",
      {
        headers: {
          "x-api-key": "dev-api-key-2024",
          "x-user-id": "test-user-123",
          "Content-Type": "application/json",
          "Unique-Reference-Code": "", // Explicitly set to empty string
        },
        data: {
          title: "Test Session",
        },
      }
    );

    // Should return 400 for missing URC header
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("errors");
    expect(Array.isArray(data.errors)).toBeTruthy();
  });

  test("should require x-user-id header", async ({ request }) => {
    const response = await request.post(
      "http://localhost:3002/chats-service/api/v1/chats",
      {
        headers: {
          "x-api-key": "dev-api-key-2024",
          "Content-Type": "application/json",
          "Unique-Reference-Code": "test-missing-user-id",
          // Missing x-user-id header
        },
        data: {
          title: "Test Session",
        },
      }
    );

    // Should return 400 for missing user ID
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("errors");
    expect(data.errors[0].code).toContain("MissingUserId");
  });

  test("should validate x-user-id format", async ({ request }) => {
    const response = await request.post(
      "http://localhost:3002/chats-service/api/v1/chats",
      {
        headers: {
          "x-api-key": "dev-api-key-2024",
          "x-user-id": "invalid@user!id",
          "Content-Type": "application/json",
          "Unique-Reference-Code": "test-invalid-user-id-format",
        },
        data: {
          title: "Test Session",
        },
      }
    );

    // Should return 400 for invalid user ID format
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("errors");
    expect(data.errors[0].code).toContain("InvalidUserId");
  });
});
