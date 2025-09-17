import OpenAI from 'openai';
import { Service } from 'typedi';
import { env } from '../../env';
import { constructLogMessage } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger';
import { IRequestHeaders } from '../Interface/IRequestHeaders';
import { CredError } from '../errors/CredError';
import { CODES, HTTPCODES } from '../errors/errorCodeConstants';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  content: string;
  finishReason: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

@Service()
export class OpenAIService {
  private log = new Logger(__filename);
  private openai: OpenAI;

  constructor() {
    this.log.info('Starting OpenAIService');
    
    if (!env.openai.apiKey) {
      this.log.error('OPENAI_API_KEY environment variable is required but not provided');
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.log.debug('Initializing OpenAI client with provided API key');
    this.openai = new OpenAI({
      apiKey: env.openai.apiKey,
      baseURL: env.openai.baseURL
    });
  }

  /**
   * Generate chat completion using OpenAI GPT model
   */
  public async generateChatCompletion(
    messages: ChatMessage[], 
    headers: IRequestHeaders,
    customApiKey?: string
  ): Promise<OpenAIResponse> {
    const logMessage = constructLogMessage(__filename, 'generateChatCompletion', headers);
    this.log.info(logMessage);

    // Create OpenAI client - use custom API key if provided, otherwise use default
    const openaiClient = customApiKey ? new OpenAI({
      apiKey: customApiKey,
      baseURL: env.openai.baseURL
    }) : this.openai;

    try {
      this.log.debug('Sending request to OpenAI', {
        messageCount: messages.length,
        model: env.openai.model,
        maxTokens: env.openai.maxTokens,
        temperature: env.openai.temperature,
        usingCustomKey: !!customApiKey
      });
      
      const completion = await openaiClient.chat.completions.create({
        model: env.openai.model,
        messages: messages,
        max_tokens: env.openai.maxTokens,
        temperature: env.openai.temperature
      });

      this.log.debug('Received response from OpenAI');

      const choice = completion.choices[0];
      if (!choice || !choice.message || !choice.message.content) {
        this.log.error('Invalid response from OpenAI API: no content returned');
        throw new CredError(HTTPCODES.INTERNAL_SERVER_ERROR, CODES.OpenAIError, 'No content returned from OpenAI');
      }

      return {
        content: choice.message.content,
        finishReason: choice.finish_reason || 'unknown',
        tokensUsed: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      this.log.error(`OpenAI API error: ${error.message}`, { error, headers });

      // Handle specific OpenAI errors
      if (error?.error?.type === 'insufficient_quota' || error.type === 'insufficient_quota') {
        throw new CredError(HTTPCODES.PAYMENT_REQUIRED, CODES.OpenAIQuotaExceeded);
      }

      if (error?.error?.type === 'invalid_request_error' || error.type === 'invalid_request_error') {
        throw new CredError(HTTPCODES.BAD_REQUEST, CODES.OpenAIInvalidRequest);
      }

      if (error?.status === 429 || error?.error?.code === 'rate_limit_exceeded') {
        throw new CredError(HTTPCODES.TOO_MANY_REQUESTS, CODES.OpenAIRateLimit);
      }

      // If it's already a CredError, re-throw it
      if (error instanceof CredError) {
        throw error;
      }

      // Generic OpenAI error
      throw new CredError(HTTPCODES.INTERNAL_SERVER_ERROR, CODES.OpenAIError, error.message);
    }
  }

  /**
   * Build conversation context for OpenAI from chat messages
   */
  public buildConversationContext(
    conversationHistory: Array<{
      sender: string;
      content: string;
      createdAt: Date;
    }>
  ): ChatMessage[] {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Provide clear, accurate, and helpful responses to user questions.'
      }
    ];

    // Convert conversation history to OpenAI format
    conversationHistory.forEach(msg => {
      if (msg.sender === 'user') {
        messages.push({
          role: 'user',
          content: msg.content
        });
      } else if (msg.sender === 'assistant') {
        messages.push({
          role: 'assistant',
          content: msg.content
        });
      }
      // Skip 'system' messages from conversation history as we have our own system prompt
    });

    return messages;
  }

  /**
   * Validate OpenAI configuration
   */
  public async validateConfiguration(headers: IRequestHeaders): Promise<boolean> {
    const logMessage = constructLogMessage(__filename, 'validateConfiguration', headers);
    this.log.info(logMessage);

    try {
      // Make a simple test request to validate API key
      const testCompletion = await this.openai.chat.completions.create({
        model: env.openai.model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });

      return !!testCompletion.choices[0]?.message?.content;
    } catch (error: any) {
      this.log.error(`OpenAI configuration validation failed: ${error.message}`, { error, headers });
      return false;
    }
  }
}
