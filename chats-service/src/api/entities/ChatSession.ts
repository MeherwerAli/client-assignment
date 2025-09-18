import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ChatMessage } from './ChatMessage';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, default: 'New chat' })
  title!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100, nullable: true })
  userId?: string;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite!: boolean;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => ChatMessage, (message) => message.session)
  messages?: ChatMessage[];

  // Virtual properties for compatibility with existing interfaces
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      userId: this.userId,
      isFavorite: this.isFavorite,
      lastMessageAt: this.lastMessageAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
