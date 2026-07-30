import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { MessagingModule } from '../infra/messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  controllers: [PaymentsController, DisputesController],
  providers: [PaymentsService, DisputesService],
  exports: [PaymentsService, DisputesService],
})
export class PaymentsModule {}
