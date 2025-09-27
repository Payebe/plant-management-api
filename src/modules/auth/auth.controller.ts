/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import type { User } from '@supabase/supabase-js'; // ← Changement ici
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthResponse, UserProfile } from './interfaces/auth-response.interface'; // ← Changement ici

// Contrôleur pour les endpoints d'authentification
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Endpoint pour l'inscription
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: Object
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  async register(@Body() dto: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    const result = await this.authService.register(dto);
    return {
      statusCode: 201,
      message: 'Utilisateur créé avec succès. Vérifiez votre email.',
      data: result,
    };
  }

  // Endpoint pour la connexion
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: Object
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Identifiants incorrects'
  })
  async login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const result = await this.authService.login(dto);

    // ✅ Message différent selon si on a le token ou pas
    const message = result.accessToken
      ? 'Utilisateur créé avec succès. Vous êtes connecté.'
      : 'Utilisateur créé avec succès. Vérifiez votre email pour confirmer votre compte.';
    return {
      statusCode: 200,
      message,
      data: result, // ✅ Pas de double wrapping
    };
  }

  // Endpoint pour récupérer le profil utilisateur (protégé)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré',
    type: Object
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Token invalide'
  })
  async getProfile(@CurrentUser() user: User): Promise<ApiResponse<User>> {
    return {
      statusCode: 200,
      message: 'Profil utilisateur récupéré',
      data: user,
    };
  }

  // Endpoint pour récupérer le profil complet avec statistiques
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil complet avec statistiques' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Profil complet récupéré',
    type: Object
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Token invalide'
  })
  async getCompleteProfile(@CurrentUser() user: User): Promise<ApiResponse<UserProfile>> {
    const profile = await this.authService.getProfile(user.id);
    return {
      statusCode: 200,
      message: 'Profil complet récupéré',
      data: profile,
    };
  }

  // Endpoint pour la déconnexion
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se déconnecter' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
    type: Object
  })
  async logout(@CurrentUser() user: User): Promise<ApiResponse<null>> {
    await this.authService.logout(user.id);
    return {
      statusCode: 200,
      message: 'Déconnexion réussie',
      data: null,
    };
  }
}
