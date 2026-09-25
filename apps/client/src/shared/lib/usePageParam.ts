import { useCallback } from "react";
import { useSearchParams, type NavigateOptions } from "react-router-dom";

const PAGE_PARAM = "page";

// Номер страницы (с 1) в ?page=N: переживает перезагрузку, работает кнопка «Назад»
export const usePageParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Math.floor(Number(searchParams.get(PAGE_PARAM))) || 1);

  const setPage = useCallback(
    (nextPage: number, options?: NavigateOptions) =>
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        if (nextPage > 1) {
          next.set(PAGE_PARAM, String(nextPage));
        } else {
          next.delete(PAGE_PARAM);
        }
        return next;
      }, options),
    [setSearchParams],
  );

  return [page, setPage] as const;
};
