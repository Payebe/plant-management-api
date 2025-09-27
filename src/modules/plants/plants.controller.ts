/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { WaterPlantDto } from './dto/water-plant.dto';
import type { User } from '@supabase/supabase-js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('plants')
@Controller('plants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) { }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle plante' })
  @SwaggerApiResponse({ status: 201, description: 'Plante créée avec succès' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreatePlantDto,
  ): Promise<ApiResponse<any>> {
    const plant = await this.plantsService.create(dto, user.id); // ✅ dto en premier, user.id en second
    return {
      statusCode: 201,
      message: 'Plante créée avec succès',
      data: plant,
    };
  }


  @Get()
  @ApiOperation({ summary: "Récupérer toutes les plantes de l'utilisateur" })
  @ApiQuery({
    name: 'stats',
    required: false,
    description: 'Inclure les statistiques',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Liste des plantes récupérée',
  })
  async findAll(
    @CurrentUser() user: User,
    @Query('stats') includeStats?: string,
  ): Promise<ApiResponse<any>> {
    const plants = await this.plantsService.findByUser(
      user.id,
      includeStats === 'true',
    );
    return {
      statusCode: 200,
      message: 'Plantes récupérées avec succès',
      data: plants,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des plantes' })
  @SwaggerApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getStats(@CurrentUser() user: User): Promise<ApiResponse<any>> {
    const stats = await this.plantsService.getStats(user.id);
    return {
      statusCode: 200,
      message: 'Statistiques récupérées avec succès',
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une plante par ID' })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @SwaggerApiResponse({ status: 200, description: 'Plante récupérée' })
  @SwaggerApiResponse({ status: 404, description: 'Plante non trouvée' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const plant = await this.plantsService.findOne(user.id, id);
    return {
      statusCode: 200,
      message: 'Plante récupérée avec succès',
      data: plant,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une plante' })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @SwaggerApiResponse({ status: 200, description: 'Plante mise à jour' })
  @SwaggerApiResponse({ status: 404, description: 'Plante non trouvée' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePlantDto,
  ): Promise<ApiResponse<any>> {
    const plant = await this.plantsService.update(user.id, id, dto);
    return {
      statusCode: 200,
      message: 'Plante mise à jour avec succès',
      data: plant,
    };
  }

  @Post(':id/water')
  @ApiOperation({ summary: 'Arroser une plante' })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @SwaggerApiResponse({ status: 200, description: 'Plante arrosée' })
  @SwaggerApiResponse({ status: 404, description: 'Plante non trouvée' })
  async water(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: WaterPlantDto,
  ): Promise<ApiResponse<any>> {
    const plant = await this.plantsService.water(user.id, id, dto);
    return {
      statusCode: 200,
      message: 'Plante arrosée avec succès',
      data: plant,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une plante' })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @SwaggerApiResponse({ status: 200, description: 'Plante supprimée' })
  @SwaggerApiResponse({ status: 404, description: 'Plante non trouvée' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ApiResponse<null>> {
    await this.plantsService.remove(user.id, id);
    return {
      statusCode: 200,
      message: 'Plante supprimée avec succès',
      data: null,
    };
  }
}
