import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength, MinLength } from 'class-validator';

export class AddMessageDto {
  @IsNotEmpty({ message: 'Sender is required' })
  @IsString({ message: 'Sender must be a string' })
  @IsIn(['user', 'assistant', 'system'], { message: 'Sender must be one of: user, assistant, system' })
  sender: 'user' | 'assistant' | 'system';

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @MaxLength(10000, { message: 'Content cannot be longer than 10000 characters' })
  @MinLength(1, { message: 'Content cannot be empty' })
  content: string;

  @IsOptional()
  context?: any;
}
