import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { TransactionStatus } from '../infra/prisma/generated/client';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDispute(
    transactionId: string,
    reason: string,
    companyAccountId: string,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { job: { include: { company: true } } },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'APPROVED') {
      throw new BadRequestException(
        'Somente transações aprovadas podem ser disputadas.',
      );
    }

    // Verify company owns the job
    if (transaction.job.company.account_id !== companyAccountId) {
      throw new BadRequestException(
        'Apenas o criador da vaga pode abrir uma disputa.',
      );
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
          reportedTransactionId: transactionId,
          type: 'OTHER',
          description: `Disputa financeira aberta para transação ${transactionId}. Motivo: ${reason}`,
        },
      });

      return updatedTx;
    });

    return result;
  }

  async resolveDispute(
    transactionId: string,
    action: 'REFUND' | 'RELEASE',
    adminId: string,
  ) {
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

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: newStatus },
      });

      // Find the associated report to resolve it
      const reports = await tx.report.findMany({
        where: { reportedTransactionId: transactionId, status: 'PENDING' },
      });

      if (reports.length > 0) {
        await tx.report.update({
          where: { id: reports[0].id },
          data: {
            status: 'RESOLVED',
            resolvedById: adminId,
            resolutionNotes: `Resolvido via ação administrativa financeira: ${action}`,
          },
        });
      }

      return updatedTx;
    });

    return result;
  }
}
