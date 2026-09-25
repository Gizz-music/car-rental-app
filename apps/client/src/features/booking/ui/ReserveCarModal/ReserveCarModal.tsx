import { useState } from "react";
import { enUS } from "date-fns/locale";

import { Button } from "@consta/uikit/Button";
import { DatePicker } from "@consta/uikit/DatePicker";
import { Modal } from "@consta/uikit/Modal";
import { Text } from "@consta/uikit/Text";

import type { Car } from "@/entities/car/model/types";
import { useCreateBookingMutation } from "@/features/booking/api/bookingsApi";
import { countDays } from "@/features/booking/lib/bookingPeriod";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatPrice, toIsoDate } from "@/shared/lib/format";

import styles from "./styles.module.css";

interface ReserveCarModalProps {
  car: Car | null;
  onClose: () => void;
}

type RentalRange = [Date?, Date?] | null;

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const ReserveCarModal = ({ car, onClose }: ReserveCarModalProps) => {
  const [range, setRange] = useState<RentalRange>(null);
  const [error, setError] = useState<string | null>(null);
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const start = range?.[0];
  const end = range?.[1];
  const days = start && end ? countDays(toIsoDate(start), toIsoDate(end)) : 0;

  const [shownCarId, setShownCarId] = useState(car?.id);
  if (car?.id !== shownCarId) {
    setShownCarId(car?.id);
    setRange(null);
    setError(null);
  }

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    if (!car || !start || !end || days < 1) {
      return;
    }

    try {
      setError(null);
      await createBooking({
        carId: car.id,
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
      }).unwrap();
      onClose();
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          "Could not reserve this car. Please try again.",
        ),
      );
    }
  };

  return (
    <Modal
      isOpen={car !== null}
      hasOverlay
      className={styles.modal}
      onClose={handleClose}
      onEsc={handleClose}
    >
      {car && (
        <div className={styles.content}>
          <Text size="xl" weight="semibold" view="primary">
            Reserve {car.brand} {car.model}
          </Text>
          <DatePicker
            type="date-range"
            label="Rental period"
            placeholder={["Start", "End"]}
            caption="The car is free again on the end date."
            locale={enUS}
            minDate={startOfToday()}
            value={range}
            className={styles.period}
            dropdownClassName={styles.dropdown}
            onChange={(value) => {
              setRange(value);
              setError(null);
            }}
          />
          {days > 0 && (
            <Text size="m" view="primary">
              {days} {days === 1 ? "day" : "days"} ·{" "}
              {formatPrice(days * car.pricePerDay)}
            </Text>
          )}
          {error && (
            <Text size="s" view="alert">
              {error}
            </Text>
          )}
          <div className={styles.actions}>
            <Button
              label="Reserve"
              view="primary"
              className={styles.reserve}
              loading={isLoading}
              disabled={days < 1}
              onClick={handleSubmit}
            />
            <Button
              label="Cancel"
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
