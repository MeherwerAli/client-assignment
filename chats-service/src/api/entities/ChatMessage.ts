import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  AfterLoad
} from 'typeorm';
import { ChatSession } from './ChatSession';
// import { Logger } from '../../lib/logger'; // Temporarily disabled for demo
// import { decryptValue, encryptValue } from '../../lib/env/helpers'; // Temporarily disabled for demo

// const log = new Logger(__filename); // Temporarily disabled for demo

export type MessageSender = 'user' | 'assistant' | 'system';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ type: 'varchar', length: 20 })
  sender!: MessageSender;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', nullable: true })
  context?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ChatSession, (session) => session.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session?: ChatSession;

  // Encryption hooks (temporarily disabled for demo)
  @BeforeInsert()
  async encryptContent() {
    // Temporarily disabled encryption for demo purposes
    // if (this.content) {
    //   this.content = await encryptValue(this.content);
    // }
  }

  @AfterLoad()
  async decryptContent() {
    // Temporarily disabled decryption for demo purposes
    // if (this.content) {
    //   try {
    //     this.content = await decryptValue(this.content);
    //   } catch (error: any) {
    //     log.error('Error decrypting chat message content', { error });
    //   }
    // }
  }

  // Virtual properties for compatibility with existing interfaces
  toJSON() {
    return {
      id: this.id,
      sessionId: this.sessionId,
      sender: this.sender,
      content: this.content,
      context: this.context,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
