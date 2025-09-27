/* eslint-disable prettier/prettier */
import type { User } from '@supabase/supabase-js';

export interface AuthResponse {
    user: User;
    accessToken: string | null; // ✅ Peut être null pour registration
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    createdAt: string;
    plantsCount: number;
}
