import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AssignResourcesDto } from './dto/assign-resources.dto';
import { DispatchAssignment } from './entities/dispatch-assignment.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DispatchGateway } from './dispatch.gateway';
import { Incident } from '../incidents/entities/incident.entity';
import { Resource } from '../resources/entities/resource.entity';
import { IncidentStatus } from '../common/enums/incident-status.enum';
import { ResourceStatus } from '../common/enums/resource-status.enum';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(DispatchAssignment)
    private assignmentRepository: Repository<DispatchAssignment>,
    private dataSource: DataSource,
    // Injetar o Gateway e o EventEmitter
    private dispatchGateway: DispatchGateway,
    private eventEmitter: EventEmitter2,
  ) {}

  // --- OUVINTE DE EVENTO ---

  @OnEvent('incident.created')
  handleIncidentCreation(payload: Incident) {
    // O IncidentsService disparou. Agora, o DispatchGateway notifica.
    this.dispatchGateway.notifyNewIncident(payload);
  }

  // --- MÉTODOS DO SERVIÇO ---

  getQueue(): Promise<Incident[]> {
    // ... (código da Fase 11, sem alterações)
    return this.incidentRepository.find({
      where: { status: IncidentStatus.AWAITING_DISPATCH },
      order: { priority: 'DESC', createdAt: 'ASC' },
      relations: ['protocol', 'triageOperator'],
    });
  }

  getAvailableResources(): Promise<Resource[]> {
    // ... (código da Fase 11, sem alterações)
    return this.resourceRepository.find({
      where: { status: ResourceStatus.AVAILABLE },
    });
  }

  async assignResources(dto: AssignResourcesDto): Promise<Incident> {
    // A transação
    const incident = await this.dataSource.transaction(async (manager) => {
      // 1. Encontra a ocorrência
      const incident = await manager.findOne(Incident, {
        where: { id: dto.incidentId },
      });
      if (!incident) {
        throw new NotFoundException('Ocorrência não encontrada.');
      }
      // ... (validações da ocorrência)
      if (incident.status !== IncidentStatus.AWAITING_DISPATCH) {
        throw new BadRequestException(
          'Esta ocorrência não está aguardando despacho.',
        );
      }

      // 2. Encontra os recursos
      const resources = await manager.find(Resource, {
        where: { id: In(dto.resourceIds) },
      });
      if (resources.length !== dto.resourceIds.length) {
        throw new NotFoundException(
          'Um ou mais recursos não foram encontrados.',
        );
      }

      // 3. Valida e atualiza os recursos
      const newAssignments: DispatchAssignment[] = [];
      for (const resource of resources) {
        if (resource.status !== ResourceStatus.AVAILABLE) {
          throw new BadRequestException(
            `Recurso ${resource.name} não está disponível.`,
          );
        }
        resource.status = ResourceStatus.EN_ROUTE;

        const assignment = manager.create(DispatchAssignment, {
          incident: incident,
          resource: resource,
        });
        newAssignments.push(assignment);
      }

      // 4. Atualiza o status da ocorrência
      incident.status = IncidentStatus.DISPATCHED;

      // 5. Salva tudo
      await manager.save(resources);
      await manager.save(newAssignments);
      await manager.save(incident);

      return incident;
    });

    // 6. NOTIFICA VIA WEBSOCKET (Fora da transação)
    this.dispatchGateway.notifyIncidentAssigned(incident);

    return incident;
  }
}
