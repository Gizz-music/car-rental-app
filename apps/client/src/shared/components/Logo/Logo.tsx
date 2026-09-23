import { useNavigate } from "react-router-dom";

import styles from "./styles.module.css";

export const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.textWrapper} onClick={() => navigate("/")}>
      <h2 className={styles.text}>The Rental City</h2>
    </div>
  );
};
