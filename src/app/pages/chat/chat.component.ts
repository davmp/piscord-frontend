import {
  Component,
  computed,
  inject,
  signal,
  ViewChild,
  type ElementRef,
  type OnDestroy,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AutoFocus } from "primeng/autofocus";
import { Button } from "primeng/button";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputText } from "primeng/inputtext";
import { Popover } from "primeng/popover";
import { Textarea } from "primeng/textarea";
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  tap,
} from "rxjs";
import { HeaderComponent } from "../../components/chat/header/header.component";
import { MessageComponent } from "../../components/chat/message/message.component";
import {
  type Message,
  type SelectedMessageEdit,
  type SelectedReplyMessage,
  type WSResponse,
} from "../../models/message.models";
import { ChatService } from "../../services/chat/chat.service";
import { MessageService } from "../../services/chat/message.service";
import { WebsocketService } from "../../services/chat/ws.service";
import { DeviceService } from "../../services/device.service";
import { RoomService } from "../../services/room/room.service";
import * as formThemes from "../../themes/form.themes";

@Component({
  selector: "app-chat",
  imports: [
    HeaderComponent,
    MessageComponent,
    Textarea,
    InputText,
    Button,
    Popover,
    InputGroup,
    InputGroupAddon,
    AutoFocus,
    FormsModule,
  ],
  templateUrl: "./chat.component.html",
})
export class ChatComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);
  private chatService = inject(ChatService);
  private wsService = inject(WebsocketService);
  private messageService = inject(MessageService);
  private deviceService = inject(DeviceService);

  newMessageContent = signal("");
  newMessageFileUrl = signal(null as string | null);
  tempFileUrl = signal(null as string | null);
  newMessageReply = signal(null as SelectedReplyMessage | null);
  messages = signal<Message[]>([]);
  loadingMessages = signal(false);
  currentRoom = signal(this.roomService.selectedRoom.value);

  readonly page = 1;
  readonly pageSize = 20;
  readonly buttonThemes = formThemes.buttonThemes;
  readonly inputThemes = formThemes.inputThemes;
  readonly popoverThemes = formThemes.menuThemes;

  readonly inputPlaceholder = computed(() => {
    if (this.currentRoom()) {
      return this.currentRoom()?.type === "direct"
        ? `Converse com @${this.currentRoom()?.display_name}`
        : `Conversar em ${this.currentRoom()?.display_name}`;
    }
    return "Selecione uma sala";
  });
  readonly canSend = computed(() => {
    const content = this.newMessageContent().trim();
    const file = this.newMessageFileUrl();
    return content.length > 0 || (file && file.trim().length > 0);
  });
  readonly messagesDisplay = computed(() => {
    return this.messages().map((message, index) => {
      const previousMessage = this.messages()[index - 1];

      const currentDate = new Date(message.created_at);
      currentDate.setHours(currentDate.getHours() + 3);
      const previousDate = previousMessage
        ? new Date(previousMessage.created_at)
        : null;
      const showDateSeparator =
        !previousDate ||
        currentDate.toDateString() !== previousDate.toDateString();

      let diffTime = true;
      if (message.reply_to) {
        diffTime = true;
      } else if (
        previousMessage &&
        previousMessage.user_id === message.user_id
      ) {
        const prevTime = new Date(previousMessage.created_at).getTime();
        const currTime = new Date(message.created_at).getTime();

        if (currTime - prevTime <= 300000) {
          diffTime = false;
        }
      }

      message.content = message.content.trim();
      return { message, showDateSeparator, diffTime };
    });
  });

  @ViewChild("messagesScroller") private scroller!: ElementRef<HTMLElement>;
  @ViewChild("message") messageTextarea!: ElementRef<HTMLTextAreaElement>;

  constructor() {
    this.setupWebSocketSubscription();

    this.route.paramMap
      .pipe(
        map((params) => params.get("roomId")),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((roomId) => {
        if (this.roomService.selectedRoom.getValue()?.id === roomId!) return;

        if (roomId) {
          this.chatService.selectRoomId(roomId);
        } else {
          this.chatService.exitRoom();
        }
      });

    this.roomService.selectedRoom
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((room) => {
        this.currentRoom.set(room);
        if (room) {
          this.fetchMessages(room.id);
        } else {
          this.messages.set([]);
        }
      });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.scrollToBottom();
    this.chatService.exitRoom();
  }

  private setupWebSocketSubscription(): void {
    this.wsService
      .connection()
      .pipe(
        filter(
          (wsMessage: WSResponse) =>
            wsMessage.type === "new_message" && !!wsMessage.data
        ),
        takeUntilDestroyed()
      )
      .subscribe((wsMessage: WSResponse) => {
        const currentRoom = this.currentRoom();
        if (
          wsMessage.data.message.room_id &&
          currentRoom &&
          wsMessage.data.message.room_id !== currentRoom.id
        ) {
          return;
        }

        const message = {
          ...wsMessage.data.message,
          is_own_message: wsMessage.data.is_own_message,
        };
        this.messages.set([...(this.messages() ?? []), message]);
      });
  }

  fetchMessages(roomId: string) {
    if (!roomId) return;
    this.loadingMessages.set(true);
    this.messageService
      .getMessages(roomId, this.page, this.pageSize)
      .pipe(
        tap((res) => {
          this.messages.set(res.data.reverse());
        }),
        catchError((err) => {
          console.error("Error fetching messages: ", err);
          return EMPTY;
        }),
        finalize(() => this.loadingMessages.set(false))
      )
      .subscribe();
  }

  sendMessage(): void {
    if (
      (this.newMessageContent().trim() || this.newMessageFileUrl()) &&
      this.currentRoom()
    ) {
      const replyMessageId = this.newMessageReply()?.id ?? null;

      const err = this.chatService.sendMessage(
        this.newMessageContent(),
        replyMessageId,
        this.newMessageFileUrl()
      );
      if (err) {
        console.error("Error sending message: ", err);
        return;
      }
      this.newMessageContent.set("");
      this.newMessageFileUrl.set(null);
      this.newMessageReply.set(null);
      this.tempFileUrl.set(null);
    }
  }

  onEditMessage(data: SelectedMessageEdit): void {
    if (data.content.trim() && this.currentRoom()) {
      const err = this.chatService.editMessage(data.id, data.content);
      if (err) {
        console.error("Error sending message: ", err);
        return;
      }

      this.messages.set(
        this.messages().map((message) => {
          if (data.id === message.id) {
            message.content = data.content;
            message.is_edited = true;
          }
          return message;
        })
      );
    }
  }

  onReplySelected(reply: SelectedReplyMessage): void {
    this.newMessageReply.set(reply);

    setTimeout(() => {
      this.messageTextarea?.nativeElement.focus();
    }, 0);
  }

  isMobile() {
    return this.deviceService.isMobile();
  }

  dateSeparator(dateString: string) {
    const date = new Date(dateString);

    var dt = new Date(dateString),
      dtDat = dt.getDate(),
      diffDays = new Date().getDate() - dtDat,
      diffMonths = new Date().getMonth() - dt.getMonth(),
      diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
      return "Hoje";
    } else if (diffYears === 0 && diffDays === 1) {
      return "Ontem";
    }

    return date.toLocaleDateString(["pt-BR"], {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }

  private scrollToBottom() {
    try {
      const el = this.scroller.nativeElement;
      const last = el.lastElementChild as HTMLElement;
      if (last) {
        last.scrollIntoView({ behavior: "instant", block: "end" });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    } catch (e) {}
  }
}
