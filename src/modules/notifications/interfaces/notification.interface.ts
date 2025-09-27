/* eslint-disable prettier/prettier */
import {
    NotificationPriority,
    NotificationType,
} from '../entities/notification.entity';

export interface NotificationResponse {
    id: string;
    user_id: string;
    plant_id?: string;
    plant_name?: string;
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

export interface NotificationStats {
    total_notifications: number;
    unread_count: number;
    notifications_by_type: Record<NotificationType, number>;
    notifications_by_priority: Record<NotificationPriority, number>;
    overdue_count: number;
    today_count: number;
    this_week_count: number;
}

export interface CreateNotificationResponse {
    id: string;
    message: string;
}

export interface UpdateNotificationResponse {
    id: string;
    message: string;
}

export interface PaginationResponse {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
