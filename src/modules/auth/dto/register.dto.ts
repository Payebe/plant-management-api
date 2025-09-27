/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO pour valider les données d’inscription
export class RegisterDto {
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

  @ApiProperty({ example: 'John Doe', description: 'Nom de l’utilisateur' })
  @IsString({ message: 'Le nom doit être une chaîne' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  name: string;
}
