import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Avatar } from "primeng/avatar";
import { DeviceService } from "../../../services/device.service";
import { RoomService } from "../../../services/room/room.service";
import * as formThemes from "../../../themes/form.themes";

@Component({
  selector: "app-header",
  imports: [Avatar, RouterLink],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  private roomService = inject(RoomService);
  private deviceService = inject(DeviceService);

  selectedRoom = computed(() => this.roomService.selectedRoom());

  readonly buttonThemes = formThemes.buttonThemes;

  isMobile() {
    return this.deviceService.isMobile();
  }
}
