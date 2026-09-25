import { Avatar } from "@consta/uikit/Avatar";
import { Badge } from "@consta/uikit/Badge";
import { Text } from "@consta/uikit/Text";

import { useAppSelector } from "@/app/hooks";
import { selectCurrentUser } from "@/features/auth/model/authSlice";
import { LogoutButton } from "@/features/auth/ui/LogoutButton";
import { BookingList } from "@/features/booking/ui/BookingList";

import styles from "./styles.module.css";

export const ProfilePage = () => {
  // Страница доступна только через RequireAuth, поэтому пользователь всегда есть
  const user = useAppSelector(selectCurrentUser)!;

  return (
    <div className={styles.container}>
      <section className={styles.profile}>
        <Avatar size="l" name={user.name} className={styles.avatar} />
        <Text size="2xl" weight="semibold" view="primary">
          {user.name}
        </Text>
        <Text size="m" view="secondary" className={styles.email}>
          {user.email}
        </Text>
        <div className={styles.roles}>
          {user.roles.map((role) => (
            <Badge key={role} size="s" view="stroked" label={role} />
          ))}
        </div>
        <LogoutButton />
      </section>

      <section className={styles.bookings}>
        <Text as="h2" size="xl" weight="semibold" view="primary">
          My bookings
        </Text>
        <BookingList />
      </section>
    </div>
  );
};
