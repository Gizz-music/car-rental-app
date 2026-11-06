import { useState } from "react";

import { Button } from "@consta/uikit/Button";
import { Modal } from "@consta/uikit/Modal";
import { Text } from "@consta/uikit/Text";

import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDate } from "@/shared/lib/format";

import { useDeleteBookingMutation } from "../../api/bookingsApi";
import type { Booking } from "../../model/types";

import styles from "./styles.module.css";

interface DeleteBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const DeleteBookingModal = ({
  booking,
  onClose,
}: DeleteBookingModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [deleteBooking, { isLoading }] = useDeleteBookingMutation();

  const [shownBookingId, setShownBookingId] = useState(booking?.id);
  if (booking?.id !== shownBookingId) {
    setShownBookingId(booking?.id);
    setError(null);
  }

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
      await deleteBooking(booking.id).unwrap();
      onClose();
    } catch (deleteError) {
      setError(
        getApiErrorMessage(
          deleteError,
          "Could not delete this booking. Please try again.",
        ),
      );
    }
  };

  const carName = booking && `${booking.car.brand} ${booking.car.model}`;
  const description =
    booking &&
    (booking.status === "cancelled"
      ? `The cancelled booking of ${carName} for ${formatDate(booking.startDate)} — ${formatDate(booking.endDate)} will be removed from your history.`
      : `The completed booking of ${carName} for ${formatDate(booking.startDate)} — ${formatDate(booking.endDate)} will be removed from your account.`);

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
            Are you sure you want to delete this booking?
          </Text>
          <Text size="m" view="primary">
            {description}
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
