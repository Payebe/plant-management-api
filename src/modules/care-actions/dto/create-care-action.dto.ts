/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
    IsEnum,
    IsString,
    IsUUID,
    IsOptional,
    IsDateString,
    IsNumber,
    Min,
    MaxLength,
} from 'class-validator';
import { CareActionType } from '../entities/care-action.entity';

export class CreateCareActionDto {
    @IsUUID()
    plant_id: string;

    @IsEnum(CareActionType)
    action_type: CareActionType;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @IsOptional()
    @IsDateString()
    next_action_date?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;
}
