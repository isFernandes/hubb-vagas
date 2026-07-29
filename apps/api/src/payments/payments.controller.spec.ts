import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: { createPreference: jest.fn().mockResolvedValue('url') } }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should call createPreference', async () => {
    const result = await controller.createCheckout('job-123');
    expect(result).toEqual({ init_point: 'url' });
  });
});
