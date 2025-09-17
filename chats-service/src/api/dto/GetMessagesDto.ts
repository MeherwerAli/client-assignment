import { IsOptional, Min, Max, IsInt } from 'class-validator';

export class GetMessagesDto {
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot be more than 100' })
  limit = 50;

  @IsOptional()
  @IsInt({ message: 'Skip must be an integer' })
  @Min(0, { message: 'Skip must be at least 0' })
  skip = 0;
}
