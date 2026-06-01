import React from "react";

import AutoIcon from "@/assets/icons/auto.svg";
import RepairIcon from "@/assets/icons/repair.svg";
import IncomeIcon from "@/assets/icons/income.svg";
import CommunicationIcon from "@/assets/icons/communication.svg";

import styles from "./styles.module.css";

export const HomePage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src={AutoIcon} alt="Auto" width="150" height="150" />
      </div>
      <div className={styles.card}>
        <img src={IncomeIcon} alt="Income" width="150" height="150" />
      </div>
      <div className={styles.card}>
        <img src={RepairIcon} alt="Repair" width="150" height="150" />
      </div>
      <div className={styles.card}>
        <img
          src={CommunicationIcon}
          alt="Communication"
          width="150"
          height="150"
        />
      </div>
    </div>
  );
};
