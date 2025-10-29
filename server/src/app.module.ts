import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Importação dos nossos módulos
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { ResourcesModule } from './resources/resources.module';
import { ProtocolsModule } from './protocols/protocols.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // 1. Módulo de Eventos (para comunicação entre módulos)
    EventEmitterModule.forRoot(), // Adicionar esta linha!

    // 2. Módulo de Configuração (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 3. Módulo TypeORM (Banco)
    TypeOrmModule.forRoot({
      // ... (sua configuração de banco)
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    // 4. Módulos de Features
    AuthModule,
    UsersModule,
    IncidentsModule,
    DispatchModule,
    ResourcesModule,
    ProtocolsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}