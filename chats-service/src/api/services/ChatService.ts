import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { Logger } from '../../lib/logger';
import { constructLogMessage } from '../../lib/env/helpers';
import { IRequestHeaders } from '../Interface/IRequestHeaders';
import { SmartChatResponseDto } from '../dto/SmartChatDto';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';
import { ChatMessage } from '../entities/ChatMessage';
import { ChatSession } from '../entities/ChatSession';
import { OpenAIService } from './OpenAIService';

@Service()
export class ChatService {
  private log = new Logger(__filename);
  private sessionRepository: Repository<ChatSession>;
  private messageRepository: Repository<ChatMessage>;

  constructor(private openAIService: OpenAIService) {
    this.log.info('Starting ChatService');
    this.sessionRepository = AppDataSource.getRepository(ChatSession);
    this.messageRepository = AppDataSource.getRepository(ChatMessage);
  }

  public async getUserSessions(userId: string, headers: IRequestHeaders) {
    const logMessage = constructLogMessage(__filename, 'getUserSessions', headers);
    this.log.info(logMessage);

    const sessions = await this.sessionRepository.find({
      where: { userId },
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' }
    });
    return sessions.map(session => session.toJSON());
  }

  public async createSession(title: string, userId: string, headers: IRequestHeaders) {
    const logMessage = constructLogMessage(__filename, 'createSession', headers);
    this.log.info(logMessage);

    const session = this.sessionRepository.create({
      title: !title || title.trim() === '' ? 'New chat' : title,
      userId: userId
    });
    
    const savedSession = await this.sessionRepository.save(session);
    return savedSession.toJSON();
  }

  public async renameSession(sessionId: string, title: string, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'renameSession', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      const result = await this.sessionRepository.update(
        { id: sessionId, userId: userId },
        { title }
      );

      if (result.affected === 0) {
        // this.log.warn(`Session not found for update: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, userId: userId }
      });

