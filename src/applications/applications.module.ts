import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { JobsModule } from '../jobs/jobs.module';
import { MessagingModule } from '../infra/messaging/messaging.module';

@Module({
  imports: [JobsModule, MessagingModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
