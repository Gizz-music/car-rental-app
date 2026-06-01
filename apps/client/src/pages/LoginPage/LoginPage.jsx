import React from "react";

import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { TextField } from "@consta/uikit/TextField";
import { Form } from "@/shared/components/Form/index.js";

import styles from "./styles.module.css";

export const LoginPage = () => {
  return (
    <Form>
      <Text size="xl" view="primary">
        Login Form
      </Text>
      <TextField
        className={styles.textField}
        type="text"
        label="Full name"
        required
        placeholder="Add your full name"
      />
      <TextField
        className={styles.textField}
        type="number"
        label="Password"
        required
        step={0}
        min={7}
        placeholder="Add your password"
      />
      <Button
        className={styles.button}
        label="LOGIN"
        disabled
        view="primary"
        loading={false}
      />
      <Button className={styles.button} label="CANCEL" view="primary" />
    </Form>
  );
};
