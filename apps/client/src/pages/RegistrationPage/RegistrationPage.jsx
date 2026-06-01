import React from "react";

import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { TextField } from "@consta/uikit/TextField";
import { Form } from "@/shared/components/Form/index.js";

import styles from "./styles.module.css";

export const RegistrationPage = () => {
  return (
    <Form>
      <Text size="xl" view="primary">
        Registration Form
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
        type="text"
        label="Email"
        required
        placeholder="Add your email"
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
        disabled
        loading={false}
        label="REGISTER"
        view="primary"
      />
      <Button className={styles.button} label="CANCEL" view="primary" />
    </Form>
  );
};
