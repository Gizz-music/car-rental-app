import type { ReactNode } from "react";

import styles from "./styles.module.css";

interface FormProps {
  children: ReactNode;
}

export const Form = ({ children }: FormProps) => {
  return <div className={styles.formContainer}>{children}</div>;
};
