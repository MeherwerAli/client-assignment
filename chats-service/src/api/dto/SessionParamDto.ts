import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class SessionParamDto {
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsString({ message: 'Session ID must be a string' })
  @IsMongoId({ message: 'Session ID must be a valid MongoDB ObjectId' })
  id: string;
}
