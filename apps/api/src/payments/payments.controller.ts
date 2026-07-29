import { Controller, Post, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('jobs')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/checkout')
  async createCheckout(@Param('id') id: string) {
    const initPoint = await this.paymentsService.createPreference(id, 50.0);
    return { init_point: initPoint };
  }
}
