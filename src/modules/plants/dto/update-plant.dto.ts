/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger';
import { CreatePlantDto } from './create-plant.dto';

export class UpdatePlantDto extends PartialType(CreatePlantDto) { }
