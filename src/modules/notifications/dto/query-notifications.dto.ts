/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsEnum, IsUUID, IsDateString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export class QueryNotificationsDto {
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority;

    @IsOptional()
    @IsUUID()
    plant_id?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    is_read?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    overdue?: boolean;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsEnum(['created_at', 'scheduled_for', 'priority', 'is_read'])
    sort_by?: string = 'created_at';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sort_order?: 'asc' | 'desc' = 'desc';
}
