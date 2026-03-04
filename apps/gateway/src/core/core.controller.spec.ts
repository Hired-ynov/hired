import { Test, TestingModule } from '@nestjs/testing';
import { microservices } from '@repo/rabbitmq-config';

import { CoreController } from './core.controller';

const mockClientProxy = { send: jest.fn() };

describe('CoreController', () => {
  let controller: CoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoreController],
      providers: [
        {
          provide: microservices.symbols.CORE_SERVICE,
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<CoreController>(CoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
