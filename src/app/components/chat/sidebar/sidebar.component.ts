import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import type { Room } from "../../../models/rooms.models";
import { RoomService } from "../../../services/room/room.service";
import { themes } from "../../../themes/button.themes";
import { UserInfoComponent } from "./user-info/user-info.component";

@Component({
  selector: "app-sidebar",
  imports: [UserInfoComponent, ButtonModule, AvatarModule, RouterLink],
  templateUrl: "./sidebar.component.html",
  styles: ``,
})
export class SidebarComponent {
  roomService = inject(RoomService);

  get ghost() {
    return themes.ghost;
  }

  rooms = signal<Room[]>([]);
  selectedRoom: Room | null = null;

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe((rooms) => {
      this.rooms.set(rooms);
      if (this.rooms().length > 0) {
        this.selectedRoom = this.rooms()[0];
        // this.loadMessages(true);
      }
    });
  }
}
