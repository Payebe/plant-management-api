/* eslint-disable prettier/prettier */
export enum NotificationType {
    WATERING_REMINDER = 'watering_reminder',
    FERTILIZING_REMINDER = 'fertilizing_reminder',
    REPOTTING_REMINDER = 'repotting_reminder',
    PRUNING_REMINDER = 'pruning_reminder',
    PEST_TREATMENT_REMINDER = 'pest_treatment_reminder',
    CARE_OVERDUE = 'care_overdue',
    PLANT_HEALTH_ALERT = 'plant_health_alert',
    SYSTEM_NOTIFICATION = 'system_notification',
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface NotificationEntity {
    id: string;
    user_id: string;
    plant_id?: string;
    care_action_id?: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    is_read: boolean;
    scheduled_for: string;
    sent_at?: string;
    read_at?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}
