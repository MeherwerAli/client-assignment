import { expect, test } from "@playwright/test";
import { ChatServiceAPI, TestDataGenerator } from "./utils/api-helpers";

test.describe("Error Handling and Edge Cases", () => {
  let api: ChatServiceAPI;

  test.beforeEach(async ({ request }) => {
    api = new ChatServiceAPI(request);
  });

  test.describe("Content-Type Validation", () => {
    test("should handle missing Content-Type header", async ({ request }) => {
      const response = await request.post("http://localhost:3002/chats-service/api/v1/chats", {
        headers: {
          "x-api-key": "dev-api-key-2024",
          "x-user-id": "test-user-123",
          "Unique-Reference-Code": "test-no-content-type",
          // Missing Content-Type header
        },
        data: JSON.stringify({ title: "Test" }),
      });

      // Should either accept or return appropriate error
      if (!response.ok()) {
        expect(response.status()).toBe(400);
      }
    });

    test("should handle invalid Content-Type", async ({ request }) => {
      const response = await request.post("http://localhost:3002/chats-service/api/v1/chats", {
        headers: {
          "Content-Type": "text/plain", // Invalid content type
          "x-api-key": "dev-api-key-2024",
          "Unique-Reference-Code": "test-invalid-content-type",
        },
        data: JSON.stringify({ name: "Test Session" }),
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe("JSON Parsing", () => {
    test("should handle malformed JSON", async ({ request }) => {
      const response = await request.post("http://localhost:3002/chats-service/api/v1/chats", {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dev-api-key-2024",
          "Unique-Reference-Code": "test-malformed-json",
        },
        data: "{ invalid json }",
      });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should handle empty request body where body is required", async ({
      request,
    }) => {
      const response = await request.patch(
        "http://localhost:3002/chats-service/api/v1/chats/507f1f77bcf86cd799439011",
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "dev-api-key-2024",
            "Unique-Reference-Code": "test-empty-body",
          },
          // No data provided
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("Large Payloads", () => {
    test("should handle large session title", async () => {
      const largeTitle = "A".repeat(1000);
      const response = await api.createSession(largeTitle);

      // Should either accept or reject based on validation
      if (!response.ok()) {
        expect(response.status()).toBe(400);
        const error = await response.json();
        expect(error).toHaveProperty("errors");
      }
    });

    test("should handle large message content", async () => {
      // Create session first
      const createResponse = await api.createSession("Test Session");
      if (!createResponse.ok()) {
        test.skip();
        return;
      }

      const session = await createResponse.json();

      const largeContent = "A".repeat(50000); // 50KB content
      const response = await api.addMessage(session.id, "user", largeContent);

      // Should either accept or reject based on limits
      if (!response.ok()) {
        expect(response.status()).toBe(400);
      } else {
        // Clean up
        await api.deleteSession(session.id);
      }
    });

    test("should handle large context object", async () => {
      const createResponse = await api.createSession("Test Session");
      if (!createResponse.ok()) {
        test.skip();
        return;
      }

      const session = await createResponse.json();

      // Create large context object
      const largeContext = {
        data: "A".repeat(10000),
        metadata: {
          nested: {
            deep: {
              property: "B".repeat(5000),
            },
          },
        },
        array: new Array(1000).fill("item"),
      };

      const response = await api.addMessage(
        session.id,
        "assistant",
        "Test message",
        largeContext
      );

      // Should either accept or reject based on limits
      if (!response.ok()) {
        expect(response.status()).toBe(400);
      } else {
        // Clean up
        await api.deleteSession(session.id);
      }
    });
  });

  test.describe("Concurrent Operations", () => {
    test("should handle concurrent session creation", async () => {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(api.createSession(`Concurrent Session ${i}`));
      }

      const responses = await Promise.all(promises);
      const sessions: any[] = [];

      // All should succeed
      responses.forEach((response: any) => {
        expect(response.ok()).toBeTruthy();
      });

      // Get session data for cleanup
      for (const response of responses) {
        if ((response as any).ok()) {
          sessions.push(await (response as any).json());
        }
      }

      // Cleanup
      for (const session of sessions) {
        try {
          await api.deleteSession(session.id);
        } catch (error) {
          console.log(`Cleanup failed for session ${session.id}`);
        }
      }
    });

    test("should handle concurrent message additions to same session", async () => {
      // Create session first
      const createResponse = await api.createSession(
        "Concurrent Messages Test"
      );
      expect(createResponse.ok()).toBeTruthy();
      const session = await createResponse.json();

      // Add multiple messages concurrently
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 10; i++) {
        const messageData = TestDataGenerator.generateMessage("user");
        promises.push(
          api.addMessage(session.id, "user", `${messageData.content} ${i}`)
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach((response: any) => {
        expect(response.ok()).toBeTruthy();
      });

      // Verify all messages were added
      const messagesResponse = await api.getMessages(session.id);
      expect(messagesResponse.ok()).toBeTruthy();
      const messages = await messagesResponse.json();
      expect(messages).toHaveLength(10);

      // Cleanup
      await api.deleteSession(session.id);
    });
  });

  test.describe("Special Characters and Encoding", () => {
    test("should handle Unicode characters in session title", async () => {
      const unicodeTitle = "测试会话 🚀 émojis ànd spëcial çhars";
      const response = await api.createSession(unicodeTitle);

      expect(response.ok()).toBeTruthy();
      const session = await response.json();
      expect(session.title).toBe(unicodeTitle);

      // Cleanup
      await api.deleteSession(session.id);
    });

    test("should handle Unicode characters in message content", async () => {
      const createResponse = await api.createSession("Unicode Test");
      expect(createResponse.ok()).toBeTruthy();
      const session = await createResponse.json();

      const unicodeContent =
        "Hello! 👋 This message contains émojis 🎉, special chars àáâãäå, and 中文字符";
      const response = await api.addMessage(
        session.id,
        "user",
        unicodeContent
      );

      expect(response.ok()).toBeTruthy();
      const message = await response.json();
      expect(message.content).toBe(unicodeContent);

      // Verify through retrieval
      const messagesResponse = await api.getMessages(session.id);
      expect(messagesResponse.ok()).toBeTruthy();
      const messages = await messagesResponse.json();
      expect(messages[0].content).toBe(unicodeContent);

      // Cleanup
      await api.deleteSession(session.id);
    });

    test("should handle special JSON characters", async () => {
      const createResponse = await api.createSession("Special Characters Test");
      expect(createResponse.ok()).toBeTruthy();
      const session = await createResponse.json();

      const specialContent =
        'Content with "quotes", \\backslashes\\ and \nnewlines\n and \ttabs\t';
      const response = await api.addMessage(
        session.id,
        "user",
        specialContent
      );

      expect(response.ok()).toBeTruthy();
      const message = await response.json();
      expect(message.content).toBe(specialContent);

      // Cleanup
      await api.deleteSession(session.id);
    });
  });

  test.describe("Database Connection Resilience", () => {
    test("should handle service availability gracefully", async () => {
      // Test basic connectivity
      const response = await api.healthCheck();

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty("status");
      } else {
        // If service is down, should get appropriate error
        expect([503, 500]).toContain(response.status());
      }
    });
  });

  test.describe("HTTP Methods Validation", () => {
    test("should reject unsupported HTTP methods", async ({ request }) => {
      // Try OPTIONS on create endpoint
      const response = await request.fetch("http://localhost:3002/chats-service/api/v1/chats", {
        method: "OPTIONS",
        headers: {
          "x-api-key": "dev-api-key-2024",
          "Unique-Reference-Code": "test-options",
        },
      });

      // Should either support OPTIONS (for CORS) or return 405 Method Not Allowed
      if (!response.ok()) {
        expect([405, 501]).toContain(response.status());
      }
    });

    test("should reject PUT method on endpoints that don't support it", async ({
      request,
    }) => {
      const response = await request.put("http://localhost:3002/chats-service/api/v1/chats", {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dev-api-key-2024",
          "Unique-Reference-Code": "test-put",
        },
        data: JSON.stringify({ title: "Test" }),
      });

      expect(response.status()).toBe(405); // Method Not Allowed
    });
  });
});
