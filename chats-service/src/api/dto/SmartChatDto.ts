import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SmartChatDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(4000, { message: 'Message content cannot exceed 4000 characters' })
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
