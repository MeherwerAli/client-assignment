import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleFavoriteDto {
  @IsNotEmpty({ message: 'isFavorite is required' })
  @IsBoolean({ message: 'isFavorite must be a boolean' })
  isFavorite: boolean;
}
