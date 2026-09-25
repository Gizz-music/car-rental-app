import { useMediaQuery } from "@/shared/lib/useMediaQuery";

// Брейкпоинты совпадают с CSS каталога: сетка 3×2, 2×2 или одна карточка;
// на низких экранах — компактные отступы
const TABLET_QUERY = "(max-width: 1024px)";
const MOBILE_QUERY = "(max-width: 600px)";
const COMPACT_QUERY = "(max-width: 600px), (max-height: 760px)";

const getPageSize = (isTablet: boolean, isMobile: boolean) => {
  if (isMobile) {
    return 1;
  }
  return isTablet ? 4 : 6;
};

// Столько авто, сколько помещается на экране без прокрутки
export const useCatalogLayout = () => {
  const isTablet = useMediaQuery(TABLET_QUERY);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const isCompact = useMediaQuery(COMPACT_QUERY);

  return { pageSize: getPageSize(isTablet, isMobile), isCompact };
};
