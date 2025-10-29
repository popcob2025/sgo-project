import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignResourcesDto {
  @IsUUID()
  @IsNotEmpty()
  incidentId: string;

  @IsArray()
  @IsUUID('all', { each: true }) // Valida que é um array de UUIDs
  @IsNotEmpty()
  resourceIds: string[];
}
