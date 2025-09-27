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
import { CreateCareActionDto } from './dto/create-care-action.dto';
import { UpdateCareActionDto } from './dto/update-care-action.dto';
import { QueryCareActionsDto } from './dto/query-care-actions.dto';
import {
    CareActionType,
} from './entities/care-action.entity';
import {
    CareActionStats,
    CareActionResponse,
} from './interfaces/care-action.interface';

@Injectable()
export class CareActionsService {
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

    async create(userId: any, dto: CreateCareActionDto): Promise<CareActionResponse> {
        try {
            const actualUserId = this.extractUserId(userId);

            console.log('🔍 Debug - userId corrigé:', {
                original: userId,
                actualUserId,
                type: typeof actualUserId
            });

            // Vérifier que la plante existe et appartient à l'utilisateur
            const { data: plant, error: plantError } = await this.supabase.client
                .from('plants')
                .select('id, user_id')
                .eq('id', dto.plant_id)
                .eq('user_id', actualUserId)
                .single();

            if (plantError || !plant) {
                throw new BadRequestException('Plante non trouvée ou non autorisée');
            }

            // Préparer les données
            const careActionData = {
                user_id: actualUserId,
                plant_id: dto.plant_id,
                action_type: dto.action_type,
                date: dto.date || new Date().toISOString(),
                notes: dto.notes || null,
                quantity: dto.quantity || null,
                next_action_date: dto.next_action_date || null,
            };

            // Insérer l'action de soin
            const { data, error } = await this.supabase.client
                .from('care_actions')
                .insert(careActionData)
                .select(`
                id,
                user_id,
                plant_id,
                action_type,
                date,
                notes,
                quantity,
                next_action_date,
                created_at,
                updated_at,
                plants!inner(name, species)
            `)
                .single();

            if (error) {
                throw new BadRequestException('Erreur lors de la création de l\'action');
            }

            return data;

        } catch (error) {
            console.error('❌ Service error:', error);
            throw error;
        }
    }

