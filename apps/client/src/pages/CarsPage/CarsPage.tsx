import { Text } from "@consta/uikit/Text";

import { CarList } from "@/features/catalog/ui/CarList";

import styles from "./styles.module.css";

export const CarsPage = () => {
  return (
    <div className={styles.container}>
      <Text as="h1" size="2xl" weight="semibold" view="primary">
        Cars
      </Text>
      <CarList />
    </div>
  );
};
