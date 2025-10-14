import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import type { Message } from "../../models/message.models";
import type {
  Notification,
  NotificationsResponse,
} from "../../models/notification.models";
import { WebsocketService } from "../chat/ws.service";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly notificationApiUrl =
    "http://127.0.0.1:8000/api/notifications";
  private wsService = inject(WebsocketService);
  private http = inject(HttpClient);

  messageSubscription: Subject<Message> = new Subject();
  notificationSubscription: Subject<Notification | null> = new Subject();

  constructor() {
    this.subscribeToNotifications();
  }

  private subscribeToNotifications(): void {
    this.wsService.connection().subscribe({
      next: (message) => {
        if (!message.data) {
          return;
        }

        if (message.type === "notification") {
          this.notificationSubscription.next(message);
        }
        if (message.type === "message_notification") {
          this.messageSubscription.next(message.data);
        }
      },
    });
  }

  getMyNotifications() {
    return this.http.get<NotificationsResponse>(this.notificationApiUrl);
  }

  deleteNotification(notificationId: string) {
    return this.http
      .delete(`${this.notificationApiUrl}/${notificationId}`)
      .subscribe((res) => res);
  }

  deleteAllMyNotifications() {
    return this.http
      .delete(`${this.notificationApiUrl}/delete-all`)
      .subscribe((res) => res);
  }

  getUnreadNotificationCount() {
    return this.http.get<number>(`${this.notificationApiUrl}/unread-count`);
  }

  markAsRead(notificationId: string) {
    return this.http
      .put(`${this.notificationApiUrl}/${notificationId}/read`, {})
      .subscribe((res) => res);
  }

  markAllAsRead() {
    return this.http
      .put(`${this.notificationApiUrl}/read-all`, {})
      .subscribe((res) => res);
  }
}
