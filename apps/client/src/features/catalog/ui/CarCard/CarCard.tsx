import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";

import { useAppSelector } from "@/app/hooks";
import type { Car, CarWithAvailability } from "@/entities/car/model/types";
import { selectCurrentUser } from "@/features/auth/model/authSlice";
import { formatDate, formatLabel, formatPrice } from "@/shared/lib/format";

import styles from "./styles.module.css";

interface CarCardProps {
  car: CarWithAvailability;
  onReserve: (car: Car) => void;
}

export const CarCard = ({ car, onReserve }: CarCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const name = `${car.brand} ${car.model}`;

  const handleReserve = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    onReserve(car);
  };

  return (
    <article className={styles.card}>
      {car.imageUrl ? (
        <img src={car.imageUrl} alt={name} className={styles.image} />
      ) : (
        <div className={styles.image} role="img" aria-label={name} />
      )}
      <Text size="l" weight="semibold" view="primary">
        {name}
      </Text>
      <Text size="s" view="secondary">
        {car.year} · {car.seats} seats · {formatLabel(car.transmission)} ·{" "}
        {formatLabel(car.fuelType)}
      </Text>
      <div className={styles.footer}>
        <Text size="m" weight="bold" view="brand">
          {formatPrice(car.pricePerDay)} / day
        </Text>
        <div className={styles.action}>
          {car.available ? (
            <Button
              width="full"
              label="Reserve"
              className={styles.reserve}
              onClick={handleReserve}
            />
          ) : (
            <Text size="s" weight="semibold" view="alert" align="center">
              {car.unavailableUntil
                ? `Unavailable until ${formatDate(car.unavailableUntil)}`
                : "Unavailable"}
            </Text>
          )}
        </div>
      </div>
    </article>
  );
};
