import { Document } from 'mongoose';

export interface IChatSession extends Document {
  title: string;
  userId?: string;
  isFavorite: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
