export interface Notification {
  id: string;
  title: string;
  link: string;
  picture?: string;
  content: string;
  object_id: string;
  type: string;
  read_at: string;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
}

export interface WSNotification {
  id: string;
  type: string;
  object_id: string;
}

export interface MessageNotification {}
