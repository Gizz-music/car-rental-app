import { join } from 'node:path';

export * as auth from './generated/auth/auth';

export const PROTO_ROOT = join(__dirname, '..', 'proto');
export const AUTH_PROTO_PATH = join(PROTO_ROOT, 'auth', 'auth.proto');
