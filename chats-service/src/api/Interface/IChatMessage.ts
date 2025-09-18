export interface IChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  context?: any;
  createdAt: Date;
  updatedAt: Date;
}
