import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { AssignResourcesDto } from './dto/assign-resources.dto';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('queue')
  getQueue() {
    return this.dispatchService.getQueue();
  }

  @Get('available-resources')
  getAvailableResources() {
    return this.dispatchService.getAvailableResources();
  }

  @Post('assign')
  assignResources(@Body(ValidationPipe) assignDto: AssignResourcesDto) {
    return this.dispatchService.assignResources(assignDto);
  }
}