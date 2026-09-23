import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { TextField } from "@consta/uikit/TextField";

import { useLoginMutation } from "@/features/auth/api/authApi";
import { isValidEmail, isValidPassword } from "@/features/auth/lib/validation";
import { Form } from "@/shared/components/Form";

import styles from "../authForm.module.css";

export const LoginForm = () => {
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = isValidEmail(email);
  const isPasswordValid = isValidPassword(password);

  const handleSubmit = async () => {
    try {
      setError(null);
      await login({ email, password }).unwrap();
      navigate("/");
    } catch {
      setError("Failed to log in. Please check your email and password.");
    }
  };

  return (
    <Form>
      <Text size="xl" view="primary">
        Login Form
      </Text>
      <TextField
        value={email}
        type="email"
        label="Email"
        placeholder="Add your email"
        className={styles.textField}
        required={!isEmailValid}
        onChange={(value: string | null) => setEmail(value ?? "")}
      />
      <TextField
        type="password"
        value={password}
        label="Password"
        className={styles.textField}
        placeholder="Add your password"
        required={!isPasswordValid}
        onChange={(value: string | null) => setPassword(value ?? "")}
      />
      {error && (
        <Text size="s" view="alert">
          {error}
        </Text>
      )}
      <div className={styles.actions}>
        <Button
          label="LOGIN"
          view="primary"
          loading={isLoading}
          onClick={handleSubmit}
          className={styles.button}
          disabled={!isEmailValid || !isPasswordValid}
        />
        <Button
          label="CANCEL"
          view="primary"
          className={styles.button}
          onClick={() => navigate("/")}
        />
      </div>
      <Button
        size="s"
        view="clear"
        label="Registration"
        className={styles.registrationButton}
        onClick={() => navigate("/registration")}
      />
    </Form>
  );
};
