import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SplitterModule } from "primeng/splitter";
import { DeviceService } from "../../services/device.service";
import { AuthService } from "../../services/user/auth/auth.service";
import { CreateRoomComponent } from "../chat/modals/create-room/create-room.component";
import { FindRoomComponent } from "../chat/modals/find-room/find-room.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

@Component({
  selector: "app-layout",
  imports: [
    RouterOutlet,
    CreateRoomComponent,
    FindRoomComponent,
    SidebarComponent,
    SplitterModule,
  ],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {
  authService = inject(AuthService);
  private deviceService = inject(DeviceService);

  createRoomModalVisible = signal(false);
  findRoomModalVisible = signal(false);

  roomId: string | null = null;

  handleOpenModal(type: string) {
    if (type === "createRoom") {
      this.createRoomModalVisible.set(true);
    } else if (type === "findRooms") {
      this.findRoomModalVisible.set(true);
    }
  }

  isMobile() {
    return this.deviceService.isMobile();
  }

  isHome() {
    return this.deviceService.isInPathname(["/", "chat"]);
  }
}
