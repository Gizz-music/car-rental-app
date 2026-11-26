import { NavLink } from "react-router-dom";

import { AuthButton } from "@/features/auth/ui/AuthButton";
import { useAppSelector } from "@/app/hooks";
import { selectCurrentUser } from "@/features/auth/model/authSlice";
import { Logo } from "@/shared/components/Logo";

import styles from "./styles.module.css";

export const Header = () => {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className={styles.container}>
      <Logo />
      <div className={styles.actions}>
        {user ? (
          <NavLink
            to="/assistant"
            className={({ isActive }) =>
              isActive
                ? `${styles.assistantLink} ${styles.assistantLinkActive}`
                : styles.assistantLink
            }
          >
            <svg
              className={styles.assistantIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M4.5 5.5h15v10.5H8.2L4.5 19.2V5.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.assistantLabel}>Assistant</span>
          </NavLink>
        ) : null}
        <AuthButton />
      </div>
    </div>
  );
};
