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
   * Encontra um usuário pelo e-mail.
   * Usado pelo AuthService para validar o login.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Cria um novo usuário.
   * Usado pelo AuthService para registrar.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new User();
    newUser.name = createUserDto.name;
    newUser.email = createUserDto.email;
    newUser.passwordHash = createUserDto.passwordHash;
    newUser.role = createUserDto.role;
    return this.usersRepository.save(newUser);
  }

  /**
   * Encontra um usuário pelo ID.
   * Usado pelo JwtStrategy para desserializar o usuário do token.
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}