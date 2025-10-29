import { PriorityLevel } from '../../common/enums/priority-level.enum';
import { Protocol } from '../../protocols/entities/protocol.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('incident_natures')
export class IncidentNature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // O "código" da ocorrência, ex: "30101"
  @Column({ unique: true })
  code: string;

  @Column()
  name: string; // Ex: "Atropelamento"

  @Column({
    type: 'enum',
    enum: PriorityLevel,
    default: PriorityLevel.YELLOW,
  })
  defaultPriority: PriorityLevel;

  // Define a relação 1-para-1 com um Protocolo
  @OneToOne(() => Protocol, (protocol) => protocol.incidentNature)
  protocol: Protocol;

  @CreateDateColumn()
  createdAt: Date;
}