import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PriorityLevel } from '../../common/enums/priority-level.enum';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  callerName: string;

  @IsString()
  @IsNotEmpty()
  callerPhone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  addressNotes?: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  narrative: string;

  @IsEnum(PriorityLevel)
  priority: PriorityLevel;

  @IsUUID()
  protocolId: string;

  // TODO: Em um sistema de produção, o operatorId viria do Token JWT.
  // Por simplicidade, vamos passá-lo no DTO por enquanto.
  @IsUUID()
  operatorId: string;
}