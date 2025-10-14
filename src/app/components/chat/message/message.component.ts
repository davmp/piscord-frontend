import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AutoFocus } from "primeng/autofocus";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Popover } from "primeng/popover";
import { Textarea } from "primeng/textarea";
import {
  DisplayMessage,
  type SelectedMessageEdit,
  type SelectedReplyMessage,
} from "../../../models/message.models";
import type { Profile } from "../../../models/user.models";
import { UserService } from "../../../services/user/user.service";
import * as formThemes from "../../../themes/form.themes";

@Component({
  selector: "app-message",
  imports: [
    Avatar,
    Popover,
    Textarea,
    Button,
    AutoFocus,
    FormsModule,
    RouterLink,
  ],
  templateUrl: "./message.component.html",
})
export class MessageComponent {
  private userService = inject(UserService);

  message = input<DisplayMessage>();
  diffTime = input(true);
  isSelected = input(false);

  onEditMessage = output<SelectedMessageEdit>();
  onSelectReplyMessage = output<SelectedReplyMessage>();

  newMessageContent = signal("");
  isEditingMessage = signal(false);
  userInfo = signal<Profile | null>(null);
  userInfoLoading = signal(false);
  userPopupError = signal(null as string | null);

  readonly menuThemes = formThemes.menuThemes;
  readonly inputThemes = formThemes.inputThemes;
  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    effect(() => {
      this.newMessageContent.set(this.message()?.content || "");
    });
  }

  showUserPopup() {
    this.userInfoLoading.set(true);
    this.userInfo.set(null);
    this.userPopupError.set(null);
    const id = this.message()?.user_id;
    if (id) {
      this.userService.getProfileById(id).subscribe({
        next: (profile) => this.userInfo.set(profile),
        error: () => this.userPopupError.set("Erro ao carregar usuário."),
      });
    }
    this.userInfoLoading.set(false);
  }

  handleReplyMessage() {
    const message = this.message();

    if (!message) return;

    this.onSelectReplyMessage.emit({
      id: message.id,
      user_id: message.user_id,
      username: message.username,
      picture: message.picture,
      content: message.content,
    });
  }

  editMessage() {
    this.isEditingMessage.set(true);
  }

  handleEditMessage() {
    const message = this.message();

    if (!message) return;

    this.onEditMessage.emit({
      id: message.id,
      content: this.newMessageContent(),
    });
  }

  get formattedDate(): string {
    const createdAt = this.message()?.created_at;
    if (!createdAt) return "";

    const date = new Date(createdAt);
    return date.toLocaleTimeString(["pt-BR"], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  get formattedFullDate(): string {
    const createdAt = this.message()?.created_at;
    if (!createdAt) return "";

    const date = new Date(createdAt);
    return date.toLocaleString(["pt-BR"], {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}
