import { Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router, RouterLink } from "@angular/router";
import { Avatar } from "primeng/avatar";
import type { Notification } from "../../models/notification.models";
import { NotificationService } from "../../services/notification/notification.service";
import * as formThemes from "../../themes/form.themes";
import { formatDate } from "../../utils/date-formatter";

@Component({
  selector: "app-notifications",
  imports: [Avatar, RouterLink],
  templateUrl: "./notifications.component.html",
})
export class NotificationsComponent {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  notifications = signal([] as Notification[]);

  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.loadNotifications();

    this.notificationService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadNotifications());
  }

  loadNotifications() {
    this.isLoading.set(true);

    this.notificationService.getMyNotifications().subscribe((res) => {
      this.notifications.set(res.data as Notification[]);
    });

    this.isLoading.set(false);
  }

  handleClickNotification(notification: Notification) {
    this.handleReadNotification(notification.id);

    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  handleReadNotification(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log("Notification marked as read");
        this.notificationService.reladNotifications();
      },
      error: (err) => {
        console.error("Error reading notification: ", err);
      },
    });
  }

  handleReadAllNotifications() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.reladNotifications();
      },
      error: (err) => {
        console.error("Error reading alll notifications: ", err);
      },
    });
  }

  handleDeleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notificationService.reladNotifications();
      },
      error: (err) => {
        console.error("Error deleting notification: ", err);
      },
    });
  }

  handleDeleteAllNotifications() {
    this.notificationService.deleteAllMyNotifications().subscribe({
      next: () => {
        this.notificationService.reladNotifications();
      },
      error: (err) => {
        console.error("Error deleting all notifications: ", err);
      },
    });
  }

  formattedDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = now.getDate() - date.getDate();

    if (diffDays < 1) {
      return formatDate(dateStr);
    } else {
      return formatDate(dateStr, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  }
}
