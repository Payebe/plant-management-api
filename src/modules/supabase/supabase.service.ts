/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    [x: string]: any;
    private supabaseClient: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key must be provided');
        }

        this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    }

    get client(): SupabaseClient {
        return this.supabaseClient;
    }
}
