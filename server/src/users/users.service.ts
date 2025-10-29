import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Encontra um usuário pelo username.
   * Usado pelo AuthService para validar o login.
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } }); // <-- ALTERADO
  }

  /**
   * Encontra um usuário pelo ID.
   * Usado pelo JwtStrategy.
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Cria um novo usuário no banco.
   * Usado pelo AuthService para registrar.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new User();
    newUser.name = createUserDto.name;
    newUser.username = createUserDto.username; // <-- ALTERADO
    newUser.passwordHash = createUserDto.passwordHash;
    newUser.role = createUserDto.role;

    return this.usersRepository.save(newUser);
  }

  /**
   * Busca todos os usuários (exemplo, pode não ser usado)
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
