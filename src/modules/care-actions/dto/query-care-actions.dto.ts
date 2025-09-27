/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { CareActionType } from '../entities/care-action.entity';

export class QueryCareActionsDto {
    @IsOptional()
    @IsUUID()
    plant_id?: string;

    @IsOptional()
    @IsEnum(CareActionType)
    action_type?: CareActionType;

    @IsOptional()
    @IsDateString()
    date_from?: string;

    @IsOptional()
    @IsDateString()
    date_to?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    limit?: number = 50;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    offset?: number = 0;
}
