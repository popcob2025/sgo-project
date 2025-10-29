import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importar
import { User } from './entities/user.entity'; // Importar

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Adicionar esta linha
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}