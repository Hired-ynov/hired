import { ClientProvider, Transport } from '@nestjs/microservices';

export const microservices = {
  base: (envs: NodeJS.ProcessEnv) => {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [envs.RABBITMQ_URL || 'amqp://localhost:5672'],
        queueOptions: {
          durable: true,
        },
        prefetchCount: 1,
      },
    };
  },
  symbols: Object.freeze({
    AUTH_SERVICE: Symbol('AUTH_SERVICE'),
    COMMUNICATION_SERVICE: Symbol('COMMUNICATION_SERVICE'),
    CORE_SERVICE: Symbol('CORE_SERVICE'),
    FILES_SERVICE: Symbol('FILES_SERVICE'),
    INTERNAL_BUS_SERVICE: Symbol('INTERNAL_BUS_SERVICE'),
  } as const),
  AUTH_SERVICE: (envs: NodeJS.ProcessEnv) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'auth_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  COMMUNICATION_SERVICE: (envs: NodeJS.ProcessEnv) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'communication_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  CORE_SERVICE: (envs: NodeJS.ProcessEnv) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'core_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  FILES_SERVICE: (envs: NodeJS.ProcessEnv) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'files_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  INTERNAL_BUS_SERVICE: (envs: NodeJS.ProcessEnv) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'internal_bus_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
};
