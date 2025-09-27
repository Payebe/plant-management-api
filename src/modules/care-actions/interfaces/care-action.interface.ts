/* eslint-disable prettier/prettier */
import { CareActionEntity, CareActionType } from "../entities/care-action.entity";

export interface CareActionStats {
    total_actions: number;
    actions_this_week: number;
    actions_this_month: number;
    actions_by_type: Record<CareActionType, number>;
    most_active_plants: Array<{
        plant_id: string;
        plant_name: string;
        action_count: number;
    }>;
    upcoming_actions: Array<{
        plant_id: string;
        plant_name: string;
        action_type: CareActionType;
        next_date: string;
    }>;
}

export interface CareActionResponse extends CareActionEntity {
    plant?: {
        id: string;
        name: string;
        species?: string;
    };
}
