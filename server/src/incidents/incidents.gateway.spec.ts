import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsGateway } from './incidents.gateway';

describe('IncidentsGateway', () => {
  let gateway: IncidentsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentsGateway],
    }).compile();

    gateway = module.get<IncidentsGateway>(IncidentsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
