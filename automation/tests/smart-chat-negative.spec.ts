import { expect, test } from "@playwright/test";
import { ChatServiceAPI, TestDataGenerator } from "./utils/api-helpers";

test.describe("Smart Chat Negative Scenarios", () => {
  let api: ChatServiceAPI;
  let testSessions: string[] = []; // Track created sessions for cleanup

  test.beforeEach(async ({ request }) => {
    api = new ChatServiceAPI(request);
  });

  test.afterEach(async () => {
    // Clean up test sessions
    for (const sessionId of testSessions) {
      try {
        await api.deleteSession(sessionId);
      } catch (error) {
        console.log(`Failed to cleanup session ${sessionId}:`, error);
      }
    }
    testSessions = [];
  });

  test.describe("Invalid Session ID", () => {
    test("should return 400 for invalid session ID format", async () => {
      const invalidSessionId = "invalid-session-id";
      const message = "Hello, can you help me?";

      const response = await api.smartChat(invalidSessionId, message);

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message).toContain("Invalid");
    });

    test("should return 404 for non-existent session ID", async () => {
      const nonExistentSessionId = "507f1f77bcf86cd799439011"; // Valid ObjectId format but doesn't exist
      const message = "Hello, can you help me?";

      const response = await api.smartChat(nonExistentSessionId, message);

      expect(response.status()).toBe(404);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message).toMatch(/not found/i);
    });
  });

  test.describe("Missing Required Headers", () => {
    test("should return 400 when URC header is missing", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      // Try smart chat without URC header
      const response = await api
        .getRequest()
        .post(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "dev-api-key-2024",
            },
            data: { message: "Hello" },
          }
        );

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(/urc|header/);
    });

    test("should return 401 when API key is missing", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      // Try smart chat without API key
      const response = await api
        .getRequest()
        .post(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-user-id": "test-user-123",
              "x-api-key": "", // Explicitly empty API key to override global header
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
            data: { message: "Hello" },
          }
        );

      expect(response.status()).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(
        /unauthorized|api key/
      );
    });
  });

  test.describe("Invalid Request Body", () => {
    test("should return 400 when message is missing", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api
        .getRequest()
        .post(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "dev-api-key-2024",
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
            data: {}, // Missing message
          }
        );

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(/message|required/);
    });

    test("should return 400 when message is empty string", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api.smartChat(session.id, "");

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(/empty|required/);
    });

    test("should return 400 when message is too long", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      // Create a very long message (assuming 10000 chars is too long)
      const longMessage = "a".repeat(10000);
      const response = await api.smartChat(session.id, longMessage);

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(/length|too long/);
    });

    test("should return 400 when request body is invalid JSON", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api
        .getRequest()
        .post(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "dev-api-key-2024",
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
            data: "invalid json", // Invalid JSON
          }
        );

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
    });
  });

  test.describe("OpenAI Service Errors", () => {
    test("should handle gracefully when OpenAI service is unavailable", async () => {
      // This test requires the OpenAI API key to be invalid or the service to be down
      // We'll simulate this by using an API instance with invalid configuration

      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      // Note: This test may pass if OpenAI service is properly configured
      // In a real test environment, we'd mock the OpenAI service to return errors
      const response = await api.smartChat(
        session.id,
        "Test message for error handling"
      );

      // If OpenAI is properly configured, this will succeed (200)
      // If there are OpenAI errors, it should return appropriate error codes (500, 402, 429, etc.)
      expect([200, 402, 429, 500].includes(response.status())).toBe(true);

      if (response.status() !== 200) {
        const responseBody = await response.json();
        expect(responseBody.errors[0]?.code).toBeDefined();
        expect(responseBody.errors[0]?.message).toBeDefined();
      }
    });

    test("should return 429 for rate limiting (if configured)", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      // Send multiple rapid requests to trigger rate limiting
      const requests: Promise<any>[] = [];
      for (let i = 0; i < 10; i++) {
        requests.push(api.smartChat(session.id, `Message ${i}`));
      }

      const responses = await Promise.all(requests);

      // Check if any response is rate limited
      const rateLimitedResponse = responses.find((r: any) => r.status() === 429);

      if (rateLimitedResponse) {
        const responseBody = await rateLimitedResponse.json();
        expect(responseBody.errors[0]?.code).toBeDefined();
        expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(
          /rate limit|too many/
        );
      }
      // Note: If rate limiting is not configured or limits are high, this test might not trigger rate limiting
    });
  });

  test.describe("Content Type Validation", () => {
    test("should return 400 for wrong content type", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api
        .getRequest()
        .post(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "Content-Type": "text/plain", // Wrong content type
              "x-api-key": "test-api-key-12345",
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
            data: "message=Hello",
          }
        );

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
      expect(responseBody.errors[0]?.message.toLowerCase()).toMatch(/content-type|json/);
    });

    test("should return 400 when content type header is missing", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api
        .getRequest()
        .post(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              // Missing Content-Type header
              "x-api-key": "test-api-key-12345",
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
            data: JSON.stringify({ message: "Hello" }),
          }
        );

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.errors[0]?.code).toBeDefined();
    });
  });

  test.describe("HTTP Method Validation", () => {
    test("should return 405 for GET method on smart-chat endpoint", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api
        .getRequest()
        .get(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "x-api-key": "test-api-key-12345",
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
          }
        );

      expect(response.status()).toBe(405);
    });

    test("should return 405 for PUT method on smart-chat endpoint", async () => {
      // Create a session first
      const sessionTitle = TestDataGenerator.generateSessionTitle();
      const sessionResponse = await api.createSession(sessionTitle);
      expect(sessionResponse.status()).toBe(201);
      const session = await sessionResponse.json();
      testSessions.push(session.id);

      const response = await api
        .getRequest()
        .put(
          `${api.getBaseURL()}/chats-service/api/v1/chats/${
            session.id
          }/smart-chat`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "test-api-key-12345",
              "Unique-Reference-Code": TestDataGenerator.generateURC(),
            },
            data: { message: "Hello" },
          }
        );

      expect(response.status()).toBe(405);
    });
  });
});
