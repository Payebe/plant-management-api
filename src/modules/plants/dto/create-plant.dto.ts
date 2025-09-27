/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

export enum CareLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum SunlightRequirement {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum HumidityRequirement {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreatePlantDto {
  @IsString()
  name: string;

  @IsString()
  species: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  location: string;

  @IsInt()
  @Min(1)
  wateringFrequency: number;

  @IsEnum(CareLevel)
  careLevel: CareLevel;

  @IsEnum(SunlightRequirement)
  sunlightRequirement: SunlightRequirement;

  @IsEnum(HumidityRequirement)
  humidityRequirement: HumidityRequirement;

  @IsInt()
  @IsOptional()
  @Min(-50)
  @Max(50)
  temperatureMin?: number;

  @IsInt()
  @IsOptional()
  @Min(-50)
  @Max(50)
  temperatureMax?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
