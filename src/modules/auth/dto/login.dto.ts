/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO pour valider les données de connexion
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email de l’utilisateur',
  })
  @IsEmail({}, { message: 'L’email doit être valide' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mot de passe de l’utilisateur',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password: string;
}
// Ce DTO (Data Transfer Object) est utilisé pour valider les données envoyées lors de la connexion.
// Il utilise des décorateurs de class-validator pour s'assurer que l'email est valide et que le mot de passe
// respecte les contraintes définies. De plus, des décorateurs Swagger sont utilisés pour documenter
// automatiquement l'API.
