import { Controller, Post, Body, HttpCode, Inject } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../infra/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  @Post('/webhooks/mercadopago')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    if (body.type === 'payment' && body.data && body.data.id) {
      const paymentInfo = await this.paymentsService.verifyPayment(body.data.id);
      if (paymentInfo && paymentInfo.approved) {
        const { jobId, appId } = paymentInfo;
        
        // Find job to get the companyId
        const job = await this.prisma.job.findUnique({
          where: { id: jobId },
        });

        if (job) {
          // Emit application_approved event, which JobClosureWorker will handle
          this.client.emit('application_approved', {
            jobId,
            appId,
            companyId: job.companyId,
          });
          console.log(`[PaymentsWebhook] Approved payment for Job ${jobId}, App ${appId}. Emitted approval event.`);
        }
      }
    }
    return { received: true };
  }
}

