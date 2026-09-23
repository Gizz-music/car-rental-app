import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Отправка писем через SMTP: локально — Mailpit, в продакшене — реальный провайдер
@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');

    this.transporter = createTransport(
      {
        host: config.getOrThrow<string>('SMTP_HOST'),
        port: Number(config.getOrThrow<string>('SMTP_PORT')),
        secure: config.get<string>('SMTP_SECURE') === 'true',
        auth: user
          ? { user, pass: config.getOrThrow<string>('SMTP_PASS') }
          : undefined,
      },
      { from: config.getOrThrow<string>('MAIL_FROM') },
    );
  }

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail(message);
  }
}
