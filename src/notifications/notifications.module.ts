import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsConsumer } from './notifications.consumer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email',
          port: configService.get<number>('SMTP_PORT') || 587,
          auth: {
            user: configService.get<string>('SMTP_USER') || 'ethereal_user',
            pass: configService.get<string>('SMTP_PASS') || 'ethereal_pass',
          },
        },
        defaults: {
          from: '"No Reply" <noreply@hubbvagas.com>',
        },
      }),
    }),
  ],
  controllers: [NotificationsConsumer],
})
export class NotificationsModule {}
