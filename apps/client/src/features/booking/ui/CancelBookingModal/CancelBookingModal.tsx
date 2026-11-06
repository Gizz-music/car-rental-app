import { useState } from "react";

import { Button } from "@consta/uikit/Button";
import { Modal } from "@consta/uikit/Modal";
import { Text } from "@consta/uikit/Text";

import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDate } from "@/shared/lib/format";

import { useCancelBookingMutation } from "../../api/bookingsApi";
import type { Booking } from "../../model/types";

import styles from "./styles.module.css";

interface CancelBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
}

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

  const carName = booking && `${booking.car.brand} ${booking.car.model}`;

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
      {booking && (
        <div className={styles.content}>
          <Text size="xl" weight="semibold" view="primary">
            Are you sure you want to cancel this booking?
          </Text>
          <Text size="m" view="primary">
            The booking of {carName} for {formatDate(booking.startDate)} —{" "}
            {formatDate(booking.endDate)} will be cancelled, and the car will
            be available again.
          </Text>
          {error && (
            <Text size="s" view="alert">
              {error}
            </Text>
          )}
          <div className={styles.actions}>
            <Button
              label="Yes"
              className={styles.confirm}
              loading={isLoading}
              onClick={handleConfirm}
            />
            <Button
              label="No"
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
