import { Badge } from "@consta/uikit/Badge";
import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";

import { formatDate, formatPrice } from "@/shared/lib/format";

import {
  canCancelBooking,
  canDeleteBooking,
  countDays,
  getBookingState,
} from "../../lib/bookingPeriod";
import type { Booking } from "../../model/types";

import styles from "./styles.module.css";

interface BookingCardProps {
  booking: Booking;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

export const BookingCard = ({
  booking,
  onCancel,
  onDelete,
}: BookingCardProps) => {
  const { car, startDate, endDate, totalPrice } = booking;
  const { label, status } = getBookingState(booking);
  const canCancel = canCancelBooking(booking);
  const canDelete = canDeleteBooking(booking);
  const days = countDays(startDate, endDate);
  const carName = `${car.brand} ${car.model}`;

  return (
    <article className={styles.card}>
      <img src={car.imageUrl} alt={carName} className={styles.image} />
      <div className={styles.info}>
        <div className={styles.header}>
          <Text size="l" weight="semibold" view="primary">
            {carName}
          </Text>
          <Badge size="s" form="round" label={label} status={status} />
        </div>
        <Text size="s" view="secondary">
          {car.year} · {car.seats} seats · {car.transmission}
        </Text>
        <Text size="m" view="primary">
          {formatDate(startDate)} — {formatDate(endDate)}
        </Text>
        <div className={styles.footer}>
          <Text size="s" view="secondary">
            {days} {days === 1 ? "day" : "days"}
          </Text>
          <Text size="l" weight="bold" view="brand">
            {formatPrice(totalPrice)}
          </Text>
        </div>
        {canCancel && (
          <Button
            size="s"
            view="secondary"
            label="Cancel booking"
            className={styles.cancel}
            onClick={() => onCancel(booking)}
          />
        )}
        {canDelete && (
          <Button
            size="s"
            view="secondary"
            label="Delete booking"
            className={styles.cancel}
            onClick={() => onDelete(booking)}
          />
        )}
      </div>
    </article>
  );
};
