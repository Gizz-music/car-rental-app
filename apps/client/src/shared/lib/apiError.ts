// Текст ошибки из ответа gateway ({ message }) или запасной вариант
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data && "message" in data) {
      const { message } = data;
      if (typeof message === "string" && message) {
        return message;
      }
    }
  }

  return fallback;
};
