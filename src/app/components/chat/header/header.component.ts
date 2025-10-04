import { Component, computed, inject } from "@angular/core";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { RoomService } from "../../../services/room/room.service";
import { themes } from "../../../themes/button.themes";

@Component({
  selector: "app-header",
  imports: [Avatar, Button],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  roomService = inject(RoomService);

  selectedRoom = computed(() => this.roomService.selectedRoom);

  get ghost() {
    return themes.ghost;
  }
}
