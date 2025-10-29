import { UserRole } from '../../common/enums/user-role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // Nome da tabela no banco
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string; // Iremos salvar a senha criptografada (hash)

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TRIAGE,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
