export interface ChatSession {
  id: string;
  title: string;
  userId?: string;
  isFavorite: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  context?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  title?: string;
}

export interface RenameSessionRequest {
  title: string;
}

export interface ToggleFavoriteRequest {
  isFavorite: boolean;
}

export interface AddMessageRequest {
  sender: 'user' | 'assistant' | 'system';
  content: string;
  context?: any;
}

export interface GetMessagesQuery {
  limit?: number;
  skip?: number;
}

export interface SmartChatRequest {
  message: string;
  context?: string;
  customApiKey?: string;
}

export interface SmartChatResponse {
  userMessage: {
    id: string;
    content: string;
    timestamp: string;
  };
  assistantMessage: {
    id: string;
    content: string;
    timestamp: string;
  };
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  conversationLength: number;
}