import { useState } from "react";

import { Button } from "@consta/uikit/Button";
import { Modal } from "@consta/uikit/Modal";
import { Text } from "@consta/uikit/Text";

import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDate, formatPrice } from "@/shared/lib/format";

import { useCancelBookingMutation } from "../../api/bookingsApi";
import {
  getCancellationPlan,
  type CancellationPlan,
} from "../../lib/bookingPeriod";
import type { Booking } from "../../model/types";

import styles from "./styles.module.css";

interface CancelBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const getContent = (booking: Booking, plan: CancellationPlan) => {
  const carName = `${booking.car.brand} ${booking.car.model}`;

  if (plan.kind === "cancel") {
    return {
      title: `Cancel ${carName} booking?`,
      description: `The booking for ${formatDate(booking.startDate)} — ${formatDate(booking.endDate)} will be cancelled.`,
      confirmLabel: "Cancel booking",
    };
  }

  return {
    title: `End ${carName} rental early?`,
    description: `Today will be the last day of the rental. Please return the car by ${formatDate(plan.endDate)}.`,
    confirmLabel: "End rental",
    price: `New total: ${formatPrice(plan.totalPrice)} instead of ${formatPrice(booking.totalPrice)}`,
  };
};

export const CancelBookingModal = ({
  booking,
  onClose,
}: CancelBookingModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [cancelBooking, { isLoading }] = useCancelBookingMutation();

  const [shownBookingId, setShownBookingId] = useState(booking?.id);
  if (booking?.id !== shownBookingId) {
    setShownBookingId(booking?.id);
    setError(null);
  }

  const plan = booking && getCancellationPlan(booking);
  const content = booking && plan && getContent(booking, plan);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!booking) {
      return;
    }

    try {
      setError(null);
      await cancelBooking(booking.id).unwrap();
      onClose();
    } catch (cancelError) {
      setError(
        getApiErrorMessage(
          cancelError,
          "Could not cancel this booking. Please try again.",
        ),
      );
    }
  };

  return (
    <Modal
      isOpen={booking !== null}
      hasOverlay
      className={styles.modal}
      onClose={handleClose}
      onEsc={handleClose}
    >
      {content && (
        <div className={styles.content}>
          <Text size="xl" weight="semibold" view="primary">
            {content.title}
          </Text>
          <Text size="m" view="primary">
            {content.description}
          </Text>
          {content.price && (
            <Text size="m" weight="semibold" view="brand">
              {content.price}
            </Text>
          )}
          {error && (
            <Text size="s" view="alert">
              {error}
            </Text>
          )}
          <div className={styles.actions}>
            <Button
              label={content.confirmLabel}
              className={styles.confirm}
              loading={isLoading}
              onClick={handleConfirm}
            />
            <Button
              label="Keep booking"
              view="ghost"
              disabled={isLoading}
              onClick={handleClose}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
