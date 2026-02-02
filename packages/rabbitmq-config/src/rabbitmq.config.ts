import { RmqOptions, Transport } from '@nestjs/microservices';

export const rabbitmqConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: 'gateway_queue',
    queueOptions: {
      durable: true,
    },
    noAck: false,
    prefetchCount: 1,
  },
};

export const microservices = Object.freeze({
  AUTH_SERVICE: {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: true,
      },
    },
  } as RmqOptions,
  API_SERVICE: {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'api_queue',
      queueOptions: {
        durable: true,
      },
    },
  } as RmqOptions,
  COMMUNICATION_SERVICE: {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'communication_queue',
      queueOptions: {
        durable: true,
      },
    },
  } as RmqOptions,
  CORE_SERVICE: {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'core_queue',
      queueOptions: {
        durable: true,
      },
    },
  } as RmqOptions,
  FILES_SERVICE: {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'files_queue',
      queueOptions: {
        durable: true,
      },
    },
  } as RmqOptions,
});
