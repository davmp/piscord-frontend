import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormGroup,
} from "@angular/forms";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { InputNumber } from "primeng/inputnumber";
import { InputText } from "primeng/inputtext";
import { Message } from "primeng/message";
import { Textarea } from "primeng/textarea";
import { catchError, EMPTY, finalize, startWith, tap } from "rxjs";
import type { UpdateRoomRequest } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { RoomService } from "../../../services/room/room.service";
import * as themes from "../../../themes/form.themes";

@Component({
  selector: "app-update-room-modal",
  imports: [
    Dialog,
    InputText,
    Textarea,
    InputNumber,
    Button,
    Message,
    ReactiveFormsModule,
  ],
  templateUrl: "./update-room-modal.component.html",
})
export class UpdateRoomModalComponent {
  private roomService = inject(RoomService);
  private chatService = inject(ChatService);
  private formBuilder = inject(FormBuilder);
  form: FormGroup;

  visible = input<boolean>();
  setVisible = output<boolean>();
  isLoading = signal(false);
  success = signal(false);
  errorMessage = signal(undefined as string | undefined);
  room = signal(this.roomService.selectedRoom.value);

  readonly buttonThemes = themes.buttonThemes;
  readonly inputThemes = themes.inputThemes;
  readonly dialogThemes = themes.dialogThemes;

  constructor() {
    this.roomService.selectedRoom
      .pipe(takeUntilDestroyed())
      .subscribe((room) => this.room.set(room));

    this.form = this.formBuilder.group({
      name: [this.room()?.display_name || "", Validators.required],
      description: [this.room()?.description || ""],
      picture: [this.room()?.picture],
      maxMembers: [
        this.room()?.max_members,
        [Validators.min(0), Validators.max(200)],
      ],
      removeParticipantIds: [[] as string[]],
    });

    effect(() => {
      this.room();

      this.form = this.formBuilder.group({
        name: [this.room()?.display_name || "", Validators.required],
        description: [this.room()?.description || ""],
        picture: [this.room()?.picture],
        maxMembers: [
          this.room()?.max_members,
          [Validators.min(0), Validators.max(200)],
        ],
        removeParticipantIds: [[] as string[]],
      });
    });
  }

  updateRoom() {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    const dat = this.getChangedFields();

    this.chatService
      .updateRoom(dat)
      .pipe(
        tap(() => this.success.set(true)),
        finalize(() => this.isLoading.set(false)),
        catchError((err) => {
          this.errorMessage.set(
            err.error.error ?? "Ocorreu um erro ao atualizar o perfil."
          );
          return EMPTY;
        }),
        startWith(() => this.isLoading.set(true))
      )
      .subscribe();

    this.isLoading.set(false);
  }

  handleSetVisible(visible: boolean) {
    this.setVisible.emit(visible);
  }

  getChangedFields(): Partial<UpdateRoomRequest> {
    const room = this.roomService.selectedRoom.value;
    const dat: Partial<UpdateRoomRequest> = {};

    if (this.form.get("name")?.value !== room?.display_name) {
      dat.name = this.form.get("name")?.value;
    }
    if (this.form.get("description")?.value !== room?.description) {
      dat.description = this.form.get("description")?.value;
    }
    if (this.form.get("picture")?.value !== room?.picture) {
      dat.picture = this.form.get("picture")?.value;
    }
    if (this.form.get("maxMembers")?.value !== room?.max_members) {
      dat.max_members = this.form.get("maxMembers")?.value;
    }
    if (this.form.get("removeParticipantIds")) {
      dat.remove_participant_ids = this.form.get("removeParticipantIds")?.value;
    }

    return dat;
  }
}
