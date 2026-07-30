import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { TransactionStatus } from '../infra/prisma/generated/client';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDispute(transactionId: string, reason: string, companyAccountId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { job: { include: { company: true } } },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'APPROVED') {
      throw new BadRequestException('Somente transações aprovadas podem ser disputadas.');
    }

    // Verify company owns the job
    if (transaction.job.company.account_id !== companyAccountId) {
      throw new BadRequestException('Apenas o criador da vaga pode abrir uma disputa.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update transaction
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'DISPUTED' },
      });

      // Create a moderation ticket (Report)
      await tx.report.create({
        data: {
          reporterId: companyAccountId,
          reportedJobId: transaction.jobId,
          type: 'OTHER',
          description: `Disputa financeira aberta para transação ${transactionId}. Motivo: ${reason}`,
        },
      });

      return updatedTx;
    });

    return result;
  }

  async resolveDispute(transactionId: string, action: 'REFUND' | 'RELEASE', adminId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'DISPUTED') {
      throw new BadRequestException('Transação não está em disputa.');
    }

    let newStatus: TransactionStatus;
    
    if (action === 'REFUND') {
      // In a real scenario we would call MercadoPago refund API here
      // await this.mercadoPagoService.refundPayment(transaction.paymentId);
      newStatus = 'REFUNDED';
    } else if (action === 'RELEASE') {
      newStatus = 'APPROVED';
    } else {
      throw new BadRequestException('Ação inválida. Use REFUND ou RELEASE.');
    }

    const updatedTx = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: newStatus },
    });

    return updatedTx;
  }
}
