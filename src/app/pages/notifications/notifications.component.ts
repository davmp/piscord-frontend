import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Avatar } from "primeng/avatar";
import type { Notification } from "../../models/notification.models";
import { NotificationService } from "../../services/notification/notification.service";
import * as formThemes from "../../themes/form.themes";

@Component({
  selector: "app-notifications",
  imports: [Avatar, RouterLink],
  templateUrl: "./notifications.component.html",
})
export class NotificationsComponent {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = false;
  notifications: Notification[] = [];

  buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.loadNotifications();

    this.notificationService.notificationSubscription.subscribe(
      (notification) => {
        console.log("New notification arrived: ", notification);
        this.loadNotifications();
      }
    );
  }

  loadNotifications() {
    this.isLoading = true;

    this.notificationService.getMyNotifications().subscribe((res) => {
      const notifications = res.data as Notification[];
      this.notifications = notifications;
    });

    this.isLoading = false;
  }

  handleClickNotification(notification: Notification) {
    this.handleReadNotification(notification.id);

    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  handleReadNotification(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
    this.notificationService.notificationSubscription.next(null);
  }

  handleReadAllNotifications() {
    this.notificationService.markAllAsRead();
    this.notificationService.notificationSubscription.next(null);
  }

  handleDeleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId);
    this.notificationService.notificationSubscription.next(null);
  }

  handleDeleteAllNotifications() {
    this.notificationService.deleteAllMyNotifications();
    this.notificationService.notificationSubscription.next(null);
  }

  formattedDate(createdAt: string): string {
    const date = new Date(createdAt);
    return date.toLocaleTimeString(["pt-BR"], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}
