import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  RenameSessionRequest,
  ToggleFavoriteRequest,
  AddMessageRequest,
  GetMessagesQuery,
  SmartChatRequest,
  SmartChatResponse
} from '../types/api';

class ChatAPIService {
  private api: AxiosInstance;
  private userId: string;

  constructor() {
    // Get initial service key from localStorage
    const initialServiceKey = localStorage.getItem('chat-service-auth-key') || config.API_KEY;
    
    this.api = axios.create({
      baseURL: config.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': initialServiceKey,
      },
    });

    // Initialize with saved userId or default
    this.userId = localStorage.getItem('chatUserId') || 'default-user';
    
    // Add request interceptor to include required headers
    this.api.interceptors.request.use((config) => {
      config.headers['Unique-Reference-Code'] = uuidv4();
      config.headers['x-user-id'] = this.userId;
      
      // Always use the latest service key from localStorage
      const currentServiceKey = localStorage.getItem('chat-service-auth-key') || 'dev-api-key-2024';
      config.headers['x-api-key'] = currentServiceKey;
      
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const errorData = error.response?.data;
        const status = error.response?.status;
        
        // Handle authentication errors specifically
        if (status === 401) {
          const authError = new Error('Authentication failed: Incorrect Service Authentication Key');
          authError.name = 'AuthenticationError';
          console.error('Authentication Error:', authError.message);
          throw authError;
        }
        
        // Handle other API errors with better messages
        if (errorData && errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          if (firstError.message) {
            const apiError = new Error(firstError.message);
            apiError.name = 'APIError';
            throw apiError;
          }
        }
        
        console.error('API Error:', errorData || error.message);
        throw error;
      }
    );

    // Listen for service key changes
    this.setupServiceKeyListener();
  }

  private setupServiceKeyListener() {
    window.addEventListener('service-key-changed', (event: any) => {
      const { serviceKey } = event.detail;
      this.updateServiceKey(serviceKey);
    });
  }

  private updateServiceKey(serviceKey: string) {
    // Update the default header for future requests
    this.api.defaults.headers['x-api-key'] = serviceKey;
    console.log('Service API key updated');
  }

  private generateUserId(): string {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatUserId', userId);
    return userId;
  }

  // Session Management
  async getSessions(): Promise<ChatSession[]> {
    const response = await this.api.get<ChatSession[]>('/chats');
    return response.data;
  }

  async createSession(data: CreateSessionRequest = {}): Promise<ChatSession> {
    const response = await this.api.post<ChatSession>('/chats', data);
    return response.data;
  }

  async renameSession(sessionId: string, data: RenameSessionRequest): Promise<ChatSession> {
    const response = await this.api.patch<ChatSession>(`/chats/${sessionId}`, data);
    return response.data;
  }

  async toggleFavorite(sessionId: string, data: ToggleFavoriteRequest): Promise<ChatSession> {
    const response = await this.api.patch<ChatSession>(`/chats/${sessionId}/favorite`, data);
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.api.delete(`/chats/${sessionId}`);
  }

  // Message Management
  async getMessages(sessionId: string, query: GetMessagesQuery = {}): Promise<ChatMessage[]> {
    const response = await this.api.get<ChatMessage[]>(`/chats/${sessionId}/messages`, {
      params: query
    });
    return response.data;
  }

  async addMessage(sessionId: string, data: AddMessageRequest): Promise<ChatMessage> {
    const response = await this.api.post<ChatMessage>(`/chats/${sessionId}/messages`, data);
    return response.data;
  }

  // Smart Chat (AI Integration)
  async smartChat(sessionId: string, data: SmartChatRequest): Promise<SmartChatResponse> {
    const response = await this.api.post<SmartChatResponse>(`/chats/${sessionId}/smart-chat`, data);
    return response.data;
  }

  // Utility Methods
  getCurrentUserId(): string {
    return this.userId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('chatUserId', userId);
  }

  setApiKey(apiKey: string): void {
    this.api.defaults.headers['x-api-key'] = apiKey;
  }
}

// Export singleton instance
export const chatAPI = new ChatAPIService();
export default chatAPI;