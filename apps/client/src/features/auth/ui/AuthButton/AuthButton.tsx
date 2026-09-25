import { useNavigate } from "react-router-dom";

import { Button } from "@consta/uikit/Button";
import { User } from "@consta/uikit/User";

import { useAppSelector } from "@/app/hooks";
import { selectCurrentUser } from "@/features/auth/model/authSlice";

import styles from "./styles.module.css";

export const AuthButton = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

  if (user) {
    return (
      <User
        as="button"
        type="button"
        size="l"
        name={user.name}
        title="Personal account"
        className={styles.user}
        onClick={() => navigate("/profile")}
      />
    );
  }

  return (
    <Button
      size="l"
      label="Login"
      className={styles.button}
      onClick={() => navigate("/login")}
    />
  );
};
