/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CareActionsService } from './care-actions.service';
import { CreateCareActionDto } from './dto/create-care-action.dto';
import { UpdateCareActionDto } from './dto/update-care-action.dto';
import { QueryCareActionsDto } from './dto/query-care-actions.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { CareActionResponse, CareActionStats } from './interfaces/care-action.interface';

@Controller('care-actions')
@UseGuards(JwtAuthGuard)
export class CareActionsController {
    constructor(private readonly careActionsService: CareActionsService) { }

    @Post()
    async create(
        @CurrentUser('sub') userId: string,
        @Body() createCareActionDto: CreateCareActionDto,
    ): Promise<ApiResponse<CareActionResponse>> {
        const careAction = await this.careActionsService.create(userId, createCareActionDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Action de soin créée avec succès',
            data: careAction,
        };
    }

    @Get()
    async findAll(
        @CurrentUser('sub') userId: string,
        @Query() queryDto: QueryCareActionsDto,
    ): Promise<ApiResponse<CareActionResponse[]>> {
        const careActions = await this.careActionsService.findAll(userId, queryDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Actions de soin récupérées avec succès',
            data: careActions,
        };
    }

    @Get('stats')
    async getStats(
        @CurrentUser('sub') userId: string,
    ): Promise<ApiResponse<CareActionStats>> {
        const stats = await this.careActionsService.getStats(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Statistiques récupérées avec succès',
            data: stats,
        };
    }

    @Get(':id')
    async findOne(
        @CurrentUser('sub') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ApiResponse<CareActionResponse>> {
        const careAction = await this.careActionsService.findOne(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Action de soin récupérée avec succès',
            data: careAction,
        };
    }

    @Patch(':id')
    async update(
        @CurrentUser('sub') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCareActionDto: UpdateCareActionDto,
    ): Promise<ApiResponse<CareActionResponse>> {
        const careAction = await this.careActionsService.update(userId, id, updateCareActionDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Action de soin mise à jour avec succès',
            data: careAction,
        };
    }

    @Delete(':id')
    async remove(
        @CurrentUser('sub') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ApiResponse<null>> {
        await this.careActionsService.remove(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Action de soin supprimée avec succès',
            data: null,
        };
    }
}
