import { expect, test } from "@playwright/test";
import { ChatServiceAPI, TestDataGenerator } from "./utils/api-helpers";

test.describe("Integration and End-to-End Tests", () => {
  let api: ChatServiceAPI;
  let testSessions: string[] = [];

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

  test("should complete full chat session workflow", async () => {
    // 1. Create a new chat session
    const sessionTitle = TestDataGenerator.generateSessionTitle();
    const createResponse = await api.createSession(sessionTitle);
    expect(createResponse.ok()).toBeTruthy();

    const session = await createResponse.json();
    testSessions.push(session.id);
    expect(session.title).toBe(sessionTitle);
    expect(session.isFavorite).toBe(false);

    // 2. Add user message
    const userMessage = TestDataGenerator.generateMessage("user");
    const userMsgResponse = await api.addMessage(
      session.id,
      "user",
      userMessage.content
    );
    expect(userMsgResponse.ok()).toBeTruthy();

    const userMsg = await userMsgResponse.json();
    expect(userMsg.sender).toBe("user");
    expect(userMsg.content).toBe(userMessage.content);

    // 3. Add assistant response with context
    const assistantMessage = TestDataGenerator.generateMessage("assistant");
    const assistantMsgResponse = await api.addMessage(
      session.id,
      "assistant",
      assistantMessage.content,
      assistantMessage.context
    );
    expect(assistantMsgResponse.ok()).toBeTruthy();

    const assistantMsg = await assistantMsgResponse.json();
    expect(assistantMsg.sender).toBe("assistant");
    expect(assistantMsg.content).toBe(assistantMessage.content);
    expect(assistantMsg.context).toEqual(assistantMessage.context);

    // 4. Add system message
    const systemMessage = TestDataGenerator.generateMessage("system");
    const systemMsgResponse = await api.addMessage(
      session.id,
      "system",
      systemMessage.content
    );
    expect(systemMsgResponse.ok()).toBeTruthy();

    // 5. Retrieve all messages
    const messagesResponse = await api.getMessages(session.id);
    expect(messagesResponse.ok()).toBeTruthy();

    const messages = await messagesResponse.json();
    expect(messages).toHaveLength(3);

    // Messages should be in reverse chronological order (newest first)
    expect(messages[0].sender).toBe("system");
    expect(messages[1].sender).toBe("assistant");
    expect(messages[2].sender).toBe("user");

    // 6. Mark session as favorite
    const favoriteResponse = await api.toggleFavorite(session.id, true);
    expect(favoriteResponse.ok()).toBeTruthy();

    const favoriteSession = await favoriteResponse.json();
    expect(favoriteSession.isFavorite).toBe(true);

    // 7. Rename the session
    const newTitle = TestDataGenerator.generateSessionTitle();
    const renameResponse = await api.renameSession(session.id, newTitle);
    expect(renameResponse.ok()).toBeTruthy();

    const renamedSession = await renameResponse.json();
    expect(renamedSession.title).toBe(newTitle);

    // 8. Add more messages and test pagination
    for (let i = 0; i < 5; i++) {
      const msg = TestDataGenerator.generateMessage("user");
      await api.addMessage(
        session.id,
        "user",
        `${msg.content} - Pagination test ${i}`
      );
    }

    // Test pagination - get first 3 messages
    const paginatedResponse = await api.getMessages(session.id, 3);
    expect(paginatedResponse.ok()).toBeTruthy();

    const paginatedMessages = await paginatedResponse.json();
    expect(paginatedMessages).toHaveLength(3);

    // Test pagination - skip first 3, get next 3
    const skippedResponse = await api.getMessages(session.id, 3, 3);
    expect(skippedResponse.ok()).toBeTruthy();

    const skippedMessages = await skippedResponse.json();
    expect(skippedMessages).toHaveLength(3);

    // 9. Unmark as favorite
    const unfavoriteResponse = await api.toggleFavorite(session.id, false);
    expect(unfavoriteResponse.ok()).toBeTruthy();

    const unfavoriteSession = await unfavoriteResponse.json();
    expect(unfavoriteSession.isFavorite).toBe(false);

    // 10. Delete the session (cleanup will happen in afterEach, but let's test the API)
    const deleteResponse = await api.deleteSession(session.id);
    expect(deleteResponse.ok()).toBeTruthy();

    // Remove from cleanup list since we deleted it
    testSessions = testSessions.filter((id) => id !== session.id);

    // 11. Verify session is deleted
    const verifyDeleteResponse = await api.getMessages(session.id);
    expect(verifyDeleteResponse.status()).toBe(404);
  });

  test("should handle multiple concurrent sessions", async () => {
    const sessionCount = 5;
    const sessions = [];

    // Create multiple sessions concurrently
    const createPromises = [];
    for (let i = 0; i < sessionCount; i++) {
      createPromises.push(api.createSession(`Concurrent Session ${i}`));
    }

    const createResponses = await Promise.all(createPromises);

    // All should succeed
    for (const response of createResponses) {
      expect(response.ok()).toBeTruthy();
      const session = await response.json();
      sessions.push(session);
      testSessions.push(session.id);
    }

    // Add messages to each session concurrently
    const messagePromises = [];
    sessions.forEach((session, index) => {
      for (let i = 0; i < 3; i++) {
        const msg = TestDataGenerator.generateMessage("user");
        messagePromises.push(
          api.addMessage(
            session.id,
            "user",
            `Session ${index} - Message ${i}: ${msg.content}`
          )
        );
      }
    });

    const messageResponses = await Promise.all(messagePromises);

    // All messages should be added successfully
    messageResponses.forEach((response) => {
      expect(response.ok()).toBeTruthy();
    });

    // Verify each session has the correct number of messages
    for (const session of sessions) {
      const messagesResponse = await api.getMessages(session.id);
      expect(messagesResponse.ok()).toBeTruthy();

      const messages = await messagesResponse.json();
      expect(messages).toHaveLength(3);
    }

    // Perform operations on sessions concurrently
    const operationPromises = [];
    sessions.forEach((session, index) => {
      if (index % 2 === 0) {
        // Mark even sessions as favorite
        operationPromises.push(api.toggleFavorite(session.id, true));
      } else {
        // Rename odd sessions
        operationPromises.push(
          api.renameSession(session.id, `Renamed Session ${index}`)
        );
      }
    });

    const operationResponses = await Promise.all(operationPromises);

    // All operations should succeed
    operationResponses.forEach((response) => {
      expect(response.ok()).toBeTruthy();
    });
  });

  test("should maintain data consistency throughout operations", async () => {
    // Create session
    const createResponse = await api.createSession("Consistency Test Session");
    expect(createResponse.ok()).toBeTruthy();

    const session = await createResponse.json();
    testSessions.push(session.id);

    // Add various types of messages with different content
    const messageTypes = [
      { sender: "user", content: "Hello there!", context: undefined },
      {
        sender: "assistant",
        content: "Hello! How can I help you today?",
        context: { model: "test-model", confidence: 0.95, tokens: 12 },
      },
      {
        sender: "system",
        content: "User greeting detected",
        context: undefined,
      },
      {
        sender: "user",
        content: "Can you explain quantum physics?",
        context: undefined,
      },
      {
        sender: "assistant",
        content: "Quantum physics is a fundamental theory in physics...",
        context: {
          model: "test-model",
          confidence: 0.87,
          tokens: 156,
          sources: ["physics_book.pdf"],
        },
      },
    ];

    const addedMessages = [];
    for (const msgType of messageTypes) {
      const response = await api.addMessage(
        session.id,
        msgType.sender as any,
        msgType.content,
        msgType.context
      );
      expect(response.ok()).toBeTruthy();

      const message = await response.json();
      addedMessages.push(message);
    }

    // Verify all messages are retrievable and maintain their properties
    const messagesResponse = await api.getMessages(session.id);
    expect(messagesResponse.ok()).toBeTruthy();

    const retrievedMessages = await messagesResponse.json();
    expect(retrievedMessages).toHaveLength(messageTypes.length);

    // Check that content is properly encrypted/decrypted
    retrievedMessages.forEach((retrieved, index) => {
      const original = messageTypes[messageTypes.length - 1 - index]; // Reverse order
      expect(retrieved.sender).toBe(original.sender);
      expect(retrieved.content).toBe(original.content);

      if (original.context) {
        expect(retrieved.context).toEqual(original.context);
      } else {
        expect(retrieved.context).toBeUndefined();
      }
    });

    // Test session operations don't affect messages
    await api.renameSession(session.id, "Renamed Consistency Test");
    await api.toggleFavorite(session.id, true);
    await api.toggleFavorite(session.id, false);

    // Verify messages are still intact
    const finalMessagesResponse = await api.getMessages(session.id);
    expect(finalMessagesResponse.ok()).toBeTruthy();

    const finalMessages = await finalMessagesResponse.json();
    expect(finalMessages).toHaveLength(messageTypes.length);

    // Content should remain unchanged
    finalMessages.forEach((retrieved, index) => {
      const original = messageTypes[messageTypes.length - 1 - index];
      expect(retrieved.content).toBe(original.content);
    });
  });

  test("should handle complex message context objects", async () => {
    const createResponse = await api.createSession("Complex Context Test");
    expect(createResponse.ok()).toBeTruthy();

    const session = await createResponse.json();
    testSessions.push(session.id);

    // Complex context object with nested data
    const complexContext = {
      model: "gpt-4",
      parameters: {
        temperature: 0.7,
        maxTokens: 150,
        topP: 0.9,
      },
      metadata: {
        requestId: "req-12345",
        timestamp: new Date().toISOString(),
        userAgent: "TestAgent/1.0",
      },
      sources: [
        {
          type: "document",
          title: "AI Research Paper",
          url: "https://example.com/paper.pdf",
          relevance: 0.92,
        },
        {
          type: "web",
          title: "AI News Article",
          url: "https://example.com/news",
          relevance: 0.78,
        },
      ],
      reasoning: {
        steps: [
          "Analyzed user query",
          "Retrieved relevant documents",
          "Generated response based on context",
        ],
        confidence: 0.89,
      },
      metrics: {
        processingTime: 1234,
        tokenCount: 456,
        apiCalls: 3,
      },
    };

    const response = await api.addMessage(
      session.id,
      "assistant",
      "Based on the research papers and current AI developments...",
      complexContext
    );

    expect(response.ok()).toBeTruthy();
    const message = await response.json();

    // Verify complex context is preserved
    expect(message.context).toEqual(complexContext);
    expect(message.context.metadata.requestId).toBe("req-12345");
    expect(message.context.sources).toHaveLength(2);
    expect(message.context.reasoning.steps).toHaveLength(3);

    // Retrieve and verify again
    const messagesResponse = await api.getMessages(session.id);
    expect(messagesResponse.ok()).toBeTruthy();

    const messages = await messagesResponse.json();
    expect(messages[0].context).toEqual(complexContext);
  });
});
