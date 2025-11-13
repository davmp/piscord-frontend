import type { MessagePreviewResponse } from "./message.models";

export interface GetRooms<T = Room> {
  data: T[];
  total: number;
}

export interface Room {
  id: string;
  display_name: string;
  description?: string;
  picture?: string;
  type: "public" | "private" | "direct";
  max_members?: number;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
  last_message?: MessagePreviewResponse;
  owner_id: string;
  updated_at: string;
  created_at: string;
}
export interface RoomDetails {
  id: string;
  display_name: string;
  description?: string;
  picture?: string;
  type: "public" | "private" | "direct";
  max_members?: number;
  member_count: number;
  members: RoomMember[];
  admins: RoomMember[];
  is_member: boolean;
  is_admin: boolean;
  owner_id: string;
  updated_at: string;
  created_at: string;
}

export interface DirectRoomDetails extends RoomDetails {
  id: string;
  display_name: string;
  description?: string;
  picture?: string;
  type: "private";
  max_members?: 2;
  member_count: 2;
  members: RoomMember[];
  admins: [];
  is_member: true;
  is_admin: false;
  owner_id: string;
  updated_at: string;
  created_at: string;
}

export interface PublicRoom {
  id: string;
  display_name: string;
  description?: string;
  picture?: string;
  updatedAt: Date;
  type: "public";
  max_members?: number;
  member_count: number;
  owner_id: string;
  is_member: boolean;
}

export interface CreateRoomRequest {
  name?: string;
  description?: string;
  picture?: string;
  type: "public" | "private" | "direct";
  max_members: number;
  participant_ids: string[];
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  picture?: string;
  max_members?: number;
  remove_participant_ids: string[];
}

export interface RoomMember {
  user_id: string;
  username: string;
  picture?: string;
  is_online: boolean;
  is_me: boolean;
}
