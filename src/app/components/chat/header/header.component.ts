import { Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { DeviceService } from "../../../services/device.service";
import { RoomService } from "../../../services/room/room.service";
import * as formThemes from "../../../themes/form.themes";
import { RoomInfoModalComponent } from "../../display/room-info-modal/room-info-modal.component";
import { UpdateRoomModalComponent } from "../../display/update-room-modal/update-room-modal.component";

@Component({
  selector: "app-header",
  imports: [
    Avatar,
    Button,
    RouterLink,
    RoomInfoModalComponent,
    UpdateRoomModalComponent,
  ],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  private roomService = inject(RoomService);
  private deviceService = inject(DeviceService);

  visible = signal(false);
  isEditingRoom = signal(false);
  currentRoom = signal(this.roomService.selectedRoom.value);

  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.roomService.selectedRoom
      .pipe(takeUntilDestroyed())
      .subscribe((room) => {
        this.currentRoom.set(room);
        this.isEditingRoom.set(false);
      });
  }

  handleEditRoom() {
    this.visible.set(false);
    this.isEditingRoom.set(true);
  }

  isMobile() {
    return this.deviceService.isMobile();
  }
}
