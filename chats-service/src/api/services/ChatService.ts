import { Service } from 'typedi';
import { decryptValue } from '../../lib/env/helpers';
// import { Logger } from '../../lib/logger'; // Temporarily commented for testing
import { IRequestHeaders } from '../Interface/IRequestHeaders';
import { SmartChatResponseDto } from '../dto/SmartChatDto';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';
import ChatMessage from '../models/ChatMessage';
import ChatSession from '../models/ChatSession';
import { OpenAIService } from './OpenAIService';

@Service()
export class ChatService {
  // private log = new Logger(__filename); // Temporarily commented for testing

  constructor(private openAIService: OpenAIService) {
    // this.log.info('Starting ChatService'); // Temporarily commented for testing
  }

  public async getUserSessions(userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'getUserSessions', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    const sessions = await ChatSession.find({ userId }).sort({ lastMessageAt: -1, createdAt: -1 }).exec();
    return sessions.map(session => session.toJSON());
  }

  public async createSession(title: string, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'createSession', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    const session = await ChatSession.create({
      title: !title || title.trim() === '' ? 'New chat' : title,
      userId: userId
    });
    return session.toJSON();
  }

  public async renameSession(sessionId: string, title: string, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'renameSession', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      const session = await ChatSession.findOneAndUpdate({ _id: sessionId, userId: userId }, { title }, { new: true });

      if (!session) {
        // this.log.warn(`Session not found for update: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

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

  public async toggleFavorite(sessionId: string, isFavorite: boolean, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'toggleFavorite', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId: userId },
        { isFavorite },
        { new: true }
      );

      if (!session) {
        // this.log.warn(`Session not found for favorite toggle: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

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

  public async deleteSession(sessionId: string, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'deleteSession', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      const session = await ChatSession.findOneAndDelete({ _id: sessionId, userId: userId });

      if (!session) {
        // this.log.warn(`Session not found for deletion: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // First delete all messages in the session
      await ChatMessage.deleteMany({ sessionId });

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
      const session = await ChatSession.findOne({ _id: sessionId, userId: userId });
      if (!session) {
        // this.log.warn(`Session not found for adding message: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // Create the message (encryption will be handled by pre-save hook)
      const message = await ChatMessage.create({
        sessionId,
        sender,
        content,
        context
      });

      // Update session's lastMessageAt
      await ChatSession.findByIdAndUpdate(sessionId, {
        lastMessageAt: message.createdAt
      });

      // Return message with original content for the response
      // (the database stores encrypted, but we return unencrypted for API response)
      const messageResponse = message.toJSON();
      messageResponse.content = content; // Return original unencrypted content

      return messageResponse;
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

  public async getMessages(sessionId: string, limit = 50, skip = 0, userId: string, headers: IRequestHeaders) {
    // const logMessage = constructLogMessage(__filename, 'getMessages', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      // Verify session belongs to user
      const session = await ChatSession.findOne({ _id: sessionId, userId: userId });
      if (!session) {
        // this.log.warn(`Session not found for getting messages: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // Sanitize pagination parameters
      const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
      const safeSkip = Math.max(Number(skip) || 0, 0);

      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .exec();

      // Manually decrypt content for all retrieved messages
      const decryptedMessages = await Promise.all(
        messages.map(async msg => {
          const msgJson = msg.toJSON();
          if (msgJson.content) {
            try {
              msgJson.content = await decryptValue(msgJson.content);
            } catch (error) {
              // this.log.warn('Failed to decrypt message content during retrieval'); // Temporarily commented for testing
            }
          }
          return msgJson;
        })
      );

      return decryptedMessages;
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

  public async smartChat(
    sessionId: string,
    userMessage: string,
    context: string | undefined,
    userId: string,
    headers: IRequestHeaders,
    customApiKey?: string
  ): Promise<SmartChatResponseDto> {
    // const logMessage = constructLogMessage(__filename, 'smartChat', headers);
    // this.log.info(logMessage); // Temporarily commented for testing

    try {
      // Verify session exists and belongs to user
      const session = await ChatSession.findOne({ _id: sessionId, userId: userId });
      if (!session) {
        // this.log.warn(`Session not found for smart chat: sessionId=${sessionId}, userId=${userId}`); // Temporarily commented for testing
        throw new CredError(HTTPCODES.NOT_FOUND, CODES.NotFound);
      }

      // Get conversation history (last 20 messages for context)
      const conversationHistory = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 }).limit(20).exec();

      // Format conversation history for OpenAI
      const messages = this.openAIService.buildConversationContext(
        conversationHistory.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      );

      // Add the new user message to the conversation
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Get AI response from OpenAI (use custom API key if provided)
      const aiResponse = await this.openAIService.generateChatCompletion(messages, headers, customApiKey);

      // Save the user message
      const userMessageDoc = await ChatMessage.create({
        sessionId,
        sender: 'user',
        content: userMessage,
        context: !context ? undefined : { userContext: context }
      });

      // Save the assistant message
      const assistantMessageDoc = await ChatMessage.create({
        sessionId,
        sender: 'assistant',
        content: aiResponse.content,
        context: {
          tokensUsed: aiResponse.tokensUsed,
          finishReason: aiResponse.finishReason
        }
      });

      // Update session's lastMessageAt
      await ChatSession.findByIdAndUpdate(sessionId, {
        lastMessageAt: assistantMessageDoc.createdAt
      });

      // Get updated conversation length
      const totalMessages = await ChatMessage.countDocuments({ sessionId });

      // Content is now stored as plain text (encryption disabled for demo)
      return new SmartChatResponseDto(
        {
          id: userMessageDoc._id.toString(),
          content: userMessageDoc.content,
          timestamp: userMessageDoc.createdAt
        },
        {
          id: assistantMessageDoc._id.toString(),
          content: assistantMessageDoc.content,
          timestamp: assistantMessageDoc.createdAt
        },
        aiResponse.tokensUsed,
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
        (error as Error).message || 'Database operation failed'
      );
    }
  }
}
