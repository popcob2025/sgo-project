import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';

// O UpdateDTO é opcional, mas útil para atualizações parciais
export class UpdateResourceDto extends PartialType(CreateResourceDto) {}