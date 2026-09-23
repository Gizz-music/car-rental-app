import { useNavigate } from "react-router-dom";

import { Button } from "@consta/uikit/Button";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/api/authApi";
import { selectCurrentUser } from "@/features/auth/model/authSlice";
import { baseApi } from "@/shared/api/baseApi";

import styles from "./styles.module.css";

export const AuthButton = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logout, { isLoading }] = useLogoutMutation();
  const user = useAppSelector(selectCurrentUser);

  const handleNavigate = () => navigate("/login");
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
      size="l"
      label={user ? "Logout" : "Login"}
      loading={isLoading}
      className={styles.button}
      onClick={user ? handleLogout : handleNavigate}
    />
  );
};
