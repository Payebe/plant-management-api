/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
    DashboardOverview,
    PlantsSummary,
    CareSummary,
    NotificationsSummary,
    DashboardAlert,
    UpcomingCare,
    PlantOverview,
    CareActionOverview,
    NotificationOverview,
} from './interfaces/dashboard.interface';
import {
    UpcomingCareFiltersDto,
    AlertsFiltersDto,
    PlantsOverviewFiltersDto,
    CareOverviewFiltersDto,
    NotificationsOverviewFiltersDto,
    DashboardStatsFiltersDto,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
    constructor(private readonly supabase: SupabaseService) { }

    private extractUserId(userId: any): string {
        if (typeof userId === 'object' && userId?.sub) {
            return userId.sub;
        }
        return userId?.toString() || userId;
    }

    async getDashboardOverview(userId: any): Promise<DashboardOverview> {
        const actualUserId = this.extractUserId(userId);

        const plantsStats = await this.getPlantsOverview(actualUserId, {});
        const careStats = await this.getCareOverview(actualUserId, {});
        const notificationsStats = await this.getNotificationsOverview(actualUserId, {});
        const alerts = await this.getAlerts(actualUserId, { limit: 5 });
        const upcomingCare = await this.getUpcomingCare(actualUserId, { days: 7, limit: 5 });

        return {
            plants_summary: plantsStats,
            care_summary: careStats,
            notifications_summary: notificationsStats,
            alerts,
            upcoming_care: upcomingCare,
        };
    }

    async getPlantsOverview(userId: any, filters: PlantsOverviewFiltersDto): Promise<PlantsSummary> {
        const actualUserId = this.extractUserId(userId);

        try {
            // ✅ CORRIGÉ - Utilise les vraies colonnes
            const { data: plants, error: plantsError } = await this.supabase.client
                .from('plants')
                .select(
                    'id, name, species, care_level, image_url, created_at, updated_at, last_watered, next_watering, location'
                )
                .eq('user_id', actualUserId)
                .eq('is_active', true); // Seulement les plantes actives

            if (plantsError) {
                throw new BadRequestException(
                    `Erreur plantes: ${plantsError.message}`,
                );
            }

            const totalPlants = plants?.length || 0;

            // Distribution par niveau de soins (utilise care_level)
            const healthDistribution = {
                excellent: 0, // On peut simuler ou laisser à 0
                good: plants?.filter(p => p.care_level === 'easy')?.length || 0,
                fair: plants?.filter(p => p.care_level === 'medium')?.length || 0,
                poor: plants?.filter(p => p.care_level === 'hard')?.length || 0,
                critical: 0, // À définir selon ta logique métier
            };

            // Alternative: Distribution par care_level
            const careLevelDistribution = {
                easy: plants?.filter(p => p.care_level === 'easy')?.length || 0,
                medium: plants?.filter(p => p.care_level === 'medium')?.length || 0,
                hard: plants?.filter(p => p.care_level === 'hard')?.length || 0,
            };

            // Plantes récemment ajoutées (30 derniers jours)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentPlants = plants?.filter(p =>
                new Date(p.created_at) >= thirtyDaysAgo
            )?.length || 0;

            // Plantes nécessitant arrosage (next_watering proche ou passé)
            const today = new Date();
            const plantsNeedingWatering = plants?.filter(p => {
                if (!p.next_watering) return false;
                return new Date(p.next_watering) <= today;
            })?.length || 0;

            // Plantes favorites (les plus récentes ou selon logique métier)
            let favoritePlants: PlantOverview[] = [];
            if (filters.include_favorites && plants) {
                favoritePlants = plants
                    .slice(0, 5) // Top 5 par défaut
                    .map(plant => ({
                        id: plant.id,
                        name: plant.name,
                        species: plant.species, // Utilise species au lieu de health_status
                        care_level: plant.care_level,
                        image_url: plant.image_url,
                        last_watered: plant.last_watered,
                        next_watering: plant.next_watering,
                        location: plant.location,
                    }));
            }

            return {
                total_plants: totalPlants,
                health_distribution: healthDistribution, // Ou utilise careLevelDistribution
                care_level_distribution: careLevelDistribution, // Nouvelle propriété
                recent_plants: recentPlants,
                plants_needing_attention: plantsNeedingWatering, // Plantes à arroser
                plants_needing_watering: plantsNeedingWatering,
                favorite_plants: favoritePlants,
            };

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(
                'Erreur lors de la récupération du résumé des plantes'
            );
        }
    }


    async getCareOverview(userId: any, filters: CareOverviewFiltersDto): Promise<CareSummary> {
        const actualUserId = this.extractUserId(userId);
        const today = new Date().toISOString().split('T')[0];

        // Total des actions
        const { data: allActions } = await this.supabase.client
            .from('care_actions')
            .select('id, action_type, status, completed_at, due_date')
            .eq('user_id', actualUserId);

        const totalActions = allActions?.length || 0;
        const completedToday = allActions?.filter(a =>
            a.status === 'completed' &&
            a.completed_at?.startsWith(today)
        )?.length || 0;

        const pendingActions = allActions?.filter(a => a.status === 'pending')?.length || 0;
        const overdueActions = allActions?.filter(a =>
            a.status === 'pending' &&
            a.due_date < today
        )?.length || 0;

        // Calcul du taux de completion
        const completedActions = allActions?.filter(a => a.status === 'completed')?.length || 0;
        const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

        // Actions par type
        const careByType: { [key: string]: number } = {};
        allActions?.forEach(action => {
            careByType[action.action_type] = (careByType[action.action_type] || 0) + 1;
        });

        // Actions récentes (si demandées) - ✅ CORRECTION ICI
        let recentActions: CareActionOverview[] = [];
        if (filters.include_recent_actions) {
            const { data: recentActionsData } = await this.supabase.client
                .from('care_actions')
                .select(`
                id, action_type, status, completed_at, due_date, notes,
                plants!inner(name)
            `)
                .eq('user_id', actualUserId)
                .eq('status', 'completed')
                .order('completed_at', { ascending: false })
                .limit(filters.recent_actions_limit || 5);

            recentActions = (recentActionsData || []).map(action => ({
                id: action.id,
                plant_name: (action.plants as any).name, // ✅ Type assertion
                action_type: action.action_type,
                scheduled_date: action.due_date,
                completed_date: action.completed_at,
                status: action.status,
                notes: action.notes,
            }));
        }

        return {
            total_care_actions: totalActions,
            completed_today: completedToday,
            pending_actions: pendingActions,
            overdue_actions: overdueActions,
            completion_rate: completionRate,
            care_by_type: careByType,
            recent_actions: recentActions,
        };
    }


    async getNotificationsOverview(userId: any, filters: NotificationsOverviewFiltersDto): Promise<NotificationsSummary> {
        const actualUserId = this.extractUserId(userId);

        const { data: notifications } = await this.supabase.client
            .from('notifications')
            .select('id, type, title, message, priority, is_read, created_at')
            .eq('user_id', actualUserId)
            .order('created_at', { ascending: false });

        const totalNotifications = notifications?.length || 0;
        const unreadCount = notifications?.filter(n => !n.is_read)?.length || 0;
        const urgentCount = notifications?.filter(n => ['high', 'critical'].includes(n.priority))?.length || 0;

        // Notifications par type
        const notificationsByType: { [key: string]: number } = {};
        notifications?.forEach(notif => {
            notificationsByType[notif.type] = (notificationsByType[notif.type] || 0) + 1;
        });

        // Notifications récentes (si demandées)
        let recentNotifications: NotificationOverview[] = [];
        if (filters.include_recent_notifications) {
            recentNotifications = (notifications || [])
                .slice(0, filters.recent_notifications_limit || 5)
                .map(notif => ({
                    id: notif.id,
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    priority: notif.priority,
                    is_read: notif.is_read,
                    created_at: notif.created_at,
                }));
        }

        return {
            total_notifications: totalNotifications,
            unread_count: unreadCount,
            urgent_count: urgentCount,
            notifications_by_type: notificationsByType,
            recent_notifications: recentNotifications,
        };
    }

    async getAlerts(userId: any, filters: AlertsFiltersDto): Promise<DashboardAlert[]> {
        const actualUserId = this.extractUserId(userId);
        const alerts: DashboardAlert[] = [];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        try {
            // 1️⃣ ALERTES POUR SOINS EN RETARD
            const { data: overdueActions } = await this.supabase.client
                .from('care_actions')
                .select(`
                id, action_type, due_date,
                plants!inner(id, name)
            `)
                .eq('user_id', actualUserId)
                .eq('status', 'pending')
                .lt('due_date', todayStr);

            overdueActions?.forEach(action => {
                const plant = action.plants as any;
                const daysOverdue = Math.floor(
                    (today.getTime() - new Date(action.due_date).getTime()) / (1000 * 60 * 60 * 24)
                );

                // Sévérité basée sur le nombre de jours de retard
                let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
                if (daysOverdue >= 7) severity = 'critical';
                else if (daysOverdue >= 3) severity = 'high';
                else if (daysOverdue >= 1) severity = 'medium';
                else severity = 'low';

                alerts.push({
                    id: `overdue_${action.id}`,
                    type: 'overdue_care',
                    severity,
                    title: `Soin en retard pour ${plant.name}`,
                    message: `Le ${action.action_type} prévu le ${action.due_date} est en retard de ${daysOverdue} jour(s)`,
                    action_required: true,
                    related_entity_id: action.id,
                    related_entity_type: 'care_action',
                    created_at: new Date().toISOString(),
                });
            });

            // 2️⃣ ALERTES POUR PLANTES EN MAUVAISE SANTÉ
            const { data: unhealthyPlants } = await this.supabase.client
                .from('plants')
                .select('id, name, health_status, updated_at')
                .eq('user_id', actualUserId)
                .in('health_status', ['poor', 'critical']);

            unhealthyPlants?.forEach(plant => {
                const severity: 'high' | 'critical' = plant.health_status === 'critical' ? 'critical' : 'high';

                alerts.push({
                    id: `health_${plant.id}`,
                    type: 'plant_health',
                    severity,
                    title: `Attention à ${plant.name}`,
                    message: `Cette plante est en ${plant.health_status === 'critical' ? 'état critique' : 'mauvaise santé'} et nécessite votre attention`,
                    action_required: true,
                    related_entity_id: plant.id,
                    related_entity_type: 'plant',
                    created_at: plant.updated_at || new Date().toISOString(),
                });
            });

            // 3️⃣ ALERTES POUR NOTIFICATIONS URGENTES
            const { data: urgentNotifications } = await this.supabase.client
                .from('notifications')
                .select('id, type, title, message, priority, created_at')
                .eq('user_id', actualUserId)
                .eq('is_read', false)
                .in('priority', ['high', 'urgent']);

            urgentNotifications?.forEach(notification => {
                const severity: 'high' | 'critical' = notification.priority === 'urgent' ? 'critical' : 'high';

                alerts.push({
                    id: `notification_${notification.id}`,
                    type: 'urgent_notification',
                    severity,
                    title: notification.title,
                    message: notification.message,
                    action_required: notification.priority === 'urgent',
                    related_entity_id: notification.id,
                    related_entity_type: 'notification',
                    created_at: notification.created_at,
                });
            });

            // 4️⃣ ALERTES SYSTÈME (exemple: plantes sans soins depuis longtemps)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const { data: neglectedPlants } = await this.supabase.client
                .from('plants')
                .select(`
                id, name, created_at,
                care_actions!inner(completed_at)
            `)
                .eq('user_id', actualUserId)
                .or(`care_actions.completed_at.is.null,care_actions.completed_at.lt.${thirtyDaysAgo.toISOString()}`);

            // Filtrer les plantes qui n'ont pas eu de soins récents
            const plantsWithoutRecentCare = neglectedPlants?.filter(plant => {
                const careActions = plant.care_actions as any[];
                if (!careActions || careActions.length === 0) return true;

                const lastCare = careActions
                    .filter(action => action.completed_at)
                    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];

                if (!lastCare) return true;

                const daysSinceLastCare = Math.floor(
                    (today.getTime() - new Date(lastCare.completed_at).getTime()) / (1000 * 60 * 60 * 24)
                );

                return daysSinceLastCare > 30;
            });

            plantsWithoutRecentCare?.forEach(plant => {
                alerts.push({
                    id: `neglected_${plant.id}`,
                    type: 'system',
                    severity: 'medium',
                    title: `${plant.name} semble négligée`,
                    message: `Cette plante n'a pas reçu de soins depuis plus de 30 jours`,
                    action_required: false,
                    related_entity_id: plant.id,
                    related_entity_type: 'plant',
                    created_at: plant.created_at,
                });
            });

            // 5️⃣ FILTRAGE ET LIMITATION
            let filteredAlerts = alerts;

            // Filtrer par type si spécifié
            if (filters.type) {
                filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type);
            }

            // Filtrer par sévérité minimale si spécifiée
            if (filters.min_severity) {
                const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
                const minSeverityLevel = severityOrder[filters.min_severity];
                filteredAlerts = filteredAlerts.filter(alert =>
                    severityOrder[alert.severity] >= minSeverityLevel
                );
            }

            // Trier par sévérité (critical first) puis par date
            filteredAlerts.sort((a, b) => {
                const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
                const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
                if (severityDiff !== 0) return severityDiff;

                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            // Limiter le nombre de résultats
            return filteredAlerts.slice(0, filters.limit || 10);

        } catch (error) {
            console.error('Erreur lors de la récupération des alertes:', error);
            return [];
        }
    }

    async getUpcomingCare(userId: any, filters: UpcomingCareFiltersDto): Promise<UpcomingCare[]> {
        const actualUserId = this.extractUserId(userId);
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + (filters.days || 7));

        const { data: upcoming } = await this.supabase.client
            .from('care_actions')
            .select(`
            id, action_type, due_date, priority, estimated_duration, notes,
            plants!inner(id, name, image_url)
        `)
            .eq('user_id', actualUserId)
            .eq('status', 'pending')
            .gte('due_date', today.toISOString())
            .lte('due_date', futureDate.toISOString())
            .order('due_date')
            .limit(filters.limit || 10);

        return (upcoming || []).map(action => {
            const plant = action.plants as any; // ✅ Type assertion
            return {
                id: action.id,
                plant_id: plant.id,
                plant_name: plant.name,
                plant_image: plant.image_url,
                action_type: action.action_type,
                scheduled_date: action.due_date,
                priority: action.priority,
                estimated_duration: action.estimated_duration,
                notes: action.notes,
            };
        });
    }


    // ✅ Méthodes pour les stats (aliases)
    async getPlantsSummary(userId: any): Promise<PlantsSummary> {
        return this.getPlantsOverview(userId, {});
    }

    async getNotificationsSummary(userId: any): Promise<NotificationsSummary> {
        return this.getNotificationsOverview(userId, {});
    }

    async getCareCompletionStats(userId: any, filters: DashboardStatsFiltersDto): Promise<any[]> {
        const careData = await this.getCareOverview(userId, {});
        return [{ date: new Date().toISOString().split('T')[0], completion_rate: careData.completion_rate }];
    }

    async getPlantHealthStats(userId: any, filters: DashboardStatsFiltersDto): Promise<any[]> {
        const actualUserId = this.extractUserId(userId);

        try {
            // ✅ CORRIGÉ - Utilise les vraies colonnes
            const { data: plants, error } = await this.supabase.client
                .from('plants')
                .select('id, name, care_level, species, created_at, last_watered, next_watering')
                .eq('user_id', actualUserId)
                .eq('is_active', true);

            if (error) {
                throw new BadRequestException(`Erreur health stats: ${error.message}`);
            }

            const today = new Date();

            // ✅ Retourne directement un tableau d'objets stats
            const stats = [
                // Stats par niveau de soin
                {
                    category: 'care_level',
                    type: 'easy',
                    count: plants?.filter(p => p.care_level === 'easy').length || 0,
                    label: 'Soins Faciles',
                    percentage: plants?.length ? Math.round((plants.filter(p => p.care_level === 'easy').length / plants.length) * 100) : 0
                },
                {
                    category: 'care_level',
                    type: 'medium',
                    count: plants?.filter(p => p.care_level === 'medium').length || 0,
                    label: 'Soins Moyens',
                    percentage: plants?.length ? Math.round((plants.filter(p => p.care_level === 'medium').length / plants.length) * 100) : 0
                },
                {
                    category: 'care_level',
                    type: 'hard',
                    count: plants?.filter(p => p.care_level === 'hard').length || 0,
                    label: 'Soins Difficiles',
                    percentage: plants?.length ? Math.round((plants.filter(p => p.care_level === 'hard').length / plants.length) * 100) : 0
                },

                // Stats d'arrosage
                {
                    category: 'watering',
                    type: 'up_to_date',
                    count: plants?.filter(p => {
                        if (!p.next_watering) return false;
                        return new Date(p.next_watering) > today;
                    }).length || 0,
                    label: 'Arrosage à jour',
                    percentage: 0 // Calculé ci-dessous
                },
                {
                    category: 'watering',
                    type: 'needs_watering',
                    count: plants?.filter(p => {
                        if (!p.next_watering) return false;
                        const nextWatering = new Date(p.next_watering);
                        const diffDays = Math.ceil((nextWatering.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return diffDays <= 0 && diffDays >= -2; // Aujourd'hui ou 1-2 jours de retard
                    }).length || 0,
                    label: 'Besoin d\'arrosage',
                    percentage: 0
                },
                {
                    category: 'watering',
                    type: 'overdue',
                    count: plants?.filter(p => {
                        if (!p.next_watering) return false;
                        const nextWatering = new Date(p.next_watering);
                        const diffDays = Math.ceil((nextWatering.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return diffDays < -2; // Plus de 2 jours de retard
                    }).length || 0,
                    label: 'Arrosage en retard',
                    percentage: 0
                },

                // Stats par espèce (top 3)
                ...this.getTopSpeciesStats(plants || [])
            ];

            // Calcul des pourcentages pour l'arrosage
            const wateringStats = stats.filter(s => s.category === 'watering');
            const totalWateringPlants = wateringStats.reduce((sum, stat) => sum + stat.count, 0);

            wateringStats.forEach(stat => {
                stat.percentage = totalWateringPlants > 0
                    ? Math.round((stat.count / totalWateringPlants) * 100)
                    : 0;
            });

            return stats;

        } catch (error) {
            console.error('Erreur getPlantHealthStats:', error);
            return [];
        }
    }

    // ✅ Méthode helper pour les stats par espèce
    private getTopSpeciesStats(plants: any[]): any[] {
        if (!plants.length) return [];

        // Compter les plantes par espèce
        const speciesCount = plants.reduce((acc, plant) => {
            const species = plant.species || 'Non spécifiée';
            acc[species] = (acc[species] || 0) + 1;
            return acc;
        }, {});

        // Prendre le top 3
        const topSpecies = Object.entries(speciesCount)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([species, count], index) => ({
                category: 'species',
                type: `species_${index + 1}`,
                count: count as number,
                label: species,
                percentage: Math.round(((count as number) / plants.length) * 100)
            }));

        return topSpecies;
    }


}
