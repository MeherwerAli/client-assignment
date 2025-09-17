import { expect, test } from "@playwright/test";
import {
  ChatServiceAPI,
  ChatSession,
  TestDataGenerator,
} from "./utils/api-helpers";

test.describe("Chat Sessions CRUD Operations", () => {
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

  test.describe("Create Session", () => {
    test("should create session with title", async () => {
      const title = TestDataGenerator.generateSessionTitle();
      const response = await api.createSession(title);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const session: ChatSession = await response.json();
      testSessions.push(session.id);

      expect(session).toHaveProperty("id");
      expect(session).toHaveProperty("title", title);
      expect(session).toHaveProperty("isFavorite", false);
      expect(session).toHaveProperty("createdAt");
      expect(session).toHaveProperty("updatedAt");
      expect(new Date(session.createdAt)).toBeInstanceOf(Date);
    });

    test("should create session without title (default)", async () => {
      const response = await api.createSession();

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const session: ChatSession = await response.json();
      testSessions.push(session.id);

      expect(session).toHaveProperty("id");
      expect(session).toHaveProperty("title");
      expect(session.title).toBeTruthy(); // Should have some default title
      expect(session).toHaveProperty("isFavorite", false);
    });

    test("should handle empty title", async () => {
      const response = await api.createSession("");

      // Should either accept empty title or provide validation error
      if (response.ok()) {
        const session: ChatSession = await response.json();
        testSessions.push(session.id);
        expect(session).toHaveProperty("title");
      } else {
        expect(response.status()).toBe(400);
        const error = await response.json();
        expect(error).toHaveProperty("errors");
      }
    });

    test("should handle very long title", async () => {
      const longTitle = "A".repeat(1000); // Very long title
      const response = await api.createSession(longTitle);

      // Should either accept or reject based on validation rules
      if (response.ok()) {
        const session: ChatSession = await response.json();
        testSessions.push(session.id);
        expect(session).toHaveProperty("title");
      } else {
        expect(response.status()).toBe(400);
      }
    });
  });

  test.describe("Rename Session", () => {
    test("should rename existing session", async () => {
      // Create a session first
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Rename it
      const newTitle = TestDataGenerator.generateSessionTitle();
      const response = await api.renameSession(session.id, newTitle);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const updatedSession: ChatSession = await response.json();
      expect(updatedSession).toHaveProperty("title", newTitle);
      expect(updatedSession.id).toBe(session.id);
    });

    test("should return 404 for non-existent session", async () => {
      const nonExistentId = TestDataGenerator.generateValidObjectId();
      const response = await api.renameSession(nonExistentId, "New Title");

      expect(response.status()).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate session ID format", async () => {
      const invalidId = TestDataGenerator.generateInvalidObjectId();
      const response = await api.renameSession(invalidId, "New Title");

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should require title in request body", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Try to rename without title
      const response = await api.customRequest(
        `/v1/chats/${session.id}`,
        "PATCH",
        {}
      );

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });
  });

  test.describe("Toggle Favorite", () => {
    test("should mark session as favorite", async () => {
      // Create a session first
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Mark as favorite
      const response = await api.toggleFavorite(session.id, true);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const updatedSession: ChatSession = await response.json();
      expect(updatedSession).toHaveProperty("isFavorite", true);
      expect(updatedSession.id).toBe(session.id);
    });

    test("should unmark session as favorite", async () => {
      // Create and mark as favorite
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      await api.toggleFavorite(session.id, true);

      // Unmark as favorite
      const response = await api.toggleFavorite(session.id, false);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const updatedSession: ChatSession = await response.json();
      expect(updatedSession).toHaveProperty("isFavorite", false);
    });

    test("should return 404 for non-existent session", async () => {
      const nonExistentId = TestDataGenerator.generateValidObjectId();
      const response = await api.toggleFavorite(nonExistentId, true);

      expect(response.status()).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate boolean value for isFavorite", async () => {
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();
      testSessions.push(session.id);

      // Try with invalid boolean value
      const response = await api.customRequest(
        `/v1/chats/${session.id}/favorite`,
        "PATCH",
        { isFavorite: "invalid" }
      );

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });
  });

  test.describe("Delete Session", () => {
    test("should delete existing session", async () => {
      // Create a session first
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();

      // Delete it
      const response = await api.deleteSession(session.id);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      // Verify it's deleted by trying to rename it
      const verifyResponse = await api.renameSession(
        session.id,
        "Should not work"
      );
      expect(verifyResponse.status()).toBe(404);
    });

    test("should return 404 for non-existent session", async () => {
      const nonExistentId = TestDataGenerator.generateValidObjectId();
      const response = await api.deleteSession(nonExistentId);

      expect(response.status()).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should validate session ID format", async () => {
      const invalidId = TestDataGenerator.generateInvalidObjectId();
      const response = await api.deleteSession(invalidId);

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty("errors");
    });

    test("should cascade delete messages when session is deleted", async () => {
      // Create session and add messages
      const createResponse = await api.createSession(
        TestDataGenerator.generateSessionTitle()
      );
      const session: ChatSession = await createResponse.json();

      // Add some messages
      const message1 = TestDataGenerator.generateMessage("user");
      const message2 = TestDataGenerator.generateMessage("assistant");

      await api.addMessage(
        session.id,
        message1.sender as any,
        message1.content,
        message1.context
      );
      await api.addMessage(
        session.id,
        message2.sender as any,
        message2.content,
        message2.context
      );

      // Verify messages exist
      const messagesResponse = await api.getMessages(session.id);
      expect(messagesResponse.ok()).toBeTruthy();
      const messages = await messagesResponse.json();
      expect(Array.isArray(messages)).toBeTruthy();
      expect(messages.length).toBe(2);

      // Delete session
      const deleteResponse = await api.deleteSession(session.id);
      expect(deleteResponse.ok()).toBeTruthy();

      // Verify messages are also deleted
      const messagesAfterDelete = await api.getMessages(session.id);
      expect(messagesAfterDelete.status()).toBe(404); // Session not found
    });
  });
});
