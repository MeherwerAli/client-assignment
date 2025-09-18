export interface IChatSession {
  id: string;
  title: string;
  userId?: string;
  isFavorite: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
