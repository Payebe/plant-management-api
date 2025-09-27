/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WaterPlantDto {
    @ApiPropertyOptional({ description: 'Date d\'arrosage (ISO string)', example: '2024-01-15T10:00:00Z' })
    @IsOptional()
    @IsDateString()
    watered_at?: string;

    @ApiPropertyOptional({ description: 'Notes sur l\'arrosage' })
    @IsOptional()
    @IsString()
    notes?: string;
}
