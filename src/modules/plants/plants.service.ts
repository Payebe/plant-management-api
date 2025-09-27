/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { WaterPlantDto } from './dto/water-plant.dto';
import type { Plant, PlantWithStats, PlantStats } from './interfaces/plant.interface';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PlantsService {
  constructor(private readonly supabase: SupabaseService) { }

  // Créer une nouvelle plante
  async create(createPlantDto: CreatePlantDto, userId: string): Promise<Plant> {
    const plantData = {
      name: createPlantDto.name,
      species: createPlantDto.species,
      description: createPlantDto.description,
      image_url: createPlantDto.imageUrl, // camelCase → snake_case
      location: createPlantDto.location,
      watering_frequency: createPlantDto.wateringFrequency, // camelCase → snake_case
      care_level: createPlantDto.careLevel, // camelCase → snake_case
      sunlight_requirement: createPlantDto.sunlightRequirement, // camelCase → snake_case
      humidity_requirement: createPlantDto.humidityRequirement, // camelCase → snake_case
      temperature_min: createPlantDto.temperatureMin, // camelCase → snake_case
      temperature_max: createPlantDto.temperatureMax, // camelCase → snake_case
      notes: createPlantDto.notes,
      user_id: userId,
      next_watering: new Date(Date.now() + createPlantDto.wateringFrequency * 24 * 60 * 60 * 1000)
    };

    const { data, error } = await this.supabase.client // ✅ Utilise .client
      .from('plants')
      .insert(plantData)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }

    return data;
  }

  // Récupérer toutes les plantes d'un utilisateur
  async findByUser(userId: string, includeStats = false): Promise<Plant[] | PlantWithStats[]> {
    const query = this.supabase.client
      .from('plants')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Erreur lors de la récupération: ${error.message}`);
    }

    if (!includeStats) {
      return data || [];
    }

    // Ajouter les statistiques pour chaque plante
    const plantsWithStats: PlantWithStats[] = (data || []).map(plant => {
      const daysSinceLastWatered = plant.last_watered
        ? Math.floor((Date.now() - new Date(plant.last_watered).getTime()) / (24 * 60 * 60 * 1000))
        : null;

      const daysUntilNextWatering = plant.next_watering
        ? Math.floor((new Date(plant.next_watering).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : 0;

      let wateringStatus: 'ok' | 'due' | 'overdue' = 'ok';
      if (daysUntilNextWatering <= 0) {
        wateringStatus = 'overdue';
      } else if (daysUntilNextWatering <= 1) {
        wateringStatus = 'due';
      }

      return {
        ...plant,
        days_since_last_watered: daysSinceLastWatered,
        watering_status: wateringStatus,
        care_logs_count: 0, // À implémenter avec le module care-logs
      };
    });

    return plantsWithStats;
  }

  // Récupérer une plante par ID
  async findOne(userId: string, id: string): Promise<PlantWithStats> {
    const { data, error } = await this.supabase.client
      .from('plants')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new NotFoundException('Plante non trouvée');
    }

    // Calculer les statistiques
    const daysSinceLastWatered = data.last_watered
      ? Math.floor((Date.now() - new Date(data.last_watered).getTime()) / (24 * 60 * 60 * 1000))
      : null;

    const daysUntilNextWatering = data.next_watering
      ? Math.floor((new Date(data.next_watering).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : 0;

    let wateringStatus: 'ok' | 'due' | 'overdue' = 'ok';
    if (daysUntilNextWatering <= 0) {
      wateringStatus = 'overdue';
    } else if (daysUntilNextWatering <= 1) {
      wateringStatus = 'due';
    }

    return {
      ...data,
      days_since_last_watered: daysSinceLastWatered,
      watering_status: wateringStatus,
      care_logs_count: 0, // À implémenter
    };
  }

  // Mettre à jour une plante
  // Mettre à jour une plante
  async update(userId: string, id: string, dto: UpdatePlantDto): Promise<Plant> {
    // Vérifier que la plante appartient à l'utilisateur
    await this.findOne(userId, id);

    // Mapping camelCase → snake_case pour les champs modifiés
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.species !== undefined) updateData.species = dto.species;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.wateringFrequency !== undefined) updateData.watering_frequency = dto.wateringFrequency;
    if (dto.careLevel !== undefined) updateData.care_level = dto.careLevel;
    if (dto.sunlightRequirement !== undefined) updateData.sunlight_requirement = dto.sunlightRequirement;
    if (dto.humidityRequirement !== undefined) updateData.humidity_requirement = dto.humidityRequirement;
    if (dto.temperatureMin !== undefined) updateData.temperature_min = dto.temperatureMin;
    if (dto.temperatureMax !== undefined) updateData.temperature_max = dto.temperatureMax;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    // Recalculer next_watering si watering_frequency a changé
    if (dto.wateringFrequency) {
      const { data: currentPlant } = await this.supabase.client
        .from('plants')
        .select('last_watered')
        .eq('id', id)
        .single();

      const baseDate = currentPlant?.last_watered ? new Date(currentPlant.last_watered) : new Date();
      updateData.next_watering = new Date(baseDate.getTime() + dto.wateringFrequency * 24 * 60 * 60 * 1000).toISOString();
    }

    const { data, error } = await this.supabase.client
      .from('plants')  // ✅ Ligne corrigée !
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }

    return data;
  }

  // Arroser une plante
  async water(userId: string, id: string, dto: WaterPlantDto = {}): Promise<Plant> {
    const plant = await this.findOne(userId, id);

    const wateredAt = dto.watered_at ? new Date(dto.watered_at) : new Date();
    const nextWatering = new Date(wateredAt.getTime() + plant.watering_frequency * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase.client
      .from('plants')
      .update({
        last_watered: wateredAt.toISOString(),
        next_watering: nextWatering.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erreur lors de l'arrosage: ${error.message}`);
    }

    // TODO: Créer un log d'arrosage dans care_logs

    return data;
  }

  // Supprimer une plante (soft delete)
  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    const { error } = await this.supabase.client
      .from('plants')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Récupérer les statistiques des plantes
  async getStats(userId: string): Promise<PlantStats> {
    const plants = await this.findByUser(userId, true) as PlantWithStats[];

    const stats: PlantStats = {
      total_plants: plants.length,
      plants_needing_water: plants.filter(p => p.watering_status === 'due' || p.watering_status === 'overdue').length,
      plants_watered_today: plants.filter(p => {
        if (!p.last_watered) return false;
        const today = new Date().toDateString();
        const wateredDate = new Date(p.last_watered).toDateString();
        return today === wateredDate;
      }).length,
      plants_by_care_level: {
        easy: plants.filter(p => p.care_level === 'easy').length,
        medium: plants.filter(p => p.care_level === 'medium').length,
        hard: plants.filter(p => p.care_level === 'hard').length,
      },
    };

    return stats;
  }
}
