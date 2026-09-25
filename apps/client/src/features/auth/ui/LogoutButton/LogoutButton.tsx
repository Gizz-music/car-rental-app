import { useNavigate } from "react-router-dom";

import { IconExit } from "@consta/icons/IconExit";
import { Button } from "@consta/uikit/Button";

import { useAppDispatch } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/api/authApi";
import { baseApi } from "@/shared/api/baseApi";

import styles from "./styles.module.css";

export const LogoutButton = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();

      // Полностью очищаем кэш всех запросов RTK Query в памяти
      dispatch(baseApi.util.resetApiState());
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <Button
      label="Logout"
      iconLeft={IconExit}
      loading={isLoading}
      className={styles.button}
      onClick={handleLogout}
    />
  );
};
