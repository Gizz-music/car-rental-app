import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { AiEmailClient } from './ai-email.client';
import { BookingEmailComposer } from './booking-email.composer';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [MailModule],
  controllers: [NotificationsController],
  providers: [AiEmailClient, BookingEmailComposer, NotificationsService],
})
export class NotificationsModule {}
