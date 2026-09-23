export interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface AuthState {
  user: User | null;
}
