import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { Router } from "express";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { Drawer } from "primeng/drawer";
import { TabsModule } from "primeng/tabs";
import { type RoomDetails } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { DeviceService } from "../../../services/device.service";
import { RoomService } from "../../../services/room/room.service";
import * as formThemes from "../../../themes/form.themes";
import { formatDateLong } from "../../../utils/date-formatter";
import { UserPopoverComponent } from "../profile-popover/user-popover.component";

@Component({
  selector: "app-room-info-modal",
  imports: [Avatar, Dialog, Drawer, TabsModule, Button, UserPopoverComponent],
  templateUrl: "./room-info-modal.component.html",
})
export class RoomInfoModalComponent {
  private chatService = inject(ChatService);
  private roomService = inject(RoomService);
  private deviceService = inject(DeviceService);
  private router = inject(Router);

  room = input<RoomDetails | null>(null);
  visible = signal(false);
  setEditRoom = output<boolean>();

  readonly buttonThemes = formThemes.buttonThemes;
  readonly dialogThemes = formThemes.dialogThemes;
  readonly menuThemes = formThemes.menuThemes;
  readonly members = computed(() => {
    return this.room()
      ?.members.map((member) => ({
        ...member,
        is_admin: this.room()?.admins.some(
          (admin) => admin.user_id === member.user_id
        ),
      }))
      .sort((a, b) => {
        if ((a.is_me && !b.is_me) || (a.is_admin && !b.is_admin)) {
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

  handleRemoveMember(memberId: string) {
    const room = this.room();

    if (room && room.members.some((m) => m.user_id === memberId)) {
      this.roomService
        .updateRoom(room.id, {
          remove_participant_ids: [memberId],
        })
        .subscribe({
          next: (room) => {
            this.roomService.selectedRoom.next(room);
          },
        });
    }
  }

  handleLeaveRoom() {
    const room = this.room();

    if (room) {
      this.roomService.leaveRoom(room.id).subscribe(() => {
        this.chatService.leaveRoom();
        this.router.navigate([]);
        this.visible.set(false);
        this.setEditRoom?.emit(false);
      });
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
