/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthResponse, UserProfile } from './interfaces/auth-response.interface';
import { SupabaseService } from '../supabase/supabase.service'; // ✅ Nouvel import

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) { } // ✅ Injection

  // Inscription d'un nouvel utilisateur
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.client.auth.signUp({ // ✅ Utilisation du service
      email: dto.email,
      password: dto.password,
      options: {
        data: { name: dto.name },
      },
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.user) {
      throw new UnauthorizedException('User registration failed');
    }

    return {
      user: data.user,
      accessToken: data.session?.access_token || null,
    };
  }

  // Connexion d'un utilisateur existant
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedException('Login failed');
    }

    return {
      user: data.user,
      accessToken: data.session.access_token,
    };
  }

  // Récupérer les informations de l'utilisateur connecté
  async getMe(accessToken: string): Promise<User> {
    const { data: { user }, error } = await this.supabase.client.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  // Récupérer le profil complet avec statistiques
  async getProfile(userId: string): Promise<UserProfile> {
    const { data: { user }, error } = await this.supabase.client.auth.admin.getUserById(userId);

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // Compter les plantes de l'utilisateur
    const { count: plantsCount } = await this.supabase.client
      .from('plants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || '',
      avatar: user.user_metadata?.avatar || null,
      createdAt: user.created_at,
      plantsCount: plantsCount || 0,
    };
  }

  // Déconnexion
  async logout(accessToken: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      throw new UnauthorizedException('Logout failed');
    }
  }
}

