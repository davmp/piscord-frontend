import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputText } from "primeng/inputtext";
import { SkeletonModule } from "primeng/skeleton";
import { tap } from "rxjs";
import type { PublicRoom } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { RoomService } from "../../../services/room/room.service";
import * as themes from "../../../themes/form.themes";

@Component({
  selector: "app-find-room-modal",
  imports: [
    DialogModule,
    ButtonModule,
    AvatarModule,
    SkeletonModule,
    InputText,
    FormsModule,
  ],
  templateUrl: "./find-room-modal.component.html",
})
export class FindRoomModalComponent {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private chatService = inject(ChatService);

  visible = input<boolean>();
  setVisible = output<boolean>();
  search = signal("");
  isLoading = signal(false);
  rooms = signal([] as PublicRoom[]);

  readonly dialogThemes = themes.dialogThemes;
  readonly buttonThemes = themes.buttonThemes;
  readonly inputThemes = themes.inputThemes;

  constructor() {
    this.chatService.roomsChanged().subscribe(() => {
      if (this.visible()) {
        this.loadRooms(this.search());
      }
    });

    effect(() => {
      this.visible();
      if (this.visible()) {
        this.loadRooms(this.search());
      }
    });
  }

  loadRooms(search: string) {
    this.isLoading.set(true);
    this.roomService.getRooms(search).subscribe((rooms) => {
      this.rooms.set(rooms.data);
    });
    this.isLoading.set(false);
  }

  handleJoinRoom(room: PublicRoom) {
    this.chatService.joinRoom(room).pipe(
      tap(() => {
        this.router.navigateByUrl(`/chat/${room.id}`);
      })
    ).subscribe();
    this.handleSetVisible(false);
  }

  handleEnterRoom(roomId: string) {
    this.router.navigateByUrl(`/chat/${roomId}`);
    this.handleSetVisible(false);
  }

  handleSetVisible(visible: boolean) {
    this.setVisible.emit(visible);
  }
}
