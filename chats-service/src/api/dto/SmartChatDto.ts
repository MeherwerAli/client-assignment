import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SmartChatDto {
  @IsNotEmpty({ message: 'Message is required and cannot be empty' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(4000, { message: 'Message is too long - maximum 4000 characters allowed' })
  public message: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Context cannot exceed 1000 characters' })
  public context?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'API key cannot exceed 200 characters' })
  public customApiKey?: string;
}

export class SmartChatResponseDto {
  public userMessage: {
    id: string;
    content: string;
    timestamp: Date;
  };

  public assistantMessage: {
    id: string;
    content: string;
    timestamp: Date;
  };

  public tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };

  public conversationLength: number;

  constructor(
    userMessage: { id: string; content: string; timestamp: Date },
    assistantMessage: { id: string; content: string; timestamp: Date },
    tokensUsed: { prompt: number; completion: number; total: number },
    conversationLength: number
  ) {
    this.userMessage = userMessage;
    this.assistantMessage = assistantMessage;
    this.tokensUsed = tokensUsed;
    this.conversationLength = conversationLength;
  }
}
