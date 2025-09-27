/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
    @IsBoolean()
    @IsOptional()
    is_read?: boolean;

    @IsDateString()
    @IsOptional()
    read_at?: string;

    @IsDateString()
    @IsOptional()
    sent_at?: string;
}
