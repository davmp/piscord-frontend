import { Component, inject, output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router, RouterLink } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { SkeletonModule } from "primeng/skeleton";
import { catchError, EMPTY, finalize, startWith, switchMap, tap } from "rxjs";
import type { Room } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { DeviceService } from "../../../services/device.service";
import { NotificationService } from "../../../services/notification/notification.service";
import { RoomService } from "../../../services/room/room.service";
import * as formThemes from "../../../themes/form.themes";
import { formatDate, formatDateLong } from "../../../utils/date-formatter";
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
  private router = inject(Router);
  private roomService = inject(RoomService);
  private chatService = inject(ChatService);
  private notificationService = inject(NotificationService);
  private deviceService = inject(DeviceService);

  isLoading = signal(false);
  unreadNotificationCount = signal(undefined as string | undefined);
  rooms = signal([] as Room[]);
  currentRoom = signal(this.roomService.selectedRoom.value);

  openModal = output<"createRoom" | "findRooms">();

  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.loadRooms();
    this.loadNotificationCount();

    this.roomService.selectedRoom
      .pipe(takeUntilDestroyed())
      .subscribe((room) => this.currentRoom.set(room));

    this.notificationService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadNotificationCount();
      });

    this.notificationService.messages$
      .pipe(takeUntilDestroyed())
      .subscribe((message) => {
        const rooms = this.rooms();

        if (rooms.some((room) => room.id === message.room_id)) {
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

          const updatedRoom = updatedRooms.find(
            (r) => r.id === message.room_id
          );
          const sortedRooms = updatedRoom
            ? [
                updatedRoom,
                ...updatedRooms.filter((r) => r.id !== message.room_id),
              ]
            : updatedRooms;

          this.rooms.set(sortedRooms);
        } else {
          this.chatService.reloadRooms();
        }
      });

    this.chatService
      .roomsChanged()
      .pipe(
        switchMap(() => {
          this.loadRooms();
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadRooms() {
    this.roomService
      .getMyRooms()
      .pipe(
        tap((res) => this.rooms.set(res.data)),
        catchError((err) => {
          console.error("Error fetching my rooms: ", err);
          return EMPTY;
        }),
        finalize(() => this.isLoading.set(false)),
        startWith(() => this.isLoading.set(true))
      )
      .subscribe();
  }

  loadNotificationCount() {
    this.notificationService
      .getUnreadNotificationCount()
      .pipe(
        tap((count) => {
          if (count) {
            const showCount = count >= 100 ? "99+" : count.toString();
            this.unreadNotificationCount.set(showCount);
          }
        }),
        catchError((err) => {
          console.error("Error fetching unread notification count: ", err);
          return EMPTY;
        }),
        finalize(() => {}),
        startWith(() => {})
      )
      .subscribe();
  }

  onSelectRoom(room: Room) {
    this.chatService.selectRoomId(room.id);
  }

  onLeaveRoom(room: Room) {
    this.roomService.leaveRoom(room.id).subscribe({
      next: () => {
        this.chatService.leaveRoom();
        if (this.currentRoom()?.id === room.id) {
          this.router.navigate([]);
        }
      },
      error: (err) => {
        console.error("Error leaving room: ", err);
      },
    });
  }

  handleOpenModal(type: "createRoom" | "findRooms") {
    this.openModal.emit(type);
  }

  endsWithPathname(path: string) {
    return this.deviceService.endsWithPathname(path);
  }

  isMobile() {
    return this.deviceService.isMobile();
  }

  formattedDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = now.getDate() - date.getDate();

    if (diffDays < 1) {
      return formatDate(dateStr);
    } else {
      return formatDateLong(dateStr, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  }
}
