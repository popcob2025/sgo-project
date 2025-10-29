import { PriorityLevel } from '../../common/enums/priority-level.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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

  @CreateDateColumn()
  createdAt: Date;
}
