import { Module } from '@nestjs/common';
import { ProtocolsController } from './protocols.controller';
import { ProtocolsService } from './protocols.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Protocol } from './entities/protocol.entity';
import { IncidentNature } from '../incidents/entities/incident-nature.entity'; // Importar!

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Protocol,
      IncidentNature, // Adicionar esta linha!
    ]),
  ],
  controllers: [ProtocolsController],
  providers: [ProtocolsService],
})
export class ProtocolsModule {}
