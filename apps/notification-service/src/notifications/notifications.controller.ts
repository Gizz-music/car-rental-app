import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { Channel, Message } from 'amqplib';
import {
  BOOKING_CANCELLED_EVENT,
  type BookingCancelledEvent,
  CAR_BOOKED_EVENT,
  type CarBookedEvent,
} from '@car-rental/contracts';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(CAR_BOOKED_EVENT)
  onCarBooked(
    @Payload() event: CarBookedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    return this.handle(context, event.bookingId, () =>
      this.notificationsService.notifyCarBooked(event),
    );
  }

  @EventPattern(BOOKING_CANCELLED_EVENT)
  onBookingCancelled(
    @Payload() event: BookingCancelledEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    return this.handle(context, event.bookingId, () =>
      this.notificationsService.notifyBookingCancelled(event),
    );
  }

  // Подтверждаем сообщение, только когда письмо отправлено
  private async handle(
    context: RmqContext,
    bookingId: number,
    notify: () => Promise<void>,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    try {
      await notify();
      channel.ack(message);
    } catch (error) {
      // Одна повторная попытка: при повторном сбое сообщение отбрасывается,
      // чтобы не зациклиться. Надёжнее — очередь повторов и dead-letter queue.
      const requeue = !message.fields.redelivered;
      this.logger.error(
        `Failed to notify about booking ${bookingId} (requeue: ${requeue})`,
        error instanceof Error ? error.stack : error,
      );
      channel.nack(message, false, requeue);
    }
  }
}