    async findAll(
        userId: any, // ✅ CORRECTION : Changer le type
        queryDto: QueryCareActionsDto,
    ): Promise<CareActionResponse[]> {
        try {
            const actualUserId = this.extractUserId(userId); // ✅ CORRECTION

            let query = this.supabase.client
                .from('care_actions')
                .select(
                    `
                    *,
                    plants!inner(id, name, species)
                    `,
                )
                .eq('user_id', actualUserId) // ✅ CORRECTION
                .order('date', { ascending: false });

            // Filtres optionnels
            if (queryDto.plant_id) {
                query = query.eq('plant_id', queryDto.plant_id);
            }

            if (queryDto.action_type) {
                query = query.eq('action_type', queryDto.action_type);
            }

            if (queryDto.date_from) {
                query = query.gte('date', queryDto.date_from);
            }

            if (queryDto.date_to) {
                query = query.lte('date', queryDto.date_to);
            }

            // Pagination
            const limit = Math.min(queryDto.limit || 50, 100);
            const offset = queryDto.offset || 0;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                console.error('❌ findAll error:', error); // ✅ AJOUT : Debug
                throw new BadRequestException(
                    'Erreur lors de la récupération des actions de soin',
                );
            }

            // Reformater la réponse
            return data.map((action) => ({
                ...action,
                plant: action.plants
                    ? {
                        id: action.plants.id,
                        name: action.plants.name,
                        species: action.plants.species,
                    }
                    : undefined,
            }));
        } catch (error) {
            console.error('❌ Service findAll error:', error);
            throw error;
        }
    }

    async findOne(userId: any, id: string): Promise<CareActionResponse> { // ✅ CORRECTION
        try {
            const actualUserId = this.extractUserId(userId); // ✅ CORRECTION

            const { data, error } = await this.supabase.client
                .from('care_actions')
                .select(
                    `
                    *,
                    plants!inner(id, name, species)
                    `,
                )
                .eq('id', id)
                .eq('user_id', actualUserId) // ✅ CORRECTION
                .single();

            if (error || !data) {
                throw new NotFoundException('Action de soin non trouvée');
            }

            return {
                ...data,
                plant: data.plants
                    ? {
                        id: data.plants.id,
                        name: data.plants.name,
                        species: data.plants.species,
                    }
                    : undefined,
            };
        } catch (error) {
            console.error('❌ Service findOne error:', error);
            throw error;
        }
    }

    async update(
        userId: any, // ✅ CORRECTION
        id: string,
        updateCareActionDto: UpdateCareActionDto,
    ): Promise<CareActionResponse> {
        try {
            const actualUserId = this.extractUserId(userId); // ✅ CORRECTION

            // Vérifier que l'action appartient à l'utilisateur
            await this.findOne(actualUserId, id); // ✅ CORRECTION

            const { data, error } = await this.supabase.client
                .from('care_actions')
                .update({
                    ...updateCareActionDto,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('user_id', actualUserId) // ✅ CORRECTION
                .select(
                    `
                    *,
                    plants!inner(id, name, species)
                    `,
                )
                .single();

            if (error) {
                throw new BadRequestException(
                    "Erreur lors de la mise à jour de l'action de soin",
                );
            }

            return {
                ...data,
                plant: data.plants
                    ? {
                        id: data.plants.id,
                        name: data.plants.name,
                        species: data.plants.species,
                    }
                    : undefined,
            };
        } catch (error) {
            console.error('❌ Service update error:', error);
            throw error;
        }
    }

    async remove(userId: any, id: string): Promise<void> { // ✅ CORRECTION
        try {
            const actualUserId = this.extractUserId(userId); // ✅ CORRECTION

            // Vérifier que l'action appartient à l'utilisateur
            await this.findOne(actualUserId, id); // ✅ CORRECTION

            const { error } = await this.supabase.client
                .from('care_actions')
                .delete()
                .eq('id', id)
                .eq('user_id', actualUserId); // ✅ CORRECTION

            if (error) {
                throw new BadRequestException(
                    "Erreur lors de la suppression de l'action de soin",
                );
            }
        } catch (error) {
            console.error('❌ Service remove error:', error);
            throw error;
        }
    }

    async getStats(userId: any): Promise<CareActionStats> { // ✅ CORRECTION
        try {
            const actualUserId = this.extractUserId(userId); // ✅ CORRECTION

            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Total des actions
            const { data: totalActions, error: totalError } = await this.supabase.client
                .from('care_actions')
                .select('id', { count: 'exact' })
                .eq('user_id', actualUserId); // ✅ CORRECTION

            // Actions cette semaine
            const { data: weekActions, error: weekError } = await this.supabase.client
                .from('care_actions')
                .select('id', { count: 'exact' })
                .eq('user_id', actualUserId) // ✅ CORRECTION
                .gte('date', weekAgo.toISOString());

            // Actions ce mois
            const { data: monthActions, error: monthError } = await this.supabase.client
                .from('care_actions')
                .select('id', { count: 'exact' })
                .eq('user_id', actualUserId) // ✅ CORRECTION
                .gte('date', monthAgo.toISOString());

            // Actions par type
            const { data: actionsByType, error: typeError } = await this.supabase.client
                .from('care_actions')
                .select('action_type')
                .eq('user_id', actualUserId); // ✅ CORRECTION

            // Plantes les plus actives avec jointure correcte
            const { data: plantStats, error: plantError } = await this.supabase.client
                .from('care_actions')
                .select(`
                plant_id,
                plants!inner(name)
            `)
                .eq('user_id', actualUserId); // ✅ CORRECTION

            // Actions à venir avec jointure correcte
            const { data: upcomingActions, error: upcomingError } = await this.supabase.client
                .from('care_actions')
                .select(`
                plant_id,
                action_type,
                next_action_date,
                plants!inner(name)
            `)
                .eq('user_id', actualUserId) // ✅ CORRECTION
                .not('next_action_date', 'is', null)
                .gte('next_action_date', now.toISOString())
                .order('next_action_date', { ascending: true })
                .limit(10);

            if (
                totalError ||
                weekError ||
                monthError ||
                typeError ||
                plantError ||
                upcomingError
            ) {
                console.error('❌ Stats errors:', {
                    totalError,
                    weekError,
                    monthError,
                    typeError,
                    plantError,
                    upcomingError
                });
                throw new BadRequestException(
                    'Erreur lors de la récupération des statistiques',
                );
            }

            // Compter les actions par type
            const actionTypeCount: Record<CareActionType, number> = {
                [CareActionType.WATERING]: 0,
                [CareActionType.FERTILIZING]: 0,
                [CareActionType.REPOTTING]: 0,
                [CareActionType.PRUNING]: 0,
                [CareActionType.PEST_TREATMENT]: 0,
                [CareActionType.OTHER]: 0,
            };

            actionsByType?.forEach((action) => {
                actionTypeCount[action.action_type as CareActionType]++;
            });

            // Compter les actions par plante
            const plantActionCount: Record<string, { name: string; count: number }> = {};

            plantStats?.forEach((stat: any) => {
                if (!plantActionCount[stat.plant_id]) {
                    plantActionCount[stat.plant_id] = {
                        name: stat.plants?.name || 'Plante inconnue',
                        count: 0,
                    };
                }
                plantActionCount[stat.plant_id].count++;
            });

            const mostActivePlants = Object.entries(plantActionCount)
                .map(([plant_id, { name, count }]) => ({
                    plant_id,
                    plant_name: name,
                    action_count: count,
                }))
                .sort((a, b) => b.action_count - a.action_count)
                .slice(0, 5);

            return {
                total_actions: totalActions?.length || 0,
                actions_this_week: weekActions?.length || 0,
                actions_this_month: monthActions?.length || 0,
                actions_by_type: actionTypeCount,
                most_active_plants: mostActivePlants,
                upcoming_actions:
                    upcomingActions?.map((action: any) => ({
                        plant_id: action.plant_id,
                        plant_name: action.plants?.name || 'Plante inconnue',
                        action_type: action.action_type,
                        next_date: action.next_action_date,
                    })) || [],
            };
        } catch (error) {
            console.error('❌ Service getStats error:', error);
            throw error;
        }
    }
}
