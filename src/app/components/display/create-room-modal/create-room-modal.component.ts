import { Component, inject, input, output, signal } from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormGroup,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { StyleClassModule } from 'primeng/styleclass';
import { TextareaModule } from "primeng/textarea";
import type { CreateRoomRequest } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import * as themes from "../../../themes/form.themes";

import { InputNumberModule } from "primeng/inputnumber";
import { catchError, EMPTY, finalize } from "rxjs";
import { RoomService } from "../../../services/room/room.service";

@Component({
  selector: "app-create-room-modal",
  imports: [
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    ReactiveFormsModule,
    StyleClassModule,
  ],
  templateUrl: "./create-room-modal.component.html",
})
export class CreateRoomModalComponent {
  private chatService = inject(ChatService);
  private roomService = inject(RoomService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  form: FormGroup;

  visible = input<boolean>();
  setVisible = output<boolean>();
  isLoading = signal(false);

  readonly buttonThemes = themes.buttonThemes;
  readonly inputThemes = themes.inputThemes;
  readonly dialogThemes = themes.dialogThemes;

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      description: [""],
      picture: [null],
      maxMembers: [20, [Validators.min(2), Validators.max(100)]],
    });
  }

  createRoom() {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    const val = this.form.value;

    if (val.name) {
      this.isLoading.set(true);

      const createRoomRequest: CreateRoomRequest = {
        name: val.name,
        description: val.description,
        type: "PUBLIC", // TODO: implement private rooms
        picture: val.picture,
        maxMembers: val.maxMembers,
        members: [],
        admins: [],
      };

      this.chatService
        .createRoom(createRoomRequest)
        .pipe(
          finalize(() => this.isLoading.set(false)),
          catchError((err) => {
            console.error("Error creating room: ", err);
            return EMPTY;
          })
        )
        .subscribe((room) => {
          this.roomService.newRoom.next(room);
          this.roomService.selectedRoom.next(room);
          this.router.navigateByUrl(`/rooms/${room.id}`);
          this.handleSetVisible(false);
          this.form.reset();
        });
    }
  }

  handleSetVisible(visible: boolean) {
    this.setVisible.emit(visible);
  }
}
