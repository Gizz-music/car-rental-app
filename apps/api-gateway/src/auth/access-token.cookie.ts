import type { CookieOptions } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';

// HTTP-only: токен недоступен JavaScript на фронтенде
export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};