      return session!.toJSON();
    } catch (error) {
      // If it's already a CredError, re-throw it
      if (error instanceof CredError || (error as any).httpCode) {
        throw error;
      }
      throw new CredError(
        HTTPCODES.INTERNAL_SERVER_ERROR,
        CODES.GenericErrorMessage,
        (error as Error).message || 'Database operation failed'
      );
    }
  }

  public async toggleFavoriteSession(sessionId: string, isFavorite: boolean, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'toggleFavoriteSession', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      const result = await this.sessionRepository.update(
        { id: sessionId, userId: userId },
        { isFavorite }
      );

      if (result.affected === 0) {
        // this.log.warn(`Session not found for favorite toggle: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, userId: userId }
      });

      return session!.toJSON();
    } catch (error) {
      // If it's already a CredError, re-throw it
      if (error instanceof CredError || (error as any).httpCode) {
        throw error;
      }
      throw new CredError(
        HTTPCODES.INTERNAL_SERVER_ERROR,
        CODES.GenericErrorMessage,
        (error as Error).message || 'Database operation failed'
      );
    }
  }

  public async deleteSession(sessionId: string, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'deleteSession', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      // Find the session first to ensure it exists and belongs to the user
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, userId: userId }
      });

      if (!session) {
        // this.log.warn(`Session not found for deletion: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // Delete all messages in the session (CASCADE should handle this, but explicit is safer)
      await this.messageRepository.delete({ sessionId });

      // Delete the session
      await this.sessionRepository.delete({ id: sessionId, userId: userId });

      return session.toJSON();
    } catch (error) {
      // If it's already a CredError, re-throw it
      if (error instanceof CredError || (error as any).httpCode) {
        throw error;
      }
      throw new CredError(
        HTTPCODES.INTERNAL_SERVER_ERROR,
        CODES.GenericErrorMessage,
        (error as Error).message || 'Database operation failed'
      );
    }
  }

  public async addMessage(
    sessionId: string,
    sender: string,
    content: string,
    context: any,
    userId: string,
    headers: IRequestHeaders
  ) {
    // const logMessage = constructLogMessage(__filename, 'addMessage', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      // Verify session exists and belongs to user
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, userId: userId }
      });
      
      if (!session) {
        // this.log.warn(`Session not found for adding message: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // Create the message (encryption will be handled by entity hooks)
      const message = this.messageRepository.create({
        sessionId,
        sender: sender as any,
        content,
        context
      });

      const savedMessage = await this.messageRepository.save(message);

      // Fetch the saved message to trigger @AfterLoad (decryption) hook
      const decryptedMessage = await this.messageRepository.findOne({
        where: { id: savedMessage.id }
      });

      // Update session's lastMessageAt timestamp
      await this.sessionRepository.update(
        { id: sessionId },
        { lastMessageAt: new Date() }
      );

      return decryptedMessage?.toJSON() || savedMessage.toJSON();
    } catch (error) {
      // If it's already a CredError, re-throw it
      if (error instanceof CredError || (error as any).httpCode) {
        throw error;
      }
      throw new CredError(
        HTTPCODES.INTERNAL_SERVER_ERROR,
        CODES.GenericErrorMessage,
        (error as Error).message || 'Database operation failed'
      );
    }
  }

  public async getMessages(sessionId: string, limit: number, skip: number, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'getMessages', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      // Verify session exists and belongs to user
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, userId: userId }
      });
      
      if (!session) {
        // this.log.warn(`Session not found for retrieving messages: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      const [messages, total] = await this.messageRepository.findAndCount({
        where: { sessionId },
        order: { createdAt: 'DESC' },
        skip: skip || 0,
        take: limit || 50
      });

      const processedMessages = messages.map((message) => {
        // Return message data with automatic encryption/decryption handled by entity hooks
        return {
          id: message.id,
          sessionId: message.sessionId,
          sender: message.sender,
          content: message.content,
          context: message.context || undefined, // Convert null to undefined for consistency
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        };
      });

      return {
        messages: processedMessages, // Keep DESC order (newest first)
        total,
        page: Math.floor((skip || 0) / (limit || 50)) + 1,
        pages: Math.ceil(total / (limit || 50))
      };
    } catch (error) {
      // If it's already a CredError, re-throw it
      if (error instanceof CredError || (error as any).httpCode) {
        throw error;
      }
      throw new CredError(
        HTTPCODES.INTERNAL_SERVER_ERROR,
        CODES.GenericErrorMessage,
        (error as Error).message || 'Database operation failed'
      );
    }
  }

  // Auto-naming function for sessions
  private async autoNameSession(sessionId: string, firstUserMessage: string): Promise<void> {
    try {
      // Generate a smart title from the first message (truncate to 50 chars)
      let title = firstUserMessage.trim();
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Remove any questions marks or exclamation points from the end and add appropriate punctuation
      title = title.replace(/[?!]+$/, '');
      if (!title.endsWith('.') && !title.endsWith('...')) {
        title += title.length > 30 ? '...' : '';
      }
      
      // Update the session title if it's still the default
      await this.sessionRepository.update(
        { id: sessionId, title: 'New chat' },
        { title }
      );
    } catch (error) {
      // Log error but don't throw - auto-naming is not critical
      // this.log.warn('Failed to auto-name session', { sessionId, error }); // Temporarily commented for testing
    }
  }

  public async smartChat(
    sessionId: string,
    message: string,
    context: any,
    userId: string,
    headers: IRequestHeaders,
    customApiKey?: string
  ): Promise<SmartChatResponseDto> {
    // const logMessage = constructLogMessage(__filename, 'smartChat', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      // Verify session exists and belongs to user
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, userId: userId }
      });
      
      if (!session) {
        // this.log.warn(`Session not found for smart chat: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // Get conversation history for context (last 20 messages)
      const conversationHistory = await this.messageRepository.find({
        where: { sessionId },
        order: { createdAt: 'ASC' },
        take: 20
      });

      // Get AI response
      const conversationMessages = [
        ...conversationHistory.map(msg => ({ 
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const, 
          content: msg.content 
        })),
        { role: 'user' as const, content: message }
      ];
      
      const aiResponse = await this.openAIService.generateChatCompletion(
        conversationMessages,
        headers,
        customApiKey
      );

      // Save user message
      const userMessage = this.messageRepository.create({
        sessionId,
        sender: 'user',
        content: message,
        context: { timestamp: new Date() }
      });
      const userMessageDoc = await this.messageRepository.save(userMessage);

      // Save assistant response
      const assistantMessage = this.messageRepository.create({
        sessionId,
        sender: 'assistant',
        content: aiResponse.content,
        context: { timestamp: new Date(), model: 'gpt-3.5-turbo' }
      });
      const assistantMessageDoc = await this.messageRepository.save(assistantMessage);

      // Update session timestamp
      await this.sessionRepository.update(
        { id: sessionId },
        { lastMessageAt: new Date() }
      );

      // Auto-name session if it's the first message
      const totalMessages = await this.messageRepository.count({ where: { sessionId } });
      if (totalMessages === 2) { // First user message + first AI response
        await this.autoNameSession(sessionId, message);
      }

      // Fetch the saved messages again to trigger @AfterLoad decryption hook
      const decryptedUserMessage = await this.messageRepository.findOne({ where: { id: userMessageDoc.id } });
      const decryptedAssistantMessage = await this.messageRepository.findOne({ where: { id: assistantMessageDoc.id } });

      return new SmartChatResponseDto(
        {
          id: decryptedUserMessage!.id,
          content: decryptedUserMessage!.content,
          timestamp: decryptedUserMessage!.createdAt
        },
        {
          id: decryptedAssistantMessage!.id,
          content: decryptedAssistantMessage!.content,
          timestamp: decryptedAssistantMessage!.createdAt
        },
        {
          prompt: aiResponse.tokensUsed.prompt,
          completion: aiResponse.tokensUsed.completion,
          total: aiResponse.tokensUsed.prompt + aiResponse.tokensUsed.completion
        },
        totalMessages
      );
    } catch (error) {
      // If it's already a CredError, re-throw it
      if (error instanceof CredError || (error as any).httpCode) {
        throw error;
      }
      throw new CredError(
        HTTPCODES.INTERNAL_SERVER_ERROR,
        CODES.GenericErrorMessage,
        (error as Error).message || 'Smart chat operation failed'
      );
    }
  }
}
