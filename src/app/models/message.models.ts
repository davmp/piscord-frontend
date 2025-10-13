export interface MessagePaginationResult {
  data: Message[];
  total: number;
  page: number;
  size: number;
}

export type MessageResponseType =
  | "message_sent"
  | "message_edited"
  | "message_deleted";
export type MessageType = "text" | "image" | "file";
export type MessageAction = "send_message" | "edit_message" | "delete_message";

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  picture?: string;
  content: string;
  type: MessageType | "system";
  is_own_message: boolean;
  file_url?: string;
  reply_to?: SelectedReplyMessage;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SelectedReplyMessage {
  id: string;
  user_id: string;
  picture?: string;
  username: string;
  content: string;
}

export interface SelectedMessageEdit {
  id: string;
  content: string;
}

export interface DisplayMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  picture?: string;
  file_url?: string;
  reply_to?: SelectedReplyMessage;
  is_edited: boolean;
  content: string;
  created_at: string;
  is_own_message: boolean;
}

export interface MessagePreviewResponse {
  id: string;
  room_id: string;
  username: string;
  content: string;
  created_at: string;
}

export type SendMessageRequestDto = {
  roomId: string;
  content: string;
  type?: MessageType;
  replyTo?: string;
};

export type MessageResponseDto = {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  type: MessageType | "system";
  fileUrl?: string;
  replyTo?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface WSMessage {
  type: string;
  payload?: {
    [key: string]: any;
  };
}

export interface WSResponse {
  type: string;
  success: boolean;
  data: {
    message: Message;
    is_own_message: boolean;
    [key: string]: any;
  };
}

export interface SendMessageWSPayload {
  id: string;
  room_id: string;
  content: string;
  type: MessageType;
  reply_to?: string;
  is_own_message: boolean;
  user: MessageUser;
}

export interface MessageUser {
  id: string;
  username: string;
  picture?: string;
}
