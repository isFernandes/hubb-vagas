import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class NotificationsConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @EventPattern('application_created')
  async handleApplicationCreated(@Payload() data: any) {
    console.log(
      `[E-MAIL INFO] Sending application confirmation to user ${data.userId} for job ${data.jobId}`,
    );
    try {
      await this.mailerService.sendMail({
        to: 'candidato_teste@example.com', // Usando e-mail de teste para evitar bounce em ambiente local
        subject: 'Candidatura Recebida - Hubb Vagas',
        text: `Olá! Sua candidatura para a vaga (ID: ${data.jobId}) foi recebida com sucesso.`,
      });
      console.log(
        `[E-MAIL SENT] Confirmation sent for application ${data.applicationId}`,
      );
    } catch (e) {
      console.error(
        `[E-MAIL ERROR] Failed to send email for application ${data.applicationId}:`,
        e,
      );
    }
  }

  @EventPattern('job_closed')
  async handleJobClosed(@Payload() data: any) {
    console.log(
      `[E-MAIL INFO] Job ${data.jobId} is now closed. Notifying applicants.`,
    );
    try {
      await this.mailerService.sendMail({
        to: 'empresa_teste@example.com',
        subject: 'Vaga Fechada - Hubb Vagas',
        text: `A vaga (ID: ${data.jobId}) foi fechada por contratação do candidato (ID: ${data.hiredAppId}).`,
      });
      console.log(
        `[E-MAIL SENT] Closure notification sent for job ${data.jobId}`,
      );
    } catch (e) {
      console.error(
        `[E-MAIL ERROR] Failed to send closure email for job ${data.jobId}:`,
        e,
      );
    }
  }

  @EventPattern('application_rejected')
  async handleApplicationRejected(
    @Payload() data: { email: string; jobTitle: string; companyName: string },
  ) {
    console.log(`[E-MAIL INFO] Sending rejection email to ${data.email} for job ${data.jobTitle}`);
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `Atualização sobre sua candidatura: ${data.jobTitle}`,
        text: `Olá! Infelizmente a vaga "${data.jobTitle}" da empresa ${data.companyName} foi preenchida por outro candidato. Não desanime, novas vagas surgem todos os dias!`,
      });
      console.log(`[E-MAIL SENT] Rejection email sent to ${data.email}`);
    } catch (e) {
      console.error(`[E-MAIL ERROR] Failed to send rejection email to ${data.email}:`, e);
    }
  }
}
