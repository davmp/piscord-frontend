import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SplitterModule } from "primeng/splitter";
import { DeviceService } from "../../services/device.service";
import { CreateRoomModalComponent } from "../display/create-room-modal/create-room-modal.component";
import { FindRoomModalComponent } from "../display/find-room-modal/find-room-modal.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

@Component({
  selector: "app-layout",
  imports: [
    RouterOutlet,
    CreateRoomModalComponent,
    FindRoomModalComponent,
    SidebarComponent,
    SplitterModule,
  ],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {
  private deviceService = inject(DeviceService);

  createRoomModalVisible = signal(false);
  findRoomModalVisible = signal(false);

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
    return this.deviceService.isInPathname(["/", "/chat"]);
  }
}
