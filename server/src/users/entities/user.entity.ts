import { UserRole } from '../../common/enums/user-role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string; // <-- ALTERADO DE 'email'

  @Column()
  passwordHash: string; // Iremos salvar a senha criptografada (hash)

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OPERATOR, // <-- ALTERADO PARA O NOVO DEFAULT
  })
  role: UserRole;

  // Timestamps (opcional, mas boa prática)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
