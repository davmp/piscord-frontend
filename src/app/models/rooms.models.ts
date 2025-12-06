import type { MessagePreview } from "./message.models";

export interface GetRooms<T = Room> {
  data: T[];
  total: number;
}

export type RoomType = "PUBLIC" | "PRIVATE" | "DIRECT";

export interface Room {
  id: string;
  displayName: string;
  description?: string;
  picture?: string;
  type: RoomType;
  isAdmin: boolean;
  lastMessage?: MessagePreview;
}

export interface RoomDetails {
  id: string;
  displayName: string;
  description?: string;
  picture?: string;
  type: RoomType;
  maxMembers?: number;
  members: RoomMember[];
  isMember: boolean;
  isAdmin: boolean;
  ownerId: string;
  updatedAt: string;
  createdAt: string;
}

export interface DirectRoomDetails extends RoomDetails {
  id: string;
  displayName: string;
  description?: string;
  picture?: string;
  type: "PRIVATE";
  maxMembers?: 2;
  members: RoomMember[];
  admins: [];
  isMember: true;
  isAdmin: false;
  ownerId: string;
  updatedAt: string;
  createdAt: string;
}

export interface PublicRoom {
  id: string;
  displayName: string;
  description?: string;
  picture?: string;
  updatedAt: Date;
  type: "PUBLIC";
  maxMembers?: number;
  membersCount: number;
  ownerId: string;
  isAdmin: boolean;
  isMember: boolean;
}

export interface CreateRoomRequest {
  name?: string;
  description?: string;
  picture?: string;
  type: RoomType;
  members: string[];
  admins: string[];
  maxMembers: number;
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  picture?: string;
  maxMembers?: number;
}

export interface RoomMember {
  userId: string;
  username: string;
  picture?: string;
  isAdmin: boolean;
  isOnline: boolean;
  isMe: boolean;
}
