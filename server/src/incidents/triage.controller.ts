import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { AnalyzeNarrativeDto } from './dto/analyze-narrative.dto';
import { CreateIncidentDto } from './dto/create-incident.dto'; // Importar!

@Controller('incidents/triage')
export class TriageController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post('analyze')
  analyzeNarrative(@Body(ValidationPipe) analyzeDto: AnalyzeNarrativeDto) {
    return this.incidentsService.analyzeNarrative(analyzeDto.narrative);
  }

  // NOVO ENDPOINT
  @Post('create')
  createIncident(@Body(ValidationPipe) createDto: CreateIncidentDto) {
    return this.incidentsService.createIncident(createDto);
  }
}