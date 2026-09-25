import { Link } from "react-router-dom";

import AutoIcon from "@/assets/icons/auto.svg";
import RepairIcon from "@/assets/icons/repair.svg";
import IncomeIcon from "@/assets/icons/income.svg";
import CommunicationIcon from "@/assets/icons/communication.svg";

import styles from "./styles.module.css";

interface HomeCard {
  icon: string;
  title: string;
  to?: string;
}

const CARDS: HomeCard[] = [
  { icon: AutoIcon, title: "Auto", to: "/cars" },
  { icon: IncomeIcon, title: "Income" },
  { icon: RepairIcon, title: "Repair" },
  { icon: CommunicationIcon, title: "Communication" },
];

export const HomePage = () => {
  return (
    <div className={styles.container}>
      {CARDS.map(({ icon, title, to }) => {
        const content = (
          <img src={icon} alt={title} className={styles.icon} />
        );

        if (to) {
          return (
            <Link key={title} to={to} className={styles.card} aria-label="Cars">
              {content}
            </Link>
          );
        }

        return (
          <div key={title} className={styles.card}>
            {content}
          </div>
        );
      })}
    </div>
  );
};
