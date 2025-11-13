import { Component, inject, output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router, RouterLink } from "@angular/router";
import type { MenuItem } from "primeng/api";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Drawer } from "primeng/drawer";
import { Menu } from "primeng/menu";
import { DeviceService } from "../../../../services/device.service";
import { NotificationService } from "../../../../services/notification/notification.service";
import { AuthService } from "../../../../services/user/auth/auth.service";
import * as formThemes from "../../../../themes/form.themes";

@Component({
  selector: "app-user-info",
  imports: [Avatar, Menu, Drawer, Button, RouterLink],
  templateUrl: "./user-info.component.html",
})
export class UserInfoComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private deviceService = inject(DeviceService);

  profile = signal(this.authService.profileChanged.value);
  visible = signal(false);
  unreadNotificationCount = signal(undefined as string | undefined);
  setOpenModal = output<"createRoom" | "findRooms">();

  readonly menuThemes = formThemes.menuThemes;
  readonly buttonThemes = formThemes.buttonThemes;
  readonly actions: MenuItem[] = [
    {
      label: "Grupos",
      items: [
        {
          label: "Criar",
          icon: "pi pi-plus",
          command: () => this.setOpenModal.emit("createRoom"),
        },
        {
          label: "Pesquisar",
          icon: "pi pi-comments",
          command: () => this.setOpenModal.emit("findRooms"),
        },
      ],
    },
    {
      label: "Conta",
      items: [
        {
          label: "Configurações",
          icon: "pi pi-cog",
          routerLink: "/settings",
        },
        {
          label: "Sair",
          icon: "pi pi-sign-out",
          command: () => this.handleLogout(),
          styleClass:
            "[&_.p-menu-item-content]:text-red-500! [&_.p-menu-item-icon]:text-red-500!",
        },
      ],
    },
  ];

  constructor() {
    this.authService.profileChanged
      .pipe(takeUntilDestroyed())
      .subscribe((profile) => this.profile.set(profile));

    this.notificationService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadNotificationCount();
      });
  }

  loadNotificationCount() {
    this.notificationService.getUnreadNotificationCount().subscribe((count) => {
      if (count) {
        const showCount = count >= 100 ? "99+" : count.toString();
        this.unreadNotificationCount.set(showCount);
      }
    });
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }

  isMobile() {
    return this.deviceService.isMobile();
  }
}
