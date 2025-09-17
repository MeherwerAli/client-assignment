import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RenameSessionDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title cannot be longer than 200 characters' })
  @MinLength(1, { message: 'Title cannot be empty' })
  title: string;
}
