import { useState } from "react";

import { Informer } from "@consta/uikit/Informer";
import { Loader } from "@consta/uikit/Loader";
import { Text } from "@consta/uikit/Text";

import { useMyBookingsQuery } from "../../api/bookingsApi";
import type { Booking } from "../../model/types";
import { BookingCard } from "../BookingCard";
import { CancelBookingModal } from "../CancelBookingModal";
import { DeleteBookingModal } from "../DeleteBookingModal";

import styles from "./styles.module.css";

export const BookingList = () => {
  const { data: bookings, isLoading, isError } = useMyBookingsQuery();
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  if (isLoading) {
    return <Loader className={styles.loader} />;
  }

  if (isError) {
    return (
      <Informer
        status="alert"
        view="filled"
        title="Failed to load bookings"
        label="Please try again later."
      />
    );
  }

  if (!bookings?.length) {
    return (
      <Text size="m" view="secondary" className={styles.empty}>
        You have no bookings yet.
      </Text>
    );
  }

  return (
    <>
      <ul className={styles.list}>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <BookingCard
              booking={booking}
              onCancel={setBookingToCancel}
              onDelete={setBookingToDelete}
            />
          </li>
        ))}
      </ul>
      <CancelBookingModal
        booking={bookingToCancel}
        onClose={() => setBookingToCancel(null)}
      />
      <DeleteBookingModal
        booking={bookingToDelete}
        onClose={() => setBookingToDelete(null)}
      />
    </>
  );
};
