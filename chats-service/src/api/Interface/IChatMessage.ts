import { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  sessionId: Schema.Types.ObjectId;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  context?: any;
  createdAt: Date;
  updatedAt: Date;
}
