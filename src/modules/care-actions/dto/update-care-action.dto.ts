/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCareActionDto } from './create-care-action.dto';
import {
    IsOptional,
    IsEnum,
    IsDateString,
    IsString,
    IsNumber,
    Min,
    MaxLength,
} from 'class-validator';
import { CareActionType } from '../entities/care-action.entity';

export class UpdateCareActionDto extends PartialType(CreateCareActionDto) {
    @IsOptional()
    @IsEnum(CareActionType)
    action_type?: CareActionType;

    @IsOptional()
    @IsDateString()
    date?: string;

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
