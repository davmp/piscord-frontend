import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AutoFocus } from "primeng/autofocus";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputText } from "primeng/inputtext";
import { Popover } from "primeng/popover";
import { Textarea } from "primeng/textarea";
import type { CreateRoomRequest } from "../../../models/rooms.models";
import type { Profile } from "../../../models/user.models";
import { ChatService } from "../../../services/chat/chat.service";
import { DeviceService } from "../../../services/device.service";
import { RoomService } from "../../../services/room/room.service";
import { UserService } from "../../../services/user/user.service";
import * as formThemes from "../../../themes/form.themes";

@Component({
  selector: "app-chat-user",
  imports: [
    Avatar,
    Textarea,
    InputText,
    Button,
    Popover,
    InputGroup,
    InputGroupAddon,
    AutoFocus,
    FormsModule,
  ],
  templateUrl: "./user.component.html",
})
export class ChatUserComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private roomService = inject(RoomService);
  private deviceService = inject(DeviceService);

  user = signal(null as Profile | null);
  newMessageContent = signal("");
  newMessageFileUrl = signal(null as string | null);
  tempFileUrl = signal(null as string | null);

  readonly buttonThemes = formThemes.buttonThemes;
  readonly inputThemes = formThemes.inputThemes;
  readonly popoverThemes = formThemes.menuThemes;
  readonly inputPlaceholder = "Selecione uma sala para começar a conversar";

  isSendDisabled = computed(
    () => !this.newMessageContent().trim() && !this.newMessageFileUrl()
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get("userId");

      if (!userId) {
        this.router.navigate(["/"]);
        return;
      }

      this.roomService.getDirectRoom(userId).subscribe({
        next: (room) => {
          this.router.navigate(["chat", room.id]);
        },
        error: () => {
          if (userId) {
            this.userService.getProfileById(userId).subscribe((user) => {
              this.user.set(user);
            });
          } else {
            this.router.navigate(["/"]);
          }
        },
      });
    });
  }

  sendMessage(): void {
    const user = this.user();

    if (user && this.newMessageContent().trim()) {
      const requestData: CreateRoomRequest = {
        type: "direct",
        max_members: 2,
        participant_ids: [user.id],
      };

      this.chatService.createRoom(requestData).subscribe({
        next: (room) => {
          const err = this.chatService.selectRoom(room);

          if (err) {
            console.error("Error entering new room: ", err);
          } else {
            this.chatService.sendMessage(
              this.newMessageContent().trim(),
              null,
              this.newMessageFileUrl()
            );

            this.router.navigate(["chat", room.id]);
          }
        },
        error: (err) => {
          console.error("Error sending message: ", err);
          return;
        },
      });

      this.newMessageContent.set("");
      this.newMessageFileUrl.set(null);
      this.tempFileUrl.set(null);
    }
  }

  isMobile() {
    return this.deviceService.isMobile();
  }
}
