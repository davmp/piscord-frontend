import { Component, effect, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AutoFocus } from "primeng/autofocus";
import { Avatar } from "primeng/avatar";
import { Image } from "primeng/image";
import { Textarea } from "primeng/textarea";
import {
  Message,
  type MessagePreview,
  type SelectedMessageEdit,
} from "../../../models/message.models";
import * as formThemes from "../../../themes/form.themes";
import { formatDate, formatDateLong } from "../../../utils/date-formatter";
import { UserPopoverComponent } from "../../display/profile-popover/user-popover.component";

@Component({
  selector: "app-message",
  imports: [
    Avatar,
    Textarea,
    Image,
    AutoFocus,
    FormsModule,
    UserPopoverComponent,
  ],
  templateUrl: "./message.component.html",
})
export class MessageComponent {
  message = input<Message>();
  diffTime = input(true);
  isOwnMessage = input(false);
  isSelected = input(false);
  onEditMessage = output<SelectedMessageEdit>();
  onDeleteMessage = output<string>();
  onSelectReplyMessage = output<MessagePreview>();

  newMessageContent = signal("");
  isEditingMessage = signal(false);
  showMobileActions = signal(false);
  private longPressTimeout: any;

  readonly menuThemes = formThemes.menuThemes;
  readonly inputThemes = formThemes.inputThemes;
  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    effect(() => {
      this.newMessageContent.set(this.message()?.content || "");
    });
  }

  handleReplyMessage() {
    const message = this.message();

    if (!message) return;

    this.onSelectReplyMessage.emit({
      id: message.id,
      author: {
        id: message.author.id,
        username: message.author.username,
        picture: message.author.picture,
      },
      content: message.content,
      createdAt: message.createdAt,
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

  handleDeleteMessage() {
    const message = this.message();

    if (!message) return;

    this.onDeleteMessage.emit(message.id);
  }

  formattedDate() {
    const createdAt = this.message()?.createdAt || "";
    return formatDate(createdAt);
  }

  formattedFullDate() {
    const createdAt = this.message()?.createdAt || "";
    return formatDateLong(createdAt);
  }

  handleLongPressStart() {
    this.longPressTimeout = setTimeout(() => {
      this.showMobileActions.set(true);
    }, 600);
  }

  handleLongPressEnd() {
    clearTimeout(this.longPressTimeout);
    setTimeout(() => {
      this.showMobileActions.set(false);
    }, 100);
  }
}
