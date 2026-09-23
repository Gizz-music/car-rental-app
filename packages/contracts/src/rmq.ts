import type { RmqOptions } from '@nestjs/microservices';

// RabbitMQ queue consumed by the Notification service.
export const NOTIFICATIONS_QUEUE = 'notifications';

// Shared by producer and consumer: RabbitMQ rejects re-declaring a queue
// with different options. `durable` keeps the queue across broker restarts.
export const notificationsRmqOptions = (url: string): RmqOptions['options'] => ({
  urls: [url],
  queue: NOTIFICATIONS_QUEUE,
  queueOptions: { durable: true },
});
