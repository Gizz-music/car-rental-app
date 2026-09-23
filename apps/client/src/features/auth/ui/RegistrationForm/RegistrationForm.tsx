import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { TextField } from "@consta/uikit/TextField";

import { useRegisterMutation } from "@/features/auth/api/authApi";
import { isValidEmail, isValidPassword } from "@/features/auth/lib/validation";
import { Form } from "@/shared/components/Form";

import styles from "../authForm.module.css";

export const RegistrationForm = () => {
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isNameValid = name.trim().length > 0;
  const isEmailValid = isValidEmail(email);
  const isPasswordValid = isValidPassword(password);

  const handleSubmit = async () => {
    try {
      setError(null);
      await register({ name, email, password }).unwrap();
      navigate("/");
    } catch {
      setError("Failed to register. Try another email.");
    }
  };

  return (
    <Form>
      <Text size="xl" view="primary">
        Registration Form
      </Text>
      <TextField
        type="text"
        value={name}
        required={!isNameValid}
        label="Full name"
        className={styles.textField}
        placeholder="Add your full name"
        onChange={(value: string | null) => setName(value ?? "")}
      />
      <TextField
        type="email"
        label="Email"
        value={email}
        placeholder="Add your email"
        className={styles.textField}
        required={!isEmailValid}
        onChange={(value: string | null) => setEmail(value ?? "")}
      />
      <TextField
        type="password"
        label="Password"
        value={password}
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
          view="primary"
          label="REGISTER"
          loading={isLoading}
          onClick={handleSubmit}
          className={styles.button}
          disabled={!isNameValid || !isEmailValid || !isPasswordValid}
        />
        <Button
          label="CANCEL"
          view="primary"
          className={styles.button}
          onClick={() => navigate("/")}
        />
      </div>
    </Form>
  );
};
