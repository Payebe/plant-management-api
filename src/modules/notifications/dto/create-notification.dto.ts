/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
    IsString,
    IsEnum,
    IsOptional,
    IsUUID,
    IsDateString,
    IsObject,
    MaxLength,
    IsBoolean,
} from 'class-validator';
import {
    NotificationType,
    NotificationPriority,
} from '../entities/notification.entity';

export class CreateNotificationDto {
    @IsOptional()
    @IsUUID()
    plant_id?: string;

    @IsOptional()
    @IsUUID()
    care_action_id?: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    @MaxLength(200)
    title: string;

    @IsString()
    @MaxLength(500)
    message: string;

    @IsEnum(NotificationPriority)
    @IsOptional()
    priority?: NotificationPriority = NotificationPriority.MEDIUM;

    @IsDateString()
    @IsOptional()
    scheduled_for?: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @IsBoolean()
    @IsOptional()
    is_read?: boolean = false;
}
