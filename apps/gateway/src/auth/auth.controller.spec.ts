import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { microservices } from '@repo/rabbitmq-config';

import { AuthController } from './auth.controller';

const mockClientProxy = { send: jest.fn() };
const mockCacheManager = { del: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: microservices.symbols.AUTH_SERVICE,
          useValue: mockClientProxy,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
