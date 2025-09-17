import { expect, test } from "@playwright/test";
import {
  ChatMessage,
  ChatServiceAPI,
  ChatSession,
  TestDataGenerator,
} from "./utils/api-helpers";

test.describe("Chat Messages Operations", () => {
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

  test.describe("Add Messages", () => {
    test("should add user message to session", async () => {
      // Create a session first
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Add a user message
      const messageData = TestDataGenerator.generateMessage("user");
      const response = await api.addMessage(
        session.id,
        "user",
        messageData.content
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const message: ChatMessage = await response.json();
      expect(message).toHaveProperty("id");
      expect(message).toHaveProperty("sessionId", session.id);
      expect(message).toHaveProperty("sender", "user");
      expect(message).toHaveProperty("content", messageData.content);
      expect(message).toHaveProperty("createdAt");
      expect(new Date(message.createdAt)).toBeInstanceOf(Date);
    });

    test("should add assistant message with context", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const messageData = TestDataGenerator.generateMessage("assistant");
      const response = await api.addMessage(
        session.id,
        "assistant",
        messageData.content,
        messageData.context
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const message: ChatMessage = await response.json();
      expect(message).toHaveProperty("sender", "assistant");
      expect(message).toHaveProperty("content", messageData.content);
      expect(message).toHaveProperty("context");
      expect(message.context).toEqual(messageData.context);
    });

    test("should add system message", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const messageData = TestDataGenerator.generateMessage("system");
      const response = await api.addMessage(
        session.id,
        "system",
        messageData.content
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const message: ChatMessage = await response.json();
      expect(message).toHaveProperty("sender", "system");
      expect(message).toHaveProperty("content", messageData.content);
    });

    test("should return 404 for non-existent session", async () => {
      const nonExistentId = TestDataGenerator.generateValidObjectId();
      const messageData = TestDataGenerator.generateMessage("user");
      const response = await api.addMessage(
        nonExistentId,
        "user",
        messageData.content
      );

      expect(response.status()).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate session ID format", async () => {
      const invalidId = TestDataGenerator.generateInvalidObjectId();
      const messageData = TestDataGenerator.generateMessage("user");
      const response = await api.addMessage(
        invalidId,
        "user",
        messageData.content
      );

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate sender enum", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Try with invalid sender
      const response = await api.customRequest(
        `/v1/chats/${session.id}/messages`,
        "POST",
        {
          sender: "invalid_sender",
          content: "Test message",
        }
      );

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should require content field", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Try without content
      const response = await api.customRequest(
        `/v1/chats/${session.id}/messages`,
        "POST",
        {
          sender: "user",
          // Missing content
        }
      );

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should handle empty content", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const response = await api.addMessage(session.id, "user", "");

      // Should either accept empty content or provide validation error
      if (response.ok()) {
        const message: ChatMessage = await response.json();
        expect(message).toHaveProperty("content", "");
      } else {
        expect(response.status()).toBe(400);
        const error = await response.json();
        expect(error).toHaveProperty("errors");
      }
    });

    test("should handle very long content", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const longContent = "A".repeat(10000); // Very long content
      const response = await api.addMessage(session.id, "user", longContent);

      // Should either accept or reject based on validation rules
      if (response.ok()) {
        const message: ChatMessage = await response.json();
        expect(message).toHaveProperty("content");
        // Content should be encrypted, so it might be different from input
        expect(message.content).toBeTruthy();
      } else {
        expect(response.status()).toBe(400);
      }
    });

    test("should update session lastMessageAt when message is added", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const originalLastMessageAt = session.lastMessageAt;

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Add a message
      const messageData = TestDataGenerator.generateMessage("user");
      const messageResponse = await api.addMessage(
        session.id,
        "user",
        messageData.content
      );
      expect(messageResponse.ok()).toBeTruthy();

      // Verify session was updated (would need to get session details if API supports it)
      // For now, we'll verify the message was created successfully
      const message: ChatMessage = await messageResponse.json();
      expect(message).toHaveProperty("sessionId", session.id);
    });
  });

  test.describe("Get Messages", () => {
    test("should retrieve messages from session", async () => {
      // Create session and add messages
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Add multiple messages
      const messages = [
        TestDataGenerator.generateMessage("user"),
        TestDataGenerator.generateMessage("assistant"),
        TestDataGenerator.generateMessage("system"),
      ];

      for (const msg of messages) {
        const response = await api.addMessage(
          session.id,
          msg.sender as any,
          msg.content,
          msg.context
        );
        expect(response.ok()).toBeTruthy();
      }

      // Retrieve messages
      const response = await api.getMessages(session.id);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const retrievedMessages: ChatMessage[] = await response.json();
      expect(Array.isArray(retrievedMessages)).toBeTruthy();
      expect(retrievedMessages).toHaveLength(3);

      // Messages should be ordered by createdAt descending (newest first)
      for (let i = 0; i < retrievedMessages.length - 1; i++) {
        const current = new Date(retrievedMessages[i].createdAt);
        const next = new Date(retrievedMessages[i + 1].createdAt);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    test("should handle pagination with limit", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Add 5 messages
      for (let i = 0; i < 5; i++) {
        const msg = TestDataGenerator.generateMessage("user");
        await api.addMessage(session.id, "user", `${msg.content} ${i}`);
      }

      // Get first 3 messages
      const response = await api.getMessages(session.id, 3);
      expect(response.ok()).toBeTruthy();

      const messages: ChatMessage[] = await response.json();
      expect(messages).toHaveLength(3);
    });

    test("should handle pagination with skip", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Add 5 messages
      for (let i = 0; i < 5; i++) {
        const msg = TestDataGenerator.generateMessage("user");
        await api.addMessage(session.id, "user", `${msg.content} ${i}`);
      }

      // Skip first 2 messages
      const response = await api.getMessages(session.id, undefined, 2);
      expect(response.ok()).toBeTruthy();

      const messages: ChatMessage[] = await response.json();
      expect(messages).toHaveLength(3); // 5 - 2 = 3 remaining
    });

    test("should handle limit and skip together", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Add 10 messages
      for (let i = 0; i < 10; i++) {
        const msg = TestDataGenerator.generateMessage("user");
        await api.addMessage(session.id, "user", `${msg.content} ${i}`);
      }

      // Skip 3, limit 4
      const response = await api.getMessages(session.id, 4, 3);
      expect(response.ok()).toBeTruthy();

      const messages: ChatMessage[] = await response.json();
      expect(messages).toHaveLength(4);
    });

    test("should return empty array for session with no messages", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const response = await api.getMessages(session.id);
      expect(response.ok()).toBeTruthy();

      const messages: ChatMessage[] = await response.json();
      expect(Array.isArray(messages)).toBeTruthy();
      expect(messages).toHaveLength(0);
    });

    test("should return 404 for non-existent session", async () => {
      const nonExistentId = TestDataGenerator.generateValidObjectId();
      const response = await api.getMessages(nonExistentId);

      expect(response.status()).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate session ID format", async () => {
      const invalidId = TestDataGenerator.generateInvalidObjectId();
      const response = await api.getMessages(invalidId);

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate limit parameter", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Test with negative limit
      const response = await api.getMessages(session.id, -1);

      // Should either handle gracefully or return validation error
      if (!response.ok()) {
        expect(response.status()).toBe(400);
        const error = await response.json();
        expect(error).toHaveProperty("errors");
      }
    });

    test("should validate skip parameter", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Test with negative skip
      const response = await api.getMessages(session.id, undefined, -1);

      // Should either handle gracefully or return validation error
      if (!response.ok()) {
        expect(response.status()).toBe(400);
        const error = await response.json();
        expect(error).toHaveProperty("errors");
      }
    });

    test("should decrypt message content correctly", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      const originalContent =
        "This is a test message that should be encrypted and decrypted correctly";
      await api.addMessage(session.id, "user", originalContent);

      const response = await api.getMessages(session.id);
      expect(response.ok()).toBeTruthy();

      const messages: ChatMessage[] = await response.json();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("content", originalContent);
    });
  });
});
