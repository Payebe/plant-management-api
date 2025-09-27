/* eslint-disable prettier/prettier */
export enum CareActionType {
    WATERING = 'watering',
    FERTILIZING = 'fertilizing',
    REPOTTING = 'repotting',
    PRUNING = 'pruning',
    PEST_TREATMENT = 'pest_treatment',
    OTHER = 'other'
}

export interface CareActionEntity {
    id: string;
    user_id: string;
    plant_id: string;
    action_type: CareActionType;
    date: string; // ISO date string
    notes?: string;
    next_action_date?: string; // ISO date string  
    quantity?: number; // Pour fertilisant, eau, etc.
    created_at: string;
    updated_at: string;

    // Relations virtuelles pour les réponses API
    plant?: {
        id: string;
        name: string;
        species?: string;
    };
}
