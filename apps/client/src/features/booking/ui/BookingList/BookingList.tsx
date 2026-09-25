import { Informer } from "@consta/uikit/Informer";
import { Loader } from "@consta/uikit/Loader";
import { Text } from "@consta/uikit/Text";

import { useMyBookingsQuery } from "../../api/bookingsApi";
import { BookingCard } from "../BookingCard";

import styles from "./styles.module.css";

export const BookingList = () => {
  const { data: bookings, isLoading, isError } = useMyBookingsQuery();

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
    <ul className={styles.list}>
      {bookings.map((booking) => (
        <li key={booking.id}>
          <BookingCard booking={booking} />
        </li>
      ))}
    </ul>
  );
};
