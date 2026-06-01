import React from "react";

import styles from "./styles.module.css";

export const BaseLayout = ({ children }) => {
  return <div className={styles.page_container}>{children}</div>;
};
