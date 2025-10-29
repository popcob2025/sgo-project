import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  /**
   * Cria um novo Recurso (Viatura)
   */
  create(createDto: CreateResourceDto): Promise<Resource> {
    const { latitude, longitude, ...rest } = createDto;

    const resourceData: DeepPartial<Resource> = { ...rest };

    if (latitude && longitude) {
      resourceData.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const resource = this.resourceRepository.create(resourceData);

    return this.resourceRepository.save(resource);
  }

  /**
   * Retorna todos os Recursos
   */
  findAll(): Promise<Resource[]> {
    return this.resourceRepository.find();
  }

  /**
   * Encontra um Recurso pelo ID
   */
  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }
    return resource;
  }

  /**
   * Atualiza um Recurso
   */
  async update(id: string, updateDto: UpdateResourceDto): Promise<Resource> {
    const { latitude, longitude, ...rest } = updateDto;

    const resource = await this.resourceRepository.preload({
      id: id,
      ...rest,
    });

    if (!resource) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }

    // Atualiza a localização se ela for enviada
    if (latitude && longitude) {
      resource.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    return this.resourceRepository.save(resource);
  }

  /**
   * Remove um Recurso
   */
  async remove(id: string): Promise<void> {
    const result = await this.resourceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }
  }
}
