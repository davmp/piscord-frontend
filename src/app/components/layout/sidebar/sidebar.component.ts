import {
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { SkeletonModule } from "primeng/skeleton";
import type { Room } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { NotificationService } from "../../../services/notification/notification.service";
import { RoomService } from "../../../services/room/room.service";
import { buttonThemes } from "../../../themes/form.themes";
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

  isLoading = signal(false);
  unreadNotificationCount: string | undefined = undefined;
  rooms = signal<Room[]>([]);

  openModal = output<"createRoom" | "findRooms">();

  selectedRoom = computed(() => this.roomService.selectedRoom());

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

  get loading() {
    return this.isLoading();
  }

  get roomsList() {
    return this.rooms();
  }

  get ghost() {
    return buttonThemes.ghost;
  }

  loadRooms() {
    this.isLoading.set(true);
    this.roomService.getMyRooms().subscribe((rooms) => {
      this.rooms.set(rooms.data);
    });
    this.isLoading.set(false);
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
