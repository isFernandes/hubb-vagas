import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
    });
  }

  async createPreference(
    jobId: string,
    appId: string,
    price: number,
  ): Promise<string> {
    try {
      const preference = new Preference(this.client);
      const result = await preference.create({
        body: {
          items: [
            {
              id: `${jobId}:${appId}`,
              title: 'Contratação de Candidato',
              quantity: 1,
              unit_price: price,
            },
          ],
          payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
          back_urls: {
            success: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
            failure: `${process.env.FRONTEND_URL}/dashboard?payment=failure`,
          },
          auto_return: 'approved',
          external_reference: `${jobId}:${appId}`,
        },
      });
      return result.init_point!;
    } catch (e: any) {
      console.error('[MercadoPago] Error creating preference:', e.message || e);
      throw new import('@nestjs/common').BadRequestException('Falha na integração com MercadoPago. Verifique as credenciais.');
    }
  }

  async verifyPayment(
    paymentId: string,
  ): Promise<{ approved: boolean; jobId: string; appId: string } | null> {
    try {
      const payment = new Payment(this.client);
      const data = await payment.get({ id: paymentId });
      const approved = data.status === 'approved';
      const externalRef = data.external_reference || '';
      const [jobId, appId] = externalRef.split(':');

      if (!jobId || !appId) {
        return null;
      }

      return { approved, jobId, appId };
    } catch (error) {
      console.error('[MercadoPago] Error verifying payment:', error);
      return null;
    }
  }
}
