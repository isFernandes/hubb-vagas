import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
  }

  async createPreference(jobId: string, price: number): Promise<string> {
    const preference = new Preference(this.client);
    const result = await preference.create({
      body: {
        items: [{ id: jobId, title: 'Fechamento de Vaga', quantity: 1, unit_price: price }],
        marketplace_fee: 0.99,
        payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
        back_urls: { success: `${process.env.FRONTEND_URL}/pagamento/sucesso`, failure: `${process.env.FRONTEND_URL}/pagamento/falha` },
        auto_return: 'approved',
        external_reference: jobId,
      }
    });
    return result.init_point!;
  }
}
