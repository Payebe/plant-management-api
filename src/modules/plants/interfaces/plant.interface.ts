/* eslint-disable prettier/prettier */
export interface Plant {
    id: string;
    name: string;
    species: string;
    description?: string;
    image_url?: string;
    location: string;
    watering_frequency: number; // en jours
    last_watered?: string;
    next_watering?: string;
    care_level: 'easy' | 'medium' | 'hard';
    sunlight_requirement: 'low' | 'medium' | 'high';
    humidity_requirement: 'low' | 'medium' | 'high';
    temperature_min?: number;
    temperature_max?: number;
    notes?: string;
    is_active: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface PlantWithStats extends Plant {
    days_since_last_watered?: number;
    watering_status: 'ok' | 'due' | 'overdue';
    care_logs_count: number;
}

export interface PlantStats {
    total_plants: number;
    plants_needing_water: number;
    plants_watered_today: number;
    plants_by_care_level: {
        easy: number;
        medium: number;
        hard: number;
    };
}
