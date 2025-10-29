import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PriorityLevel } from '../../common/enums/priority-level.enum';

export class CreateIncidentNatureDto {
  @IsString()
  @IsNotEmpty()
  code: string; // Ex: "30101"

  @IsString()
  @IsNotEmpty()
  name: string; // Ex: "Atropelamento"

  @IsEnum(PriorityLevel)
  @IsNotEmpty()
  defaultPriority: PriorityLevel; // Ex: "red"
}