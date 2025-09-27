/* eslint-disable prettier/prettier */
export interface DashboardOverview {
    plants_summary: PlantsSummary;
    care_summary: CareSummary;
    notifications_summary: NotificationsSummary;
    alerts: DashboardAlert[];
    upcoming_care: UpcomingCare[];
}

export interface PlantsSummary {
    total_plants: number;
    health_distribution?: { // Optionnel maintenant
        excellent: number;
        good: number;
        fair: number;
        poor: number;
        critical: number;
    };
    care_level_distribution: { // Nouveau
        easy: number;
        medium: number;
        hard: number;
    };
    recent_plants: number;
    plants_needing_attention: number;
    plants_needing_watering: number; // Nouveau
    favorite_plants: PlantOverview[];
}

export interface PlantOverview {
    id: string;
    name: string;
    species: string; // Au lieu de health_status
    care_level: string;
    image_url?: string;
    last_watered?: string;
    next_watering?: string;
    location: string;
}

export interface CareSummary {
    total_care_actions: number;
    completed_today: number;
    pending_actions: number;
    overdue_actions: number;
    completion_rate: number;
    care_by_type: {
        [key: string]: number;
    };
    recent_actions: CareActionOverview[];
}

export interface CareActionOverview {
    id: string;
    plant_name: string;
    action_type: string;
    scheduled_date: string;
    completed_date?: string;
    status: string;
    notes?: string;
}

export interface NotificationsSummary {
    total_notifications: number;
    unread_count: number;
    urgent_count: number;
    notifications_by_type: {
        [key: string]: number;
    };
    recent_notifications: NotificationOverview[];
}

export interface NotificationOverview {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    is_read: boolean;
    created_at: string;
}

export interface DashboardAlert {
    id: string;
    type: 'overdue_care' | 'urgent_notification' | 'plant_health' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    action_required: boolean;
    related_entity_id?: string;
    related_entity_type?: 'plant' | 'care_action' | 'notification';
    created_at: string;
}

export interface UpcomingCare {
    id: string;
    plant_id: string;
    plant_name: string;
    plant_image?: string;
    action_type: string;
    scheduled_date: string;
    priority: string;
    estimated_duration?: number;
    notes?: string;
}

export interface CareStatsFilters {
    period?: 'week' | 'month' | 'quarter' | 'year';
    plant_id?: string;
    care_type?: string;
}

export interface CareChartData {
    period: string;
    date: string;
    completed_actions: number;
    scheduled_actions: number;
    completion_rate: number;
}

export interface PlantHealthChartData {
    plant_id: string;
    plant_name: string;
    health_history: {
        date: string;
        health_score: number;
        status: string;
    }[];
}
