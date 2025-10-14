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
import { DeviceService } from "../../../services/device.service";
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
  private deviceService = inject(DeviceService);

  isLoading = signal(false);
  unreadNotificationCount = signal(undefined as string | undefined);
  rooms = signal([] as Room[]);

  openModal = output<"createRoom" | "findRooms">();
  selectedRoom = computed(() => this.roomService.selectedRoom());

  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.loadRooms();
    this.loadNotificationCount();

    this.notificationService.notificationSubscription.subscribe(() => {
      this.loadNotificationCount();
    });

    this.notificationService.messageSubscription.subscribe((message) => {
      const rooms = this.rooms();
      const updatedRooms = rooms.map((room) =>
        room.id === message.room_id
          ? {
              ...room,
              last_message: {
                id: message.id,
                room_id: message.room_id,
                username: message.username,
                content: message.content,
                created_at: message.created_at,
              },
            }
          : room
      );

      const updatedRoom = updatedRooms.find((r) => r.id === message.room_id);
      const sortedRooms = updatedRoom
        ? [updatedRoom, ...updatedRooms.filter((r) => r.id !== message.room_id)]
        : updatedRooms;

      this.rooms.set(sortedRooms);
    });

    effect(() => {
      this.chatService.roomChanged();
      this.loadRooms();
    });
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
        this.unreadNotificationCount.set(showCount);
      }
    });
  }

  onSelectRoom(room: Room) {
    this.chatService.selectRoom(room);
  }

  handleOpenModal(type: "createRoom" | "findRooms") {
    this.openModal.emit(type);
  }

  endsWithPathname(path: string) {
    return this.deviceService.endsWithPathname(path);
  }

  formattedDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
      return date.toLocaleTimeString(["pt-BR"], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return date.toLocaleDateString(["pt-BR"], {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });
    }
  }
}
