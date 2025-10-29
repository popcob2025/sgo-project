import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchGateway } from './dispatch.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchAssignment } from './entities/dispatch-assignment.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { Resource } from '../resources/entities/resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DispatchAssignment,
      Incident, // Precisa ler e atualizar ocorrências
      Resource, // Precisa ler e atualizar recursos
    ]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService, DispatchGateway], // O Gateway é para o Real-time
})
export class DispatchModule {}
