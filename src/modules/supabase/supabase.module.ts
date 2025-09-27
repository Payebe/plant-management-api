/* eslint-disable prettier/prettier */
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Global() // Rend le service disponible dans toute l'application
@Module({
    imports: [ConfigModule],
    providers: [SupabaseService],
    exports: [SupabaseService],
})
export class SupabaseModule { }
