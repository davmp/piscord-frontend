import type { Profile } from "./user.models";

export interface AuthResponse {
  token: string;
  user: Profile;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  picture: string;
  password: string;
}
