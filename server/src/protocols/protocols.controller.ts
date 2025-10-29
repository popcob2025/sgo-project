import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProtocolsService } from './protocols.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Post('upload/:natureId')
  @UseInterceptors(FileInterceptor('file')) // 'file' é o nome do campo no form-data
  uploadProtocol(
    @UploadedFile() file: Express.Multer.File,
    @Param('natureId', ParseUUIDPipe) natureId: string, // Garante que o ID é um UUID
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo enviado.');
    }

    return this.protocolsService.processPdfProtocol(file, natureId);
  }
}