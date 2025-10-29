import { Incident } from '../../incidents/entities/incident.entity';
import { Resource } from '../../resources/entities/resource.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('dispatch_assignments')
export class DispatchAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relação: Qual ocorrência?
  @ManyToOne(() => Incident, (incident) => incident.id, { eager: true })
  incident: Incident;

  // Relação: Qual recurso (viatura)?
  @ManyToOne(() => Resource, (resource) => resource.id, { eager: true })
  resource: Resource;

  @CreateDateColumn()
  assignedAt: Date; // Momento do despacho

  // Poderíamos adicionar 'onSceneAt', 'clearedAt', etc.,
  // mas por enquanto, os status da Ocorrência e Recurso controlam isso.
}