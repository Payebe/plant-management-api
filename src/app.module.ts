/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PlantsModule } from './modules/plants/plants.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { CareActionsModule } from './modules/care-actions/care-actions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration globale des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule, // ✅ Ajout en premier
    AuthModule,
    PlantsModule,
    CareActionsModule,
    NotificationsModule,
    DashboardModule
  ],
})
export class AppModule { }
