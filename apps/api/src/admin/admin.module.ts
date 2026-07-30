import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MessagingModule } from '../infra/messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
