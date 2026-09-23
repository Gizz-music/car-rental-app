const PASSWORD_MIN_LENGTH = 7;

export const isValidEmail = (email: string): boolean =>
  email.trim().includes("@");

export const isValidPassword = (password: string): boolean =>
  password.length >= PASSWORD_MIN_LENGTH;
