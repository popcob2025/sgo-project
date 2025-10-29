import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Administrador';

    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`[Bootstrap] Usuário admin já existe (${username}).`);
      return;
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await this.usersService.create({
      name,
      username,
      passwordHash,
      role: UserRole.ADMIN,
    });

    // eslint-disable-next-line no-console
    console.log(`[#] Usuário ADMIN criado para localhost: ${username} / ${password}`);
  }
}

