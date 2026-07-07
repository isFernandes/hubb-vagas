import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LockService } from './lock.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis(
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        );
      },
      inject: [ConfigService],
    },
    LockService,
  ],
  exports: ['REDIS_CLIENT', LockService],
})
export class RedisModule {}
