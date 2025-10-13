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
import type { PublicRoom } from "../../../../models/rooms.models";
import { ChatService } from "../../../../services/chat/chat.service";
import { RoomService } from "../../../../services/room/room.service";
import * as themes from "../../../../themes/form.themes";

@Component({
  selector: "app-find-room",
  imports: [
    DialogModule,
    ButtonModule,
    AvatarModule,
    SkeletonModule,
    InputText,
    FormsModule,
  ],
  templateUrl: "./find-room.component.html",
})
export class FindRoomComponent {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private chatService = inject(ChatService);
  private roomChanged = this.chatService.roomChanged;

  visible = input<boolean>();
  setVisible = output<boolean>();
  search = signal("");

  isLoading = false;
  rooms: PublicRoom[] = [];

  dialogThemes = themes.dialogThemes;
  buttonThemes = themes.buttonThemes;
  inputThemes = themes.inputThemes;

  constructor() {
    effect(() => {
      this.visible();
      if (this.visible()) {
        this.roomChanged();
        this.loadRooms(this.search());
      }
    });
  }

  loadRooms(search: string) {
    this.isLoading = true;
    this.roomService.getRooms(search).subscribe((rooms) => {
      this.rooms = rooms.data;
    });
    this.isLoading = false;
  }

  handleJoinRoom(roomId: string) {
    this.chatService.joinRoom(roomId)?.subscribe((room) => {
      this.router.navigateByUrl(`/chat/${room.id}`);
    });
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
