/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CareActionsController } from './care-actions.controller';
import { CareActionsService } from './care-actions.service';
import { SupabaseModule } from '../supabase/supabase.module'; // ✅ Import ajouté

@Module({
    imports: [SupabaseModule], // ✅ Import ajouté
    controllers: [CareActionsController],
    providers: [CareActionsService],
    exports: [CareActionsService],
})
export class CareActionsModule { }
