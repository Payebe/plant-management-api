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
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import {
    NotificationResponse,
    NotificationStats,
    CreateNotificationResponse,
    UpdateNotificationResponse,
} from './interfaces/notification.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    async create(
        @CurrentUser() userId: string,
        @Body() createNotificationDto: CreateNotificationDto,
    ): Promise<ApiResponse<CreateNotificationResponse>> {
        const data = await this.notificationsService.create(userId, createNotificationDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Notification créée avec succès',
            data,
        };
    }

    @Get()
    async findAll(
        @CurrentUser() userId: string,
        @Query() query: QueryNotificationsDto,
    ): Promise<ApiResponse<NotificationResponse[]>> {
        const result = await this.notificationsService.findAll(userId, query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Notifications récupérées avec succès',
            data: result.data,
        };
    }

    @Get('stats')
    async getStats(
        @CurrentUser() userId: string,
    ): Promise<ApiResponse<NotificationStats>> {
        const data = await this.notificationsService.getStats(userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Statistiques des notifications récupérées avec succès',
            data,
        };
    }

    @Get('unread-count')
    async getUnreadCount(
        @CurrentUser() userId: string,
    ): Promise<ApiResponse<{ count: number }>> {
        const data = await this.notificationsService.getUnreadCount(userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Nombre de notifications non lues récupéré avec succès',
            data,
        };
    }

    @Get(':id')
    async findOne(
        @CurrentUser() userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ApiResponse<NotificationResponse>> {
        const data = await this.notificationsService.findOne(userId, id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Notification récupérée avec succès',
            data,
        };
    }

    @Patch(':id')
    async update(
        @CurrentUser() userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateNotificationDto: UpdateNotificationDto,
    ): Promise<ApiResponse<UpdateNotificationResponse>> {
        const data = await this.notificationsService.update(userId, id, updateNotificationDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Notification mise à jour avec succès',
            data,
        };
    }

    @Patch(':id/read')
    async markAsRead(
        @CurrentUser() userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ApiResponse<UpdateNotificationResponse>> {
        const data = await this.notificationsService.markAsRead(userId, id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Notification marquée comme lue avec succès',
            data,
        };
    }

    @Delete(':id')
    async remove(
        @CurrentUser() userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ApiResponse<{ message: string }>> {
        const data = await this.notificationsService.remove(userId, id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Notification supprimée avec succès',
            data,
        };
    }
}
