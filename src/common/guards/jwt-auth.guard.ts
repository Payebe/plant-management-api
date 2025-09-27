/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from 'src/modules/supabase/supabase.service';

// Garde pour protéger les routes avec un token JWT valide
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) { } // ✅ Injection

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7);

    try {
      const {
        data: { user },
        error,
      } = await this.supabase.client.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
// Ce garde (guard) est utilisé pour protéger les routes qui nécessitent une authentification.
// Il vérifie la présence et la validité d'un token JWT dans le header Authorization de la requête.
// Si le token est valide, il attache les informations de l'utilisateur à la requête pour un accès ultérieur.
// Pour l'utiliser, il suffit de l'appliquer aux routes ou contrôleurs souhaités avec le décorateur @UseGuards(JwtAuthGuard).
