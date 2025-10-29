import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentNature } from './entities/incident-nature.entity';
import { IncidentNaturesController } from './incident-natures.controller';
import { TriageController } from './triage.controller';
import { Protocol } from '../protocols/entities/protocol.entity';
import { Incident } from './entities/incident.entity'; // Importar!
import { User } from '../users/entities/user.entity'; // Importar!

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentNature,
      Protocol,
      Incident, // Adicionar esta linha!
      User,     // Adicionar esta linha!
    ]),
  ],
  controllers: [IncidentNaturesController, TriageController],
  providers: [IncidentsService],
})
export class IncidentsModule {}