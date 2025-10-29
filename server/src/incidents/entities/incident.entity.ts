import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { IncidentStatus } from '../../common/enums/incident-status.enum';
import { PriorityLevel } from '../../common/enums/priority-level.enum';
import { Protocol } from '../../protocols/entities/protocol.entity';
import { User } from '../../users/entities/user.entity';
import { Point } from 'geojson'; // Tipo para PostGIS

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  callerName: string;

  @Column()
  callerPhone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  addressNotes: string; // "Ponto de referência"

  // Coluna de Geografia (PostGIS)
  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326, // Padrão de coordenadas (GPS)
  })
  coordinates: Point;

  @Column({ type: 'text' })
  narrative: string; // A história que o operador digitou

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.AWAITING_DISPATCH,
  })
  status: IncidentStatus;

  @Column({
    type: 'enum',
    enum: PriorityLevel,
  })
  priority: PriorityLevel;

  // Relação: Qual protocolo foi usado?
  @ManyToOne(() => Protocol, { eager: true }) // eager: true carrega o protocolo
  protocol: Protocol;

  // Relação: Qual operador de triagem criou?
  @ManyToOne(() => User, { eager: true }) // eager: true carrega o operador
  triageOperator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}