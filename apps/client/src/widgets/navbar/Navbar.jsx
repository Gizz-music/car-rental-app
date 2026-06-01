import React from "react";

import styles from "./styles.module.css";

export const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.textWrapper}>
        <h2 className={styles.text}>The Rental City</h2>
      </div>
    </div>
  );
};
