import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MessagingModule } from '../infra/messaging/messaging.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [MessagingModule, ApplicationsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
