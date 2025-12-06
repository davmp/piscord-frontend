import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { Drawer } from "primeng/drawer";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SkeletonModule } from "primeng/skeleton";
import { TabsModule } from "primeng/tabs";
import { catchError, EMPTY, finalize, of, tap } from "rxjs";
import { type RoomDetails } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { DeviceService } from "../../../services/device.service";
import { RoomService } from "../../../services/room/room.service";
import * as formThemes from "../../../themes/form.themes";
import { formatDateLong } from "../../../utils/date-formatter";
import { UserPopoverComponent } from "../profile-popover/user-popover.component";

@Component({
  selector: "app-room-info-modal",
  imports: [
    Avatar,
    Dialog,
    Drawer,
    TabsModule,
    Button,
    ProgressSpinnerModule,
    SkeletonModule,
    UserPopoverComponent,
  ],
  templateUrl: "./room-info-modal.component.html",
})
export class RoomInfoModalComponent {
  private chatService = inject(ChatService);
  private roomService = inject(RoomService);
  private deviceService = inject(DeviceService);
  private router = inject(Router);

  isLoading = signal(false);
  visible = signal(false);
  room = signal<RoomDetails | null>(null);
  roomId = input<string | undefined>(undefined);
  setEditRoom = output<boolean>();

  readonly buttonThemes = formThemes.buttonThemes;
  readonly dialogThemes = formThemes.dialogThemes;
  readonly menuThemes = formThemes.menuThemes;

  constructor() {
    effect(() => {
      const roomId = this.roomId();
      const visible = this.visible();

      if (roomId && visible) {
        this.isLoading.set(true);
        this.roomService
          .getRoom(roomId)
          .pipe(
            finalize(() => this.isLoading.set(false)),
            catchError((err) => {
              console.error("Error fetching room info: ", err);
              this.visible.set(false);
              return of(null);
            })
          )
          .subscribe((room) => {
            this.room.set(room);
          });
      }
    });
  }

  readonly membersDisplay = computed(() => {
    return this.room()?.members
      .sort((a, b) => {
        if ((a.isMe && !b.isMe) || (a.isAdmin && !b.isAdmin)) {
          return -1;
        }
        return 1;
      });
  });

  handleShowDialog() {
    this.visible.set(true);
    this.setEditRoom?.emit(false);
  }

  handleEditRoom() {
    this.visible.set(false);
    this.setEditRoom?.emit(true);
  }

  handleKickMember(memberId: string) {
    const room = this.room();

    if (room && room.members.some((m) => m.userId === memberId)) {
      this.roomService
        .kickMember(room.id, memberId)
        .subscribe({
          next: () => {
            this.roomService.selectedRoom.next(room);
          },
          error: (err) => {
            console.error("Error kicking member: ", err);
          },
        });
    }
  }

  handleLeaveRoom() {
    const room = this.room();

    if (room) {
      this.roomService.leaveRoom(room.id).pipe(
        tap(() => {
          this.chatService.leaveRoom().subscribe();
          this.roomService.removeRoom.next(room.id);
          this.router.navigate([]);
        }),
        catchError((err) => {
          console.error("Error leaving room: ", err);
          return EMPTY;
        }),
      ).subscribe();
    }
  }

  isMobile() {
    return this.deviceService.isMobile();
  }

  formatDate(dateStr?: string) {
    if (!dateStr) return "";
    return formatDateLong(dateStr, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }
}
