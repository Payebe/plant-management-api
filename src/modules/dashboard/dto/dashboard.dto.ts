/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsOptional, IsEnum, IsUUID, IsString, IsInt, Min, Max, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsFiltersDto {
    @ApiPropertyOptional({
        enum: ['week', 'month', 'quarter', 'year'],
        description: 'Période pour les statistiques',
        example: 'month'
    })
    @IsOptional()
    @IsEnum(['week', 'month', 'quarter', 'year'])
    period?: 'week' | 'month' | 'quarter' | 'year' = 'month';

    @ApiPropertyOptional({
        description: 'ID de la plante pour filtrer',
        example: 'uuid-plant-id'
    })
    @IsOptional()
    @IsUUID()
    plant_id?: string;

    @ApiPropertyOptional({
        description: 'Type de soin pour filtrer',
        example: 'watering'
    })
    @IsOptional()
    @IsString()
    care_type?: string;
}

export class UpcomingCareFiltersDto {
    @ApiPropertyOptional({
        description: 'Nombre de jours à venir',
        example: 7,
        minimum: 1,
        maximum: 30
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(30)
    days?: number = 7;

    @ApiPropertyOptional({
        description: 'Limite du nombre de résultats',
        example: 10,
        minimum: 1,
        maximum: 50
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Priorité minimale',
        enum: ['low', 'medium', 'high', 'critical'],
        example: 'medium'
    })
    @IsOptional()
    @IsEnum(['low', 'medium', 'high', 'critical'])
    min_priority?: 'low' | 'medium' | 'high' | 'critical';
}

export class AlertsFiltersDto {
    @ApiPropertyOptional({
        enum: ['overdue_care', 'urgent_notification', 'plant_health', 'system'],
        description: 'Type d\'alerte',
        example: 'overdue_care'
    })
    @IsOptional()
    @IsEnum(['overdue_care', 'urgent_notification', 'plant_health', 'system'])
    type?: 'overdue_care' | 'urgent_notification' | 'plant_health' | 'system';

    @ApiPropertyOptional({
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Sévérité minimale',
        example: 'medium'
    })
    @IsOptional()
    @IsEnum(['low', 'medium', 'high', 'critical'])
    min_severity?: 'low' | 'medium' | 'high' | 'critical';

    @ApiPropertyOptional({
        description: 'Limite du nombre de résultats',
        example: 5,
        minimum: 1,
        maximum: 20
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(20)
    limit?: number = 5;
}

// Dans ton fichier DTO (probablement dashboard.dto.ts)
export class PlantsOverviewFiltersDto {
    @IsOptional()
    @IsBoolean()
    include_favorites?: boolean;

    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsString()
    care_level?: string;
}


export class CareOverviewFiltersDto {
    @ApiPropertyOptional({
        description: 'Inclure les actions récentes',
        example: true
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    include_recent_actions?: boolean = true;

    @ApiPropertyOptional({
        description: 'Limite pour les actions récentes',
        example: 5,
        minimum: 1,
        maximum: 20
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(20)
    recent_actions_limit?: number = 5;
}

export class NotificationsOverviewFiltersDto {
    @ApiPropertyOptional({
        description: 'Inclure les notifications récentes',
        example: true
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    include_recent_notifications?: boolean = true;

    @ApiPropertyOptional({
        description: 'Limite pour les notifications récentes',
        example: 5,
        minimum: 1,
        maximum: 20
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(20)
    recent_notifications_limit?: number = 5;
}
