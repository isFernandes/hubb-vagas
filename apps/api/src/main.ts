import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { JsonLoggerService } from './infra/logger/json-logger.service';
import { LoggingInterceptor } from './infra/logger/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(new JsonLoggerService());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);

  const rabbitmqUrl =
    configService.get<string>('RABBITMQ_URL') ||
    'amqp://guest:guest@localhost:5672';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'accounts_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'hubb_events_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<string>('PORT') || '3000';
  await app.listen(port).then(() => {
    console.log(`Server running on port ${port} 🚀🚀🚀`);
  });
}
bootstrap();
