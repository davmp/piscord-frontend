import { Component, computed, effect, inject, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { SkeletonModule } from "primeng/skeleton";
import type { Room } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { NotificationService } from "../../../services/notification/notification.service";
import { RoomService } from "../../../services/room/room.service";
import * as formThemes from "../../../themes/form.themes";
import { UserInfoComponent } from "./user-info/user-info.component";

@Component({
  selector: "app-sidebar",
  imports: [
    UserInfoComponent,
    ButtonModule,
    AvatarModule,
    SkeletonModule,
    RouterLink,
  ],
  templateUrl: "./sidebar.component.html",
})
export class SidebarComponent {
  private roomService = inject(RoomService);
  private chatService = inject(ChatService);
  private notificationService = inject(NotificationService);

  isLoading = false;
  unreadNotificationCount: string | undefined = undefined;
  buttonThemes = formThemes.buttonThemes;
  rooms: Room[] = [];

  selectedRoom = computed(() => this.roomService.selectedRoom());
  openModal = output<"createRoom" | "findRooms">();

  constructor() {
    this.loadRooms();
    this.loadNotificationCount();

    this.notificationService.notificationSubscription.subscribe(() => {
      this.loadNotificationCount();
    });

    effect(() => {
      this.chatService.roomChanged();
      this.loadRooms();
    });
  }

  loadRooms() {
    this.isLoading = true;
    this.roomService.getMyRooms().subscribe((rooms) => {
      this.rooms = rooms.data;
    });
    this.isLoading = false;
  }

  loadNotificationCount() {
    this.notificationService.getUnreadNotificationCount().subscribe((count) => {
      if (count) {
        const showCount = count >= 100 ? "99+" : count.toString();
        this.unreadNotificationCount = showCount;
      }
    });
  }

  onSelectRoom(room: Room) {
    this.chatService.selectRoom(room);
  }

  handleOpenModal(type: "createRoom" | "findRooms") {
    this.openModal.emit(type);
  }
}
