import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class SessionParamDto {
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsString({ message: 'Session ID must be a string' })
  @IsUUID(4, { message: 'Session ID must be a valid UUID' })
  id: string;
}
