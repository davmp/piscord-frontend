import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { filter, map, merge, share, Subject } from "rxjs";
import type { NotificationsResponse } from "../../models/notification.models";
import { WebsocketService } from "../chat/ws.service";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly notificationApiUrl = "/api/notifications";
  private wsService = inject(WebsocketService);
  private http = inject(HttpClient);

  private manualRefresh$ = new Subject<void>();
  readonly notifications$ = merge(
    this.wsService.connection().pipe(
      filter((msg) => msg.type === "notification"),
      map(() => true)
    ),
    this.manualRefresh$
  ).pipe(share());
  readonly messages$ = this.wsService.connection().pipe(
    filter((msg) => msg.type === "message_notification"),
    map((message) => message.data),
    share()
  );

  getMyNotifications() {
    return this.http.get<NotificationsResponse>(this.notificationApiUrl);
  }

  deleteNotification(notificationId: string) {
    return this.http.delete(`${this.notificationApiUrl}/${notificationId}`);
  }

  deleteAllMyNotifications() {
    return this.http.delete(`${this.notificationApiUrl}/delete-all`);
  }

  getUnreadNotificationCount() {
    return this.http.get<number>(`${this.notificationApiUrl}/unread-count`);
  }

  markAsRead(notificationId: string) {
    return this.http.put(
      `${this.notificationApiUrl}/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead() {
    return this.http.put(`${this.notificationApiUrl}/read-all`, {});
  }

  reladNotifications() {
    this.manualRefresh$.next();
  }
}
