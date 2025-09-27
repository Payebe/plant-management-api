/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Query,
    UseGuards,
    Request,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
    DashboardOverview,
    PlantsSummary,
    CareSummary,
    NotificationsSummary,
    DashboardAlert,
    UpcomingCare,
} from './interfaces/dashboard.interface';
import {
    UpcomingCareFiltersDto,
    AlertsFiltersDto,
    PlantsOverviewFiltersDto,
    CareOverviewFiltersDto,
    NotificationsOverviewFiltersDto,
    DashboardStatsFiltersDto,
} from './dto/dashboard.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    // 📊 OVERVIEW PRINCIPAL
    @Get('overview')
    @ApiOperation({
        summary: 'Vue d\'ensemble complète du dashboard',
        description: 'Récupère toutes les données principales du dashboard en une seule requête'
    })
    @ApiResponse({
        status: 200,
        description: 'Vue d\'ensemble récupérée avec succès',
        type: Object, // En production, créer une classe DTO pour le type de retour
    })
    async getDashboardOverview(@Request() req): Promise<DashboardOverview> {
        return this.dashboardService.getDashboardOverview(req.user);
    }

    // 🌱 RÉSUMÉ DES PLANTES
    @Get('plants/overview')
    @ApiOperation({
        summary: 'Résumé des plantes',
        description: 'Statistiques et aperçu des plantes de l\'utilisateur'
    })
    @ApiResponse({
        status: 200,
        description: 'Résumé des plantes récupéré avec succès',
    })
    async getPlantsOverview(
        @Request() req,
        @Query(ValidationPipe) filters: PlantsOverviewFiltersDto
    ): Promise<PlantsSummary> {
        return this.dashboardService.getPlantsOverview(req.user, filters);
    }

    // Alias pour compatibilité
    @Get('plants/summary')
    @ApiOperation({
        summary: 'Résumé des plantes (alias)',
        description: 'Alias pour l\'endpoint plants/overview'
    })
    async getPlantsSummary(@Request() req): Promise<PlantsSummary> {
        return this.dashboardService.getPlantsSummary(req.user);
    }

    // 💧 RÉSUMÉ DES SOINS
    @Get('care/overview')
    @ApiOperation({
        summary: 'Résumé des soins',
        description: 'Statistiques et aperçu des actions de soin'
    })
    @ApiResponse({
        status: 200,
        description: 'Résumé des soins récupéré avec succès',
    })
    async getCareOverview(
        @Request() req,
        @Query(ValidationPipe) filters: CareOverviewFiltersDto
    ): Promise<CareSummary> {
        return this.dashboardService.getCareOverview(req.user, filters);
    }

    // 🔔 RÉSUMÉ DES NOTIFICATIONS
    @Get('notifications/overview')
    @ApiOperation({
        summary: 'Résumé des notifications',
        description: 'Statistiques et aperçu des notifications'
    })
    @ApiResponse({
        status: 200,
        description: 'Résumé des notifications récupéré avec succès',
    })
    async getNotificationsOverview(
        @Request() req,
        @Query(ValidationPipe) filters: NotificationsOverviewFiltersDto
    ): Promise<NotificationsSummary> {
        return this.dashboardService.getNotificationsOverview(req.user, filters);
    }

    // Alias pour compatibilité
    @Get('notifications/summary')
    @ApiOperation({
        summary: 'Résumé des notifications (alias)',
        description: 'Alias pour l\'endpoint notifications/overview'
    })
    async getNotificationsSummary(@Request() req): Promise<NotificationsSummary> {
        return this.dashboardService.getNotificationsSummary(req.user);
    }

    // 🚨 ALERTES
    @Get('alerts')
    @ApiOperation({
        summary: 'Alertes du dashboard',
        description: 'Récupère les alertes importantes nécessitant l\'attention de l\'utilisateur'
    })
    @ApiResponse({
        status: 200,
        description: 'Alertes récupérées avec succès',
    })
    @ApiQuery({
        name: 'type',
        required: false,
        enum: ['overdue_care', 'urgent_notification', 'plant_health', 'system'],
        description: 'Type d\'alerte à filtrer'
    })
    @ApiQuery({
        name: 'min_severity',
        required: false,
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Sévérité minimale des alertes'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: 'number',
        description: 'Nombre maximum d\'alertes à retourner'
    })
    async getAlerts(
        @Request() req,
        @Query(ValidationPipe) filters: AlertsFiltersDto
    ): Promise<DashboardAlert[]> {
        return this.dashboardService.getAlerts(req.user, filters);
    }

    // 📅 SOINS À VENIR
    @Get('care/upcoming')
    @ApiOperation({
        summary: 'Soins à venir',
        description: 'Récupère les prochaines actions de soin programmées'
    })
    @ApiResponse({
        status: 200,
        description: 'Soins à venir récupérés avec succès',
    })
    @ApiQuery({
        name: 'days',
        required: false,
        type: 'number',
        description: 'Nombre de jours à anticiper (défaut: 7)'
    })
    @ApiQuery({
        name: 'priority',
        required: false,
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Priorité minimale des soins'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: 'number',
        description: 'Nombre maximum de soins à retourner'
    })
    async getUpcomingCare(
        @Request() req,
        @Query(ValidationPipe) filters: UpcomingCareFiltersDto
    ): Promise<UpcomingCare[]> {
        return this.dashboardService.getUpcomingCare(req.user, filters);
    }

    // 📈 STATISTIQUES DE COMPLETION DES SOINS
    @Get('stats/care-completion')
    @ApiOperation({
        summary: 'Statistiques de completion des soins',
        description: 'Évolution du taux de completion des soins dans le temps'
    })
    @ApiResponse({
        status: 200,
        description: 'Statistiques de completion récupérées avec succès',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['week', 'month', 'quarter', 'year'],
        description: 'Période d\'analyse'
    })
    @ApiQuery({
        name: 'plant_id',
        required: false,
        type: 'string',
        description: 'ID de plante spécifique (optionnel)'
    })
    async getCareCompletionStats(
        @Request() req,
        @Query(ValidationPipe) filters: DashboardStatsFiltersDto
    ): Promise<any[]> {
        return this.dashboardService.getCareCompletionStats(req.user, filters);
    }

    // 🏥 STATISTIQUES DE SANTÉ DES PLANTES
    @Get('stats/plant-health')
    @ApiOperation({
        summary: 'Statistiques de santé des plantes',
        description: 'Distribution et évolution de la santé des plantes'
    })
    @ApiResponse({
        status: 200,
        description: 'Statistiques de santé récupérées avec succès',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['week', 'month', 'quarter', 'year'],
        description: 'Période d\'analyse'
    })
    @ApiQuery({
        name: 'plant_id',
        required: false,
        type: 'string',
        description: 'ID de plante spécifique (optionnel)'
    })
    async getPlantHealthStats(
        @Request() req,
        @Query(ValidationPipe) filters: DashboardStatsFiltersDto
    ): Promise<any[]> {
        return this.dashboardService.getPlantHealthStats(req.user, filters);
    }

    // 🔄 ENDPOINT DE RAFRAÎCHISSEMENT
    @Get('refresh')
    @ApiOperation({
        summary: 'Rafraîchir le dashboard',
        description: 'Force la mise à jour de toutes les données du dashboard'
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard rafraîchi avec succès',
    })
    async refreshDashboard(@Request() req): Promise<DashboardOverview> {
        // Même logique que l'overview mais avec du cache busting si nécessaire
        return this.dashboardService.getDashboardOverview(req.user);
    }

    // 📊 MÉTRIQUES RAPIDES (pour widgets)
    @Get('quick-metrics')
    @ApiOperation({
        summary: 'Métriques rapides',
        description: 'Métriques essentielles pour affichage rapide (widgets, notifications push, etc.)'
    })
    @ApiResponse({
        status: 200,
        description: 'Métriques rapides récupérées avec succès',
    })
    async getQuickMetrics(@Request() req): Promise<{
        total_plants: number;
        pending_care: number;
        overdue_care: number;
        unread_notifications: number;
        critical_alerts: number;
    }> {
        const overview = await this.dashboardService.getDashboardOverview(req.user);

        return {
            total_plants: overview.plants_summary.total_plants,
            pending_care: overview.care_summary.pending_actions,
            overdue_care: overview.care_summary.overdue_actions,
            unread_notifications: overview.notifications_summary.unread_count,
            critical_alerts: overview.alerts.filter(a => a.severity === 'critical').length,
        };
    }
}
