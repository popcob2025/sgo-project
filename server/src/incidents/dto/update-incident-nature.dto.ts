import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentNatureDto } from './create-incident-nature.dto';

// O UpdateDTO é um tipo parcial do CreateDTO (todos os campos são opcionais)
export class UpdateIncidentNatureDto extends PartialType(
  CreateIncidentNatureDto,
) {}