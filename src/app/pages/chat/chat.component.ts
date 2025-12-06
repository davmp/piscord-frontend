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
  type MessagePreview,
  type SelectedMessageEdit,
  type WSResponse
} from "../../models/message.models";
import { ChatService } from "../../services/chat/chat.service";
import { MessageService } from "../../services/chat/message.service";
import { WebsocketService } from "../../services/chat/ws.service";
import { DeviceService } from "../../services/device.service";
import { RoomService } from "../../services/room/room.service";
import { AuthService } from "../../services/user/auth/auth.service";
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
    FormsModule,
  ],
  templateUrl: "./chat.component.html",
})
export class ChatComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private roomService = inject(RoomService);
  private wsService = inject(WebsocketService);
  private messageService = inject(MessageService);
  private deviceService = inject(DeviceService);

  newMessageContent = signal("");
  newMessageFileUrl = signal(null as string | null);
  tempFileUrl = signal(null as string | null);
  newMessageReply = signal(null as MessagePreview | null);
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
      return this.currentRoom()?.type === "DIRECT"
        ? `Converse com @${this.currentRoom()?.displayName}`
        : `Conversar em ${this.currentRoom()?.displayName}`;
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

      const currentDate = new Date(message.createdAt);
      currentDate.setHours(currentDate.getHours() + 3);
      const previousDate = previousMessage
        ? new Date(previousMessage.createdAt)
        : null;
      const showDateSeparator =
        !previousDate ||
        currentDate.toDateString() !== previousDate.toDateString();

      let diffTime = true;
      if (message.replyTo) {
        diffTime = true;
      } else if (previousMessage && previousMessage.author.id === message.author.id) {
        const prevTime = new Date(previousMessage.createdAt).getTime();
        const currTime = new Date(message.createdAt).getTime();

        if (currTime - prevTime <= 300000) {
          diffTime = false;
        }
      }

      message.content = message.content.trim();
      return { message, showDateSeparator, diffTime, isOwnMessage: this.authService.auth.value?.id === message.author.id};
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
          this.chatService.selectRoomId(roomId).subscribe({
            error: () => this.chatService.exitRoom().subscribe()
          });
        } else {
          this.chatService.exitRoom().subscribe();
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
    this.chatService.exitRoom().subscribe();
  }

  private setupWebSocketSubscription(): void {
    this.wsService
      .connection()
      .pipe(
        filter(
          (wsMessage: WSResponse) =>
            wsMessage.type === "new.message" && !!wsMessage.data
        ),
        takeUntilDestroyed()
      )
      .subscribe((wsMessage: WSResponse) => {
        const currentRoom = this.currentRoom();
        if (
          wsMessage.data.roomId &&
          currentRoom &&
          wsMessage.data.roomId !== currentRoom.id
        ) {
          return;
        }

        const message: Message = {
          id: wsMessage.data.id,
          roomId: wsMessage.data.roomId,
          content: wsMessage.data.content,
          fileUrl: wsMessage.data.fileUrl,
          author: wsMessage.data.author,
          replyTo: wsMessage.data.replyTo,
          isDeleted: false,
          updatedAt: wsMessage.data.sentAt,
          createdAt: wsMessage.data.sentAt,
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
      this.chatService.sendMessage({
        content: this.newMessageContent(),
        fileUrl: this.newMessageFileUrl(),
        replyTo: this.newMessageReply()
      }).subscribe({
        error: (err) => console.error("Error sending message: ", err)
      });

      this.newMessageContent.set("");
      this.newMessageFileUrl.set(null);
      this.newMessageReply.set(null);
      this.tempFileUrl.set(null);
    }
  }

  onEditMessage(data: SelectedMessageEdit): void {
    if (data.content.trim() && this.currentRoom()) {
      this.chatService.editMessage(data.id, data.content).subscribe({
        next: () => {
          this.messages.set(
            this.messages().map((message) => {
              if (data.id === message.id) {
                message.content = data.content;
                message.editedAt = undefined;
              }
              return message;
            })
          );
        },
        error: (err) => console.error("Error sending message: ", err)
      });
    }
  }

  onDeleteMessage(messageId: string): void {
    if (this.currentRoom()) {
      this.chatService.deleteMessage(messageId).pipe(
        tap(() => {
          this.messages.set(
            this.messages().map((message) => {
              if (messageId === message.id) {
                message.content = "Essa mensagem foi apagada";
                message.fileUrl = undefined;
                message.updatedAt = new Date().toLocaleDateString();
                message.isDeleted = true;
              }
              return message;
            })
          );
        }),
        catchError((err) => {
          console.error("Error sending message: ", err);
          return EMPTY;
        })
      ).subscribe();
    }
  }

  onReplySelected(reply: MessagePreview): void {
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
