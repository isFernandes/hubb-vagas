import { Controller, Post, Param, Body, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('jobs')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/checkout')
  async createCheckout(@Param('id') id: string) {
    const initPoint = await this.paymentsService.createPreference(id, 50.0);
    return { init_point: initPoint };
  }

  @Post('/webhooks/mercadopago')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    if (body.type === 'payment' && body.data && body.data.id) {
      const isApproved = await this.paymentsService.verifyPayment(body.data.id);
      if (isApproved) {
        // Update DB job status to paid
        console.log('Payment approved for ID:', body.data.id);
      }
    }
    return { received: true };
  }
}
