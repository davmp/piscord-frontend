import {
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormGroup,
} from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { Message } from "primeng/message";
import { TextareaModule } from "primeng/textarea";
import { catchError, EMPTY, finalize, of, startWith, tap } from "rxjs";
import type { RoomDetails, UpdateRoomRequest } from "../../../models/rooms.models";
import { ChatService } from "../../../services/chat/chat.service";
import { RoomService } from "../../../services/room/room.service";
import * as themes from "../../../themes/form.themes";

@Component({
  selector: "app-update-room-modal",
  imports: [
    Message,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ButtonModule,
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
  room = signal<RoomDetails | null>(null);

  readonly buttonThemes = themes.buttonThemes;
  readonly inputThemes = themes.inputThemes;
  readonly dialogThemes = themes.dialogThemes;

  constructor() {
    this.form = this.formBuilder.group({
      name: [this.room()?.displayName || "", Validators.required],
      description: [this.room()?.description || ""],
      picture: [this.room()?.picture],
      maxMembers: [20, [Validators.min(2), Validators.max(100)]],
    });

    effect(() => {
      const selectedRoom = this.roomService.selectedRoom.value;

      if (!selectedRoom || !this.visible()) {
        return;
      }

      this.roomService.getRoom(selectedRoom.id).pipe(
        tap((room) => {
          this.room.set(room);
          this.form.get("name")?.setValue(room?.displayName);
          this.form.get("description")?.setValue(room?.description);
          this.form.get("picture")?.setValue(room?.picture);
          this.form.get("maxMembers")?.setValue(room?.maxMembers);
        }),
        catchError(() => {
          this.setVisible.emit(false);
          return of(null);
        })
      ).subscribe();
    })
  }

  updateRoom() {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    const dat = this.getChangedFields();

    this.chatService
      .updateRoom(dat)
      .pipe(
        tap((room) => {
          this.success.set(true)
          this.roomService.roomUpdated.next(room);
        }),
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
    const room = this.room();
    const dat: Partial<UpdateRoomRequest> = {};

    if (this.form.get("name")?.value !== room?.displayName) {
      dat.name = this.form.get("name")?.value;
    }
    if (this.form.get("description")?.value !== room?.description) {
      dat.description = this.form.get("description")?.value;
    }
    if (this.form.get("picture")?.value !== room?.picture) {
      dat.picture = this.form.get("picture")?.value;
    }
    if (this.form.get("maxMembers")?.value !== room?.maxMembers) {
      dat.maxMembers = this.form.get("maxMembers")?.value;
    }

    return dat;
  }
}
