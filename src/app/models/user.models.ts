export interface User {
  id: string;
  username: string;
  picture?: string;
  bio?: string;
  created_at: string;
}

export interface Profile extends User {
  is_online: boolean;
  direct_chat_id: string;
}

export interface UpdateProfileRequest {
  username?: string;
  picture?: string;
  password?: string;
  bio?: string;
}
