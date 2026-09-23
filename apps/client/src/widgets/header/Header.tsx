import { AuthButton } from "@/features/auth/ui/AuthButton";
import { Logo } from "@/shared/components/Logo";

import styles from "./styles.module.css";

export const Header = () => {
  return (
    <div className={styles.container}>
      <Logo />
      <AuthButton />
    </div>
  );
};
