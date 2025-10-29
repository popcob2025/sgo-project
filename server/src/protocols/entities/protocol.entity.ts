import { IncidentNature } from '../../incidents/entities/incident-nature.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('protocols')
export class Protocol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relação 1-para-1: Qual "Natureza" este protocolo descreve?
  @OneToOne(() => IncidentNature, { eager: true }) // 'eager: true' carrega a natureza junto
  @JoinColumn()
  incidentNature: IncidentNature;

  // As perguntas-chave extraídas (armazenadas como JSON)
  @Column({ type: 'jsonb', default: [] })
  questions: string[];

  // As instruções pré-socorro (texto longo)
  @Column({ type: 'text' })
  instructions: string;

  // As palavras-chave para a triagem inteligente (armazenadas como array de texto)
  @Column({ type: 'text', array: true, default: [] })
  keywords: string[];

  // Opcional: guardar o caminho do PDF que originou esta ficha
  @Column({ nullable: true })
  originalPdfPath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}