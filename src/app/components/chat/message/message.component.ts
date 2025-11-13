import { Component, effect, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AutoFocus } from "primeng/autofocus";
import { Avatar } from "primeng/avatar";
import { Image } from "primeng/image";
import { Textarea } from "primeng/textarea";
import {
  DisplayMessage,
  type SelectedMessageEdit,
  type SelectedReplyMessage,
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
  message = input<DisplayMessage>();
  diffTime = input(true);
  isSelected = input(false);
  onEditMessage = output<SelectedMessageEdit>();
  onSelectReplyMessage = output<SelectedReplyMessage>();

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

  formattedDate() {
    const createdAt = this.message()?.created_at || "";
    return formatDate(createdAt);
  }

  formattedFullDate() {
    const createdAt = this.message()?.created_at || "";
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
