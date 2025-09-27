/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import {
    NotificationType,
    NotificationPriority,
} from './entities/notification.entity';
import {
    NotificationResponse,
    NotificationStats,
    UpdateNotificationResponse,
    PaginationResponse,
} from './interfaces/notification.interface';

@Injectable()
export class NotificationsService {
    constructor(private readonly supabase: SupabaseService) { }

    // ✅ HELPER : Fonction utilitaire pour extraire l'userId
    private extractUserId(userId: any): string {
        if (typeof userId === 'string') {
            return userId;
        } else if (userId && typeof userId === 'object' && 'id' in userId) {
            return userId.id;
        } else {
            throw new BadRequestException('Invalid user ID format');
        }
    }

    async create(userId: any, dto: CreateNotificationDto): Promise<NotificationResponse> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - Create notification:', {
                userId: actualUserId,
                dto
            });

            // Vérifier que la plante existe si plant_id est fourni
            if (dto.plant_id) {
                const { data: plant, error: plantError } = await this.supabase.client
                    .from('plants')
                    .select('id')
                    .eq('id', dto.plant_id)
                    .eq('user_id', actualUserId)
                    .single();

                if (plantError || !plant) {
                    throw new BadRequestException('Plante non trouvée ou non autorisée');
                }
            }

            // Préparer les données
            const notificationData = {
                user_id: actualUserId,
                plant_id: dto.plant_id || null,
                care_action_id: dto.care_action_id || null,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                priority: dto.priority || NotificationPriority.MEDIUM,
                is_read: dto.is_read || false,
                scheduled_for: dto.scheduled_for || new Date().toISOString(),
                metadata: dto.metadata || null,
            };

            console.log('📤 Supabase insert data:', notificationData);

            const { data, error } = await this.supabase.client
                .from('notifications')
                .insert([notificationData])
                .select(`
                *,
                plant:plants(name)
            `)
                .single();

            if (error) {
                console.error('❌ Supabase insert error:', error);
                throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
            }

            console.log('✅ Notification créée:', data);

            // 🔥 RETOURNER DIRECTEMENT LA NOTIFICATION
            return data;
        } catch (error) {
            console.error('❌ Service create error:', error);
            throw error;
        }
    }


    async findAll(userId: any, query: QueryNotificationsDto): Promise<{
        data: NotificationResponse[];
        pagination?: PaginationResponse;
    }> {
        try {
            const actualUserId = this.extractUserId(userId);
            const page = query.page || 1;
            const limit = query.limit || 20;
            const offset = (page - 1) * limit;

            console.log('🔍 Debug - Query notifications:', {
                userId: actualUserId,
                query,
                pagination: { page, limit, offset }
            });

            // Construction de la requête
            let supabaseQuery = this.supabase.client
                .from('notifications')
                .select(`
          *,
          plant:plants(name)
        `)
                .eq('user_id', actualUserId);

            // Filtres optionnels
            if (query.type) {
                supabaseQuery = supabaseQuery.eq('type', query.type);
            }

            if (query.priority) {
                supabaseQuery = supabaseQuery.eq('priority', query.priority);
            }

            if (query.plant_id) {
                supabaseQuery = supabaseQuery.eq('plant_id', query.plant_id);
            }

            if (typeof query.is_read === 'boolean') {
                supabaseQuery = supabaseQuery.eq('is_read', query.is_read);
            }

            if (query.start_date) {
                supabaseQuery = supabaseQuery.gte('scheduled_for', query.start_date);
            }

            if (query.end_date) {
                supabaseQuery = supabaseQuery.lte('scheduled_for', query.end_date);
            }

            if (query.overdue) {
                const now = new Date().toISOString();
                supabaseQuery = supabaseQuery
                    .lt('scheduled_for', now)
                    .eq('is_read', false);
            }

            // Comptage total pour la pagination
            const countQuery = this.supabase.client
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', actualUserId);

            // Appliquer les mêmes filtres pour le count
            if (query.type) countQuery.eq('type', query.type);
            if (query.priority) countQuery.eq('priority', query.priority);
            if (query.plant_id) countQuery.eq('plant_id', query.plant_id);
            if (typeof query.is_read === 'boolean') countQuery.eq('is_read', query.is_read);
            if (query.start_date) countQuery.gte('scheduled_for', query.start_date);
            if (query.end_date) countQuery.lte('scheduled_for', query.end_date);
            if (query.overdue) {
                const now = new Date().toISOString();
                countQuery.lt('scheduled_for', now).eq('is_read', false);
            }

            // Tri et pagination
            const sortBy = query.sort_by || 'created_at';
            const sortOrder = query.sort_order || 'desc';

            supabaseQuery = supabaseQuery
                .order(sortBy, { ascending: sortOrder === 'asc' })
                .range(offset, offset + limit - 1);

            // Exécution des requêtes
            const [{ data, error }, { count, error: countError }] = await Promise.all([
                supabaseQuery,
                countQuery,
            ]);

            if (error || countError) {
                console.error('❌ Supabase query error:', error || countError);
                throw new BadRequestException('Erreur lors de la récupération des notifications');
            }

            console.log('✅ Notifications trouvées:', {
                count: data?.length,
                total: count,
            });

            // Transformation des données
            const notifications: NotificationResponse[] = data?.map((notification: any) => ({
                id: notification.id,
                user_id: notification.user_id,
                plant_id: notification.plant_id,
                plant_name: notification.plant?.name || null,
                care_action_id: notification.care_action_id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                priority: notification.priority,
                is_read: notification.is_read,
                scheduled_for: notification.scheduled_for,
                sent_at: notification.sent_at,
                read_at: notification.read_at,
                metadata: notification.metadata,
                created_at: notification.created_at,
                updated_at: notification.updated_at,
            })) || [];

            const totalPages = Math.ceil((count || 0) / limit);

            const result = {
                data: notifications,
                ...(query.page && {
                    pagination: {
                        page,
                        limit,
                        total: count || 0,
                        totalPages,
                    },
                }),
            };

            return result;
        } catch (error) {
            console.error('❌ Service findAll error:', error);
            throw error;
        }
    }

    async findOne(userId: any, id: string): Promise<NotificationResponse> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - Find notification:', { userId: actualUserId, id });

            const { data, error } = await this.supabase.client
                .from('notifications')
                .select(`
          *,
          plant:plants(name)
        `)
                .eq('id', id)
                .eq('user_id', actualUserId)
                .single();

            if (error || !data) {
                console.error('❌ Notification not found:', error);
                throw new NotFoundException('Notification non trouvée');
            }

            console.log('✅ Notification trouvée:', data);

            return {
                id: data.id,
                user_id: data.user_id,
                plant_id: data.plant_id,
                plant_name: data.plant?.name || null,
                care_action_id: data.care_action_id,
                type: data.type,
                title: data.title,
                message: data.message,
                priority: data.priority,
                is_read: data.is_read,
                scheduled_for: data.scheduled_for,
                sent_at: data.sent_at,
                read_at: data.read_at,
                metadata: data.metadata,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error) {
            console.error('❌ Service findOne error:', error);
            throw error;
        }
    }

    async update(userId: any, id: string, dto: UpdateNotificationDto): Promise<UpdateNotificationResponse> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - Update notification:', { userId: actualUserId, id, dto });

            // Vérifier que la notification existe
            await this.findOne(actualUserId, id);

            const updateData = { ...dto };

            // Si on marque comme lu, ajouter read_at
            if (dto.is_read === true && !dto.read_at) {
                updateData.read_at = new Date().toISOString();
            }

            const { data, error } = await this.supabase.client
                .from('notifications')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', actualUserId)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase update error:', error);
                throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
            }

            console.log('✅ Notification mise à jour:', data);

            return {
                id: data.id,
                message: 'Notification mise à jour avec succès',
            };
        } catch (error) {
            console.error('❌ Service update error:', error);
            throw error;
        }
    }

    async remove(userId: any, id: string): Promise<{ message: string }> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - Delete notification:', { userId: actualUserId, id });

            // Vérifier que la notification existe
            await this.findOne(actualUserId, id);

            const { error } = await this.supabase.client
                .from('notifications')
                .delete()
                .eq('id', id)
                .eq('user_id', actualUserId);

            if (error) {
                console.error('❌ Supabase delete error:', error);
                throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
            }

            console.log('✅ Notification supprimée');

            return {
                message: 'Notification supprimée avec succès',
            };
        } catch (error) {
            console.error('❌ Service remove error:', error);
            throw error;
        }
    }

    async markAsRead(userId: any, id: string): Promise<UpdateNotificationResponse> {
        try {
            console.log('🔍 Debug - Mark as read:', { userId, id });

            return await this.update(userId, id, {
                is_read: true,
                read_at: new Date().toISOString(),
            });
        } catch (error) {
            console.error('❌ Service markAsRead error:', error);
            throw error;
        }
    }

    async getUnreadCount(userId: any): Promise<{ count: number }> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - Get unread count:', { userId: actualUserId });

            const { count, error } = await this.supabase.client
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', actualUserId)
                .eq('is_read', false);

            if (error) {
                console.error('❌ Supabase count error:', error);
                throw new BadRequestException('Erreur lors du comptage');
            }

            console.log('✅ Unread count:', count);

            return {
                count: count || 0,
            };
        } catch (error) {
            console.error('❌ Service getUnreadCount error:', error);
            throw error;
        }
    }

    async getStats(userId: any): Promise<NotificationStats> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - Get stats:', { userId: actualUserId });

            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

            // Requêtes parallèles pour les statistiques
            const [
                { data: allNotifications, error: allError },
                { count: unreadCount, error: unreadError },
                { count: overdueCount, error: overdueError },
                { count: todayCount, error: todayError },
                { count: weekCount, error: weekError },
            ] = await Promise.all([
                // Toutes les notifications pour les types et priorités
                this.supabase.client
                    .from('notifications')
                    .select('type, priority')
                    .eq('user_id', actualUserId),

                // Non lues
                this.supabase.client
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', actualUserId)
                    .eq('is_read', false),

                // En retard
                this.supabase.client
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', actualUserId)
                    .eq('is_read', false)
                    .lt('scheduled_for', now.toISOString()),

                // Aujourd'hui
                this.supabase.client
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', actualUserId)
                    .gte('scheduled_for', startOfToday.toISOString())
                    .lt('scheduled_for', new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000).toISOString()),

                // Cette semaine
                this.supabase.client
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', actualUserId)
                    .gte('scheduled_for', startOfWeek.toISOString()),
            ]);

            if (allError || unreadError || overdueError || todayError || weekError) {
                throw new BadRequestException('Erreur lors de la récupération des statistiques');
            }

            // Compter par type
            const notificationsByType: Record<NotificationType, number> = {
                [NotificationType.WATERING_REMINDER]: 0,
                [NotificationType.FERTILIZING_REMINDER]: 0,
                [NotificationType.REPOTTING_REMINDER]: 0,
                [NotificationType.PRUNING_REMINDER]: 0,
                [NotificationType.PEST_TREATMENT_REMINDER]: 0,
                [NotificationType.CARE_OVERDUE]: 0,
                [NotificationType.PLANT_HEALTH_ALERT]: 0,
                [NotificationType.SYSTEM_NOTIFICATION]: 0,
            };

            allNotifications?.forEach((notification: any) => {
                if (notification.type in notificationsByType) {
                    notificationsByType[notification.type as NotificationType]++;
                }
            });

            // Compter par priorité
            const notificationsByPriority: Record<NotificationPriority, number> = {
                [NotificationPriority.LOW]: 0,
                [NotificationPriority.MEDIUM]: 0,
                [NotificationPriority.HIGH]: 0,
                [NotificationPriority.URGENT]: 0,
            };

            allNotifications?.forEach((notification: any) => {
                if (notification.priority in notificationsByPriority) {
                    notificationsByPriority[notification.priority as NotificationPriority]++;
                }
            });

            return {
                total_notifications: allNotifications?.length || 0,
                unread_count: unreadCount || 0,
                notifications_by_type: notificationsByType,
                notifications_by_priority: notificationsByPriority,
                overdue_count: overdueCount || 0,
                today_count: todayCount || 0,
                this_week_count: weekCount || 0,
            };
        } catch (error) {
            console.error('❌ Service getStats error:', error);
            throw error;
        }
    }
}
