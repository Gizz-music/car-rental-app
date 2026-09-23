import AutoIcon from "@/assets/icons/auto.svg";
import RepairIcon from "@/assets/icons/repair.svg";
import IncomeIcon from "@/assets/icons/income.svg";
import CommunicationIcon from "@/assets/icons/communication.svg";

import styles from "./styles.module.css";

interface HomeCard {
  icon: string;
  title: string;
}

const CARDS: HomeCard[] = [
  { icon: AutoIcon, title: "Auto" },
  { icon: IncomeIcon, title: "Income" },
  { icon: RepairIcon, title: "Repair" },
  { icon: CommunicationIcon, title: "Communication" },
];

export const HomePage = () => {
  return (
    <div className={styles.container}>
      {CARDS.map(({ icon, title }) => (
        <div key={title} className={styles.card}>
          <img src={icon} alt={title} className={styles.icon} />
        </div>
      ))}
    </div>
  );
};
