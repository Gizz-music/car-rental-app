import React from "react";

import styles from "./styles.module.css";

export const Form = ({ children }) => {
  return <div className={styles.formContainer}>{children}</div>;
};
