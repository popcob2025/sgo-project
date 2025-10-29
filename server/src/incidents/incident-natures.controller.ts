import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentNatureDto } from './dto/create-incident-nature.dto';
import { UpdateIncidentNatureDto } from './dto/update-incident-nature.dto';

@Controller('incidents/natures') // Rota base: /incidents/natures
export class IncidentNaturesController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body(ValidationPipe) createDto: CreateIncidentNatureDto) {
    return this.incidentsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateIncidentNatureDto,
  ) {
    return this.incidentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentsService.remove(id);
  }
}