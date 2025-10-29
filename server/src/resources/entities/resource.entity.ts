import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ResourceType } from '../../common/enums/resource-type.enum';
import { ResourceStatus } from '../../common/enums/resource-status.enum';
import { Point } from 'geojson';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nome/Identificador da viatura (ex: "UR-101", "ABT-05")
  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ResourceType })
  type: ResourceType;

  @Column({ type: 'enum', enum: ResourceStatus, default: ResourceStatus.AVAILABLE })
  status: ResourceStatus;

  // Localização atual da viatura (essencial para o mapa do despachante)
  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true, // Pode ser nulo se a viatura não tiver GPS
  })
  currentLocation: Point;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}