import { expect, test } from "@playwright/test";
import { ChatMessage, ChatServiceAPI, ChatSession } from "./utils/api-helpers";

test.describe("User Isolation Tests", () => {
  let user1API: ChatServiceAPI;
  let user2API: ChatServiceAPI;
  let testSessions: string[] = []; // Track created sessions for cleanup

  test.beforeEach(async ({ request }) => {
    user1API = new ChatServiceAPI(
      request,
      "http://localhost:3002",
      "dev-api-key-2024",
      "user1"
    );
    user2API = new ChatServiceAPI(
      request,
      "http://localhost:3002",
      "dev-api-key-2024",
      "user2"
    );
  });

  test.afterEach(async () => {
    // Clean up test sessions for both users
    for (const sessionId of testSessions) {
      try {
        await user1API.deleteSession(sessionId);
      } catch (error) {
        // Session might belong to user2 or already deleted
      }
      try {
        await user2API.deleteSession(sessionId);
      } catch (error) {
        // Session might belong to user1 or already deleted
      }
    }
    testSessions = [];
  });

  test.describe("Session Isolation", () => {
    test("users should only see their own sessions", async () => {
      // User1 creates a session
      const user1Response = await user1API.createSession("User1 Session");
      expect(user1Response.ok()).toBeTruthy();
      const user1Session: ChatSession = await user1Response.json();
      testSessions.push(user1Session.id);

      // User2 creates a session
      const user2Response = await user2API.createSession("User2 Session");
      expect(user2Response.ok()).toBeTruthy();
      const user2Session: ChatSession = await user2Response.json();
      testSessions.push(user2Session.id);

      // User1 should only see their session
      const user1SessionsResponse = await user1API.getUserSessions();
      expect(user1SessionsResponse.ok()).toBeTruthy();
      const user1Sessions: ChatSession[] = await user1SessionsResponse.json();

      expect(user1Sessions).toHaveLength(1);
      expect(user1Sessions[0].id).toBe(user1Session.id);
      expect(user1Sessions[0].title).toBe("User1 Session");
      expect(user1Sessions[0].userId).toBe("user1");

      // User2 should only see their session
      const user2SessionsResponse = await user2API.getUserSessions();
      expect(user2SessionsResponse.ok()).toBeTruthy();
      const user2Sessions: ChatSession[] = await user2SessionsResponse.json();

      expect(user2Sessions).toHaveLength(1);
      expect(user2Sessions[0].id).toBe(user2Session.id);
      expect(user2Sessions[0].title).toBe("User2 Session");
      expect(user2Sessions[0].userId).toBe("user2");
    });

    test("user cannot access another user's session", async () => {
      // User1 creates a session
      const user1Response = await user1API.createSession(
        "User1 Private Session"
      );
      expect(user1Response.ok()).toBeTruthy();
      const user1Session: ChatSession = await user1Response.json();
      testSessions.push(user1Session.id);

      // User2 tries to access User1's session messages
      const user2MessageResponse = await user2API.getMessages(user1Session.id);
      expect(user2MessageResponse.status()).toBe(404);

      // User2 tries to rename User1's session
      const user2RenameResponse = await user2API.renameSession(
        user1Session.id,
        "Hacked Title"
      );
      expect(user2RenameResponse.status()).toBe(404);

      // User2 tries to delete User1's session
      const user2DeleteResponse = await user2API.deleteSession(user1Session.id);
      expect(user2DeleteResponse.status()).toBe(404);

      // Verify User1's session is still intact
      const user1SessionsResponse = await user1API.getUserSessions();
      expect(user1SessionsResponse.ok()).toBeTruthy();
      const user1Sessions: ChatSession[] = await user1SessionsResponse.json();

      expect(user1Sessions).toHaveLength(1);
      expect(user1Sessions[0].title).toBe("User1 Private Session");
    });

    test("user cannot add messages to another user's session", async () => {
      // User1 creates a session
      const user1Response = await user1API.createSession("User1 Chat");
      expect(user1Response.ok()).toBeTruthy();
      const user1Session: ChatSession = await user1Response.json();
      testSessions.push(user1Session.id);

      // User1 adds a message
      const user1MessageResponse = await user1API.addMessage(
        user1Session.id,
        "user",
        "Hello from user1"
      );
      expect(user1MessageResponse.ok()).toBeTruthy();

      // User2 tries to add a message to User1's session
      const user2MessageResponse = await user2API.addMessage(
        user1Session.id,
        "user",
        "Malicious message from user2"
      );
      expect(user2MessageResponse.status()).toBe(404);

      // Verify User1's session only has their message
      const messagesResponse = await user1API.getMessages(user1Session.id);
      expect(messagesResponse.ok()).toBeTruthy();
      const messages: ChatMessage[] = await messagesResponse.json();

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Hello from user1");
    });

    test("user cannot toggle favorite on another user's session", async () => {
      // User1 creates a session
      const user1Response = await user1API.createSession("User1 Favorite Test");
      expect(user1Response.ok()).toBeTruthy();
      const user1Session: ChatSession = await user1Response.json();
      testSessions.push(user1Session.id);

      // User2 tries to toggle favorite on User1's session
      const user2FavoriteResponse = await user2API.toggleFavorite(
        user1Session.id,
        true
      );
      expect(user2FavoriteResponse.status()).toBe(404);

      // User1 can toggle their own session
      const user1FavoriteResponse = await user1API.toggleFavorite(
        user1Session.id,
        true
      );
      expect(user1FavoriteResponse.ok()).toBeTruthy();
      const updatedSession: ChatSession = await user1FavoriteResponse.json();
      expect(updatedSession.isFavorite).toBe(true);
    });
  });

  test.describe("User ID Validation", () => {
    test("should reject requests without x-user-id header", async () => {
      const response = await user1API
        .getRequest()
        .post(`${user1API.getBaseURL()}/chats-service/api/v1/chats`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "dev-api-key-2024",
            "Unique-Reference-Code": "test-no-user-id",
          },
          data: { title: "Should Fail" },
        });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.errors[0]?.code).toContain("MissingUserId");
    });

    test("should reject requests with invalid user ID format", async () => {
      const response = await user1API
        .getRequest()
        .post(`${user1API.getBaseURL()}/chats-service/api/v1/chats`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "dev-api-key-2024",
            "x-user-id": "user@invalid!",
            "Unique-Reference-Code": "test-invalid-user-id",
          },
          data: { title: "Should Fail" },
        });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.errors[0]?.code).toContain("InvalidUserId");
    });

    test("should reject requests with user ID too short", async () => {
      const response = await user1API
        .getRequest()
        .post(`${user1API.getBaseURL()}/chats-service/api/v1/chats`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "dev-api-key-2024",
            "x-user-id": "ab", // Only 2 characters
            "Unique-Reference-Code": "test-short-user-id",
          },
          data: { title: "Should Fail" },
        });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.errors[0]?.code).toContain("InvalidUserId");
    });

    test("should reject requests with user ID too long", async () => {
      const longUserId = "a".repeat(51); // 51 characters
      const response = await user1API
        .getRequest()
        .post(`${user1API.getBaseURL()}/chats-service/api/v1/chats`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "dev-api-key-2024",
            "x-user-id": longUserId,
            "Unique-Reference-Code": "test-long-user-id",
          },
          data: { title: "Should Fail" },
        });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.errors[0]?.code).toContain("InvalidUserId");
    });

    test("should accept valid alphanumeric user IDs", async () => {
      const validUserIds = ["user123", "abc123XYZ", "User789", "test123test"];

      for (const userId of validUserIds) {
        const api = user1API.withUserId(userId);
        const response = await api.createSession(`Test session for ${userId}`);

        expect(response.ok()).toBeTruthy();
        const session: ChatSession = await response.json();
        expect(session.userId).toBe(userId);
        testSessions.push(session.id);

        // Clean up immediately
        await api.deleteSession(session.id);
      }
    });
  });

  test.describe("Multi-User Scenarios", () => {
    test("multiple users can have sessions with the same title", async () => {
      const sessionTitle = "Common Session Title";

      // Both users create sessions with the same title
      const user1Response = await user1API.createSession(sessionTitle);
      expect(user1Response.ok()).toBeTruthy();
      const user1Session: ChatSession = await user1Response.json();
      testSessions.push(user1Session.id);

      const user2Response = await user2API.createSession(sessionTitle);
      expect(user2Response.ok()).toBeTruthy();
      const user2Session: ChatSession = await user2Response.json();
      testSessions.push(user2Session.id);

      // Verify both sessions exist independently
      expect(user1Session.id).not.toBe(user2Session.id);
      expect(user1Session.title).toBe(sessionTitle);
      expect(user2Session.title).toBe(sessionTitle);
      expect(user1Session.userId).toBe("user1");
      expect(user2Session.userId).toBe("user2");
    });

    test("session IDs are unique across users", async () => {
      const sessionIds = new Set<string>();

      // Create multiple sessions for both users
      for (let i = 0; i < 3; i++) {
        const user1Response = await user1API.createSession(
          `User1 Session ${i}`
        );
        const user1Session: ChatSession = await user1Response.json();
        testSessions.push(user1Session.id);

        const user2Response = await user2API.createSession(
          `User2 Session ${i}`
        );
        const user2Session: ChatSession = await user2Response.json();
        testSessions.push(user2Session.id);

        // Check for uniqueness
        expect(sessionIds.has(user1Session.id)).toBeFalsy();
        expect(sessionIds.has(user2Session.id)).toBeFalsy();

        sessionIds.add(user1Session.id);
        sessionIds.add(user2Session.id);
      }

      expect(sessionIds.size).toBe(6); // 3 sessions for each of 2 users
    });
  });
});
