import type { ReactNode } from "react";

import styles from "./styles.module.css";

interface BaseLayoutProps {
  children: ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return <div className={styles.page_container}>{children}</div>;
};
