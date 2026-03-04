import { Test, TestingModule } from '@nestjs/testing';
import { microservices } from '@repo/rabbitmq-config';

import { CommunicationController } from './communication.controller';

const mockClientProxy = { send: jest.fn() };

describe('CommunicationController', () => {
  let controller: CommunicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunicationController],
      providers: [
        {
          provide: microservices.symbols.COMMUNICATION_SERVICE,
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<CommunicationController>(CommunicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
