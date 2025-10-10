import { Component, inject, output, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import type { MenuItem } from "primeng/api";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Drawer } from "primeng/drawer";
import { Menu } from "primeng/menu";
import type { User } from "../../../../models/user.models";
import { AuthService } from "../../../../services/auth/auth.service";
import { DeviceService } from "../../../../services/device.service";
import * as formThemes from "../../../../themes/form.themes";

@Component({
  selector: "app-user-info",
  imports: [Avatar, Menu, Drawer, Button, RouterLink],
  templateUrl: "./user-info.component.html",
  styles: ``,
})
export class UserInfoComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private deviceService = inject(DeviceService);

  user: Partial<User> = {};
  visible = signal(false);
  setOpenModal = output<"createRoom" | "findRooms">();

  menuThemes = formThemes.menuThemes;
  buttonThemes = formThemes.buttonThemes;

  actions: MenuItem[] = [
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

  ngOnInit() {
    const user = this.authService.getUser();

    if (user) {
      this.user = user;
    } else {
      this.authService.logout();
    }
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }

  isMobile() {
    return this.deviceService.isMobile();
  }
}
