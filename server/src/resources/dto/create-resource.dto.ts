import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { ResourceType } from '../../common/enums/resource-type.enum';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  // Posição inicial (ex: o quartel)
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;
}