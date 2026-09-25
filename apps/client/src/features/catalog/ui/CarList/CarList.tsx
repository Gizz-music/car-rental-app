import { useEffect, useState } from "react";

import { Informer } from "@consta/uikit/Informer";
import { Loader } from "@consta/uikit/Loader";
import { Pagination } from "@consta/uikit/Pagination";
import { Text } from "@consta/uikit/Text";

import { useCarsQuery } from "@/entities/car/api/carsApi";
import type { Car } from "@/entities/car/model/types";
import { ReserveCarModal } from "@/features/booking/ui/ReserveCarModal";
import { usePageParam } from "@/shared/lib/usePageParam";
import { useSwipe } from "@/shared/lib/useSwipe";

import { useCatalogLayout } from "../../model/useCatalogLayout";
import { CarCard } from "../CarCard";

import styles from "./styles.module.css";

export const CarList = () => {
  const { pageSize, isCompact } = useCatalogLayout();
  const [page, setPage] = usePageParam();
  const { data, isLoading, isFetching, isError } = useCarsQuery({
    page,
    pageSize,
  });
  const [carToReserve, setCarToReserve] = useState<Car | null>(null);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const goToPage = (nextPage: number) => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      setPage(nextPage);
    }
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => goToPage(page + 1),
    onSwipeRight: () => goToPage(page - 1),
  });

  // Страница из URL может оказаться за пределами после смены размера экрана
  useEffect(() => {
    if (totalPages && page > totalPages) {
      setPage(totalPages, { replace: true });
    }
  }, [page, totalPages, setPage]);

  if (isLoading) {
    return <Loader className={styles.loader} />;
  }

  if (isError) {
    return (
      <Informer
        status="alert"
        view="filled"
        title="Failed to load cars"
        label="Please try again later."
      />
    );
  }

  if (!data?.total) {
    return (
      <Text size="m" view="secondary" className={styles.empty}>
        No cars found.
      </Text>
    );
  }

  return (
    <div className={styles.catalog}>
      <ul
        className={styles.list}
        aria-busy={isFetching}
        data-fetching={isFetching}
        {...swipeHandlers}
      >
        {data.items.map((car) => (
          <li key={car.id} className={styles.item}>
            <CarCard car={car} onReserve={setCarToReserve} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          className={styles.pagination}
          items={totalPages}
          value={page}
          onChange={goToPage}
          size={isCompact ? "s" : "m"}
          form="round"
          arrows={[true, true]}
          showFirstPage
          showLastPage
        />
      )}
      <ReserveCarModal
        car={carToReserve}
        onClose={() => setCarToReserve(null)}
      />
    </div>
  );
};
