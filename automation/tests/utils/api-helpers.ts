import { APIRequestContext } from "@playwright/test";

export interface ChatSession {
  id: string;
  title: string;
  userId?: string;
  isFavorite: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "user" | "assistant" | "system";
  content: string;
  context?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * API Helper class for Chat Service automation tests
 */
export class ChatServiceAPI {
  private baseURL: string;
  private apiKey: string;
  private request: APIRequestContext;
  private userId: string;

  constructor(
    request: APIRequestContext,
    baseURL: string = "http://localhost:3002",
    apiKey: string = "dev-api-key-2024",
    userId: string = "test-user-123"
  ) {
    this.request = request;
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.userId = userId;
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}) {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "x-user-id": this.userId,
      "Unique-Reference-Code": `test-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`,
      ...additionalHeaders,
    };
  }

  /**
   * Get the base URL for custom requests
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Get the request context for custom requests
   */
  getRequest(): APIRequestContext {
    return this.request;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Create a new API instance with a different user ID for testing isolation
   */
  withUserId(userId: string): ChatServiceAPI {
    return new ChatServiceAPI(this.request, this.baseURL, this.apiKey, userId);
  }

  /**
   * Health check endpoint
   */
  async healthCheck() {
    return await this.request.get(
      `${this.baseURL}/chats-service/api/v1/health`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Create a new chat session
   */
  async createSession(title?: string) {
    const body = title ? { title } : {};
    return await this.request.post(
      `${this.baseURL}/chats-service/api/v1/chats`,
      {
        headers: this.getHeaders(),
        data: body,
      }
    );
  }

  /**
   * Get user sessions
   */
  async getUserSessions() {
    return await this.request.get(
      `${this.baseURL}/chats-service/api/v1/chats`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Rename a chat session
   */
  async renameSession(sessionId: string, title: string) {
    return await this.request.patch(
      `${this.baseURL}/chats-service/api/v1/chats/${sessionId}`,
      {
        headers: this.getHeaders(),
        data: { title },
      }
    );
  }

  /**
   * Toggle session favorite status
   */
  async toggleFavorite(sessionId: string, isFavorite: boolean) {
    return await this.request.patch(
      `${this.baseURL}/chats-service/api/v1/chats/${sessionId}/favorite`,
      {
        headers: this.getHeaders(),
        data: { isFavorite },
      }
    );
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string) {
    return await this.request.delete(
      `${this.baseURL}/chats-service/api/v1/chats/${sessionId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Add a message to a session
   */
  async addMessage(
    sessionId: string,
    sender: "user" | "assistant" | "system",
    content: string,
    context?: any
  ) {
    const data: any = { sender, content };
    if (context) {
      data.context = context;
    }

    return await this.request.post(
      `${this.baseURL}/chats-service/api/v1/chats/${sessionId}/messages`,
      {
        headers: this.getHeaders(),
        data,
      }
    );
  }

  /**
   * Send a smart chat message using OpenAI
   */
  async smartChat(sessionId: string, message: string, context?: any) {
    const data: any = { message };
    if (context) {
      data.context = context;
    }

    return await this.request.post(
      `${this.baseURL}/chats-service/api/v1/chats/${sessionId}/smart-chat`,
      {
        headers: this.getHeaders(),
        data,
      }
    );
  }

  /**
   * Get messages from a session
   */
  async getMessages(sessionId: string, limit?: number, skip?: number) {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (skip !== undefined) params.append("skip", skip.toString());

    const url = `${
      this.baseURL
    }/chats-service/api/v1/chats/${sessionId}/messages${
      params.toString() ? "?" + params.toString() : ""
    }`;

    return await this.request.get(url, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Test unauthorized access (without API key)
   */
  async testUnauthorized(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
    data?: any
  ) {
    const headers = {
      "Content-Type": "application/json",
      "Unique-Reference-Code": `test-unauthorized-${Date.now()}`,
    };

    const options = { headers, ...(data && { data }) };

    switch (method) {
      case "GET":
        return await this.request.get(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      case "POST":
        return await this.request.post(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      case "PATCH":
        return await this.request.patch(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      case "DELETE":
        return await this.request.delete(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  /**
   * Make a custom request with specific data (for testing validation)
   */
  async customRequest(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    data?: any,
    includeAuth: boolean = true
  ) {
    const headers = includeAuth
      ? this.getHeaders()
      : {
          "Content-Type": "application/json",
          "Unique-Reference-Code": `test-custom-${Date.now()}`,
        };

    const options = { headers, ...(data && { data }) };

    switch (method) {
      case "GET":
        return await this.request.get(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      case "POST":
        return await this.request.post(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      case "PATCH":
        return await this.request.patch(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      case "DELETE":
        return await this.request.delete(
          `${this.baseURL}/chats-service/api${endpoint}`,
          options
        );
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
}

/**
 * Test data generators
 */
export class TestDataGenerator {
  static generateSessionTitle(): string {
    const adjectives = [
      "Amazing",
      "Brilliant",
      "Creative",
      "Dynamic",
      "Efficient",
    ];
    const nouns = ["Project", "Discussion", "Meeting", "Session", "Chat"];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
      nouns[Math.floor(Math.random() * nouns.length)]
    } ${Date.now()}`;
  }

  static generateMessage(sender: "user" | "assistant" | "system" = "user"): {
    sender: string;
    content: string;
    context?: any;
  } {
    const messages = {
      user: [
        "Hello, how are you?",
        "Can you help me with this problem?",
        "What is the weather like today?",
        "Tell me a joke.",
        "Explain quantum physics.",
      ],
      assistant: [
        "Hello! I'm doing well, thank you for asking.",
        "I'd be happy to help you with that problem.",
        "I don't have access to current weather data.",
        "Why don't scientists trust atoms? Because they make up everything!",
        "Quantum physics is the study of matter and energy at the smallest scale.",
      ],
      system: [
        "Session started.",
        "User joined the chat.",
        "Message sent successfully.",
        "Session updated.",
        "Connection established.",
      ],
    };

    const content =
      messages[sender][Math.floor(Math.random() * messages[sender].length)];
    const context =
      sender === "assistant"
        ? {
            model: "test-model",
            tokens: Math.floor(Math.random() * 100),
            confidence: Math.random(),
          }
        : undefined;

    return { sender, content, context };
  }

  static generateInvalidObjectId(): string {
    return "invalid-object-id-123";
  }

  static generateValidObjectId(): string {
    // Generate a valid MongoDB ObjectId format (24 hex characters)
    return "507f1f77bcf86cd799439011";
  }

  static generateURC(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
