import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { IncidentNature } from './entities/incident-nature.entity';
import { CreateIncidentNatureDto } from './dto/create-incident-nature.dto';
import { UpdateIncidentNatureDto } from './dto/update-incident-nature.dto';
import { Protocol } from '../protocols/entities/protocol.entity';
import { Incident } from './entities/incident.entity';
import { User } from '../users/entities/user.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { Point } from 'geojson';
import { IncidentStatus } from '../common/enums/incident-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentNature)
    private incidentNatureRepository: Repository<IncidentNature>,

    @InjectRepository(Protocol)
    private protocolRepository: Repository<Protocol>,

    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    // Injetado na Fase 12
    private eventEmitter: EventEmitter2,
  ) {}

  // --- FUNÇÃO DE CRIAÇÃO DE OCORRÊNCIA (Fase 9 e 12) ---

  /**
   * Cria o registro principal da Ocorrência
   */
  async createIncident(dto: CreateIncidentDto): Promise<Incident> {
    // 1. Validar as Relações (Protocolo e Operador)
    const protocol = await this.protocolRepository.findOne({
      where: { id: dto.protocolId },
    });
    if (!protocol) {
      throw new NotFoundException(
        `Protocolo com ID ${dto.protocolId} não encontrado.`,
      );
    }

    const operator = await this.userRepository.findOne({
      where: { id: dto.operatorId },
    });
    if (!operator) {
      throw new NotFoundException(
        `Operador com ID ${dto.operatorId} não encontrado.`,
      );
    }

    // 2. Formatar o Ponto Geográfico (PostGIS)
    const coordinates: Point = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude], // Formato (Longitude, Latitude)
    };

    // 3. Criar a nova entidade
    const newIncident = this.incidentRepository.create({
      callerName: dto.callerName,
      callerPhone: dto.callerPhone,
      address: dto.address,
      addressNotes: dto.addressNotes,
      narrative: dto.narrative,
      priority: dto.priority,
      status: IncidentStatus.AWAITING_DISPATCH, // Status inicial
      coordinates: coordinates,
      protocol: protocol,
      triageOperator: operator,
    });

    // 4. Salvar no banco
    const savedIncident = await this.incidentRepository.save(newIncident);

    // 5. DISPARAR O EVENTO (Fase 12)
    this.eventEmitter.emit('incident.created', savedIncident);

    return savedIncident;
  }

  // --- FUNÇÕES DE ANÁLISE DE NARRATIVA (Fase 8) ---

  /**
   * Analisa uma narrativa e retorna uma lista de protocolos sugeridos.
   */
  async analyzeNarrative(narrative: string) {
    // 1. Limpa e extrai palavras-chave da narrativa do usuário
    const narrativeKeywords = this.cleanAndTokenize(narrative);
    if (narrativeKeywords.length === 0) {
      return [];
    }

    // 2. Busca TODOS os protocolos no banco (com suas naturezas)
    const allProtocols = await this.protocolRepository.find({
      relations: ['incidentNature'], // Crucial: precisamos dos dados da natureza
      where: { incidentNature: { id: Not(null) } }, // Garante que o protocolo está linkado
    });

    // 3. Calcula a pontuação de cada protocolo
    const scoredProtocols = [];
    for (const protocol of allProtocols) {
      let score = 0;
      for (const keyword of protocol.keywords) {
        // Se uma palavra-chave do protocolo (ex: "atropelamento")
        // estiver na narrativa do usuário...
        if (narrativeKeywords.includes(this.normalize(keyword))) {
          score++;
        }
      }

      if (score > 0) {
        scoredProtocols.push({
          protocolId: protocol.id,
          natureId: protocol.incidentNature.id,
          natureCode: protocol.incidentNature.code,
          natureName: protocol.incidentNature.name,
          score: score,
        });
      }
    }

    // 4. Ordena os protocolos pelo 'score' (mais relevantes primeiro)
    const sortedProtocols = scoredProtocols.sort((a, b) => b.score - a.score);

    // Retorna os 5 mais relevantes
    return sortedProtocols.slice(0, 5);
  }

  /**
   * Helper para limpar e "tokenizar" a string da narrativa.
   */
  private cleanAndTokenize(text: string): string[] {
    const normalized = this.normalize(text);
    // Remove palavras comuns (stopwords)
    const stopwords = new Set([
      'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na',
      'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'e', 'para', 'com', 'que',
      'está', 'esta', 'meu', 'minha',
    ]);

    return normalized
      .split(/\s+/) // Quebra por espaços
      .filter((word) => word.length > 2 && !stopwords.has(word));
  }

  /**
   * Helper para normalizar o texto (minúsculas, sem acentos)
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Remove acentos
      .replace(/[\u0300-\u036f]/g, '');
  }

  // --- FUNÇÕES DO CRUD DE NATUREZAS (Fase 7) ---

  /**
   * Cria uma nova Natureza de Incidente
   */
  create(createDto: CreateIncidentNatureDto): Promise<IncidentNature> {
    const nature = this.incidentNatureRepository.create(createDto);
    return this.incidentNatureRepository.save(nature);
  }

  /**
   * Retorna todas as Naturezas de Incidente
   */
  findAll(): Promise<IncidentNature[]> {
    return this.incidentNatureRepository.find();
  }

  /**
   * Encontra uma Natureza de Incidente pelo ID
   */
  async findOne(id: string): Promise<IncidentNature> {
    const nature = await this.incidentNatureRepository.findOne({
      where: { id },
    });
    if (!nature) {
      throw new NotFoundException(
        `Natureza de Incidente com ID ${id} não encontrada.`,
      );
    }
    return nature;
  }

  /**
   * Atualiza uma Natureza de Incidente
   */
  async update(
    id: string,
    updateDto: UpdateIncidentNatureDto,
  ): Promise<IncidentNature> {
    // O 'preload' busca a entidade e mescla os novos dados
    const nature = await this.incidentNatureRepository.preload({
      id: id,
      ...updateDto,
    });
    if (!nature) {
      throw new NotFoundException(
        `Natureza de Incidente com ID ${id} não encontrada.`,
      );
    }
    return this.incidentNatureRepository.save(nature);
  }

  /**
   * Remove uma Natureza de Incidente
   */
  async remove(id: string): Promise<void> {
    const result = await this.incidentNatureRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Natureza de Incidente com ID ${id} não encontrada.`,
      );
    }
  }
}