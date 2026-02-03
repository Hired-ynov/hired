import { ClientProvider, Transport } from '@nestjs/microservices';

export const microservices = {
  base: (envs: { [k: string]: any }) => {
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
  AUTH_SERVICE: (envs: { [k: string]: any }) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'auth_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  COMMUNICATION_SERVICE: (envs: { [k: string]: any }) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'communication_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  CORE_SERVICE: (envs: { [k: string]: any }) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'core_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
  FILES_SERVICE: (envs: { [k: string]: any }) => {
    const base = microservices.base(envs);
    return {
      ...base,
      options: {
        ...base.options,
        queue: 'files_queue',
      },
    } as ClientProvider & { transport: Transport };
  },
};
