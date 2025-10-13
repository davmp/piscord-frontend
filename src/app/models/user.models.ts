export interface Profile {
  id: string;
  username: string;
  picture?: string;
  bio?: string;
  created_at: string;
  is_online: boolean;
}

export interface UpdateProfileRequest {
  username?: string;
  picture?: string;
  password?: string;
  bio?: string;
}
