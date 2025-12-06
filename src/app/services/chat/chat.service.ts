import { inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  catchError,
  Observable,
  shareReplay,
  Subject,
  tap,
  throwError
} from "rxjs";
import type { SendMessage, WSMessage } from "../../models/message.models";
import type {
  CreateRoomRequest,
  Room,
  UpdateRoomRequest
} from "../../models/rooms.models";
import { RoomService } from "../room/room.service";
import { AuthService } from "../user/auth/auth.service";
import { WebsocketService } from "./ws.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private wsService = inject(WebsocketService);
  private authService = inject(AuthService);
  private roomService = inject(RoomService);

  private roomsChanged$!: Observable<void>;
  private rooms$ = new Subject<void>();
  private currentRoom = signal(this.roomService.selectedRoom.value);
  typingUsers: string[] = [];

  constructor() {
    this.roomService.selectedRoom
      .pipe(takeUntilDestroyed())
      .subscribe((room) => this.currentRoom.set(room));
  }

  ngOnDestroy() {
    this.wsService.close();
  }

  roomsChanged() {
    if (!this.roomsChanged$) {
      this.roomsChanged$ = this.rooms$.pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.roomsChanged$;
  }

  sendMessage(message: SendMessage): Observable<void> {
    const roomId = this.currentRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return throwError(() => new Error("Not connected"));
    }

    if (message.content.trim().length > 0 || message.fileUrl) {
      const author = this.authService.auth.value;

      if (!author || !author.id) {
        return throwError(() => new Error("Unauthorized"));
      }

      this.wsService.sendMessage({
        type: "message.send",
        payload: {
          ...message,
          author,
          roomId,
          sentAt: Date.now().toLocaleString(),
        },
      } as WSMessage);
      return new Observable((observer) => {
        observer.next();
        observer.complete();
      });
    }
    return throwError(() => new Error("Too small"));
  }

  editMessage(messageId: string, content: string): Observable<void> {
    const roomId = this.currentRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return throwError(() => new Error("Not connected"));
    }

    if (!content.trim().length) {
      return throwError(() => new Error("Too small"));
    }

    const message: WSMessage = {
        type: "message.edit",
        payload: {
          roomId: roomId,
          messageId: messageId,
          content,
        },
      };

    this.wsService.sendMessage(message);
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  deleteMessage(messageId: string): Observable<void> {
    const roomId = this.currentRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return throwError(() => new Error("Not connected"));
    }

    const message: WSMessage = {
      type: "message.delete",
      payload: {
        id: messageId,
        userId: this.authService.auth.value?.id,
      },
    };

    this.wsService.sendMessage(message);
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  selectRoom(room: Room): Observable<void> {
    if (!this.wsService.connected) {
      return throwError(() => new Error("Not connected"));
    }

    this.roomService.selectedRoom.next(room);
    this.typingUsers = [];

    if (room) {
      this.wsService.sendMessage({
        type: "room.enter",
        payload: { roomId: room.id },
      });
    }
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  selectRoomId(roomId: string) {
    return this.roomService.getRoom(roomId).pipe(
      tap((room) => {
        this.roomService.selectedRoom.next(room);
        this.typingUsers = [];

        this.wsService.sendMessage({
          type: "room.enter",
          payload: { roomId: room.id },
        });
      }),
      catchError((err) => {
        console.error("Error selecting room:", err);
        return throwError(() => "Error selecting room");
      })
    );
  }

  selectedDirectRoomId(userId: string) {
    return this.roomService.getDirectRoom(userId).pipe(
      tap((room) => {
        if (!room) return;

        this.roomService.selectedRoom.next(room);
        this.typingUsers = [];

        this.wsService.sendMessage({
          type: "room.enter",
          payload: { roomId: room.id },
        });
      })
    );
  }

  createRoom(data: CreateRoomRequest) {
    return this.roomService.createRoom(data).pipe(
      tap((data) => {
        if (data) {
          this.rooms$.next();
          this.selectRoom(data).subscribe();
        } else {
          console.error("Error creating room:", data);
        }
      })
    );
  }

  updateRoom(data: Partial<UpdateRoomRequest>) {
    const room = this.currentRoom();

    if (!room) {
      throw new Error("No room selected");
    }

    return this.roomService.updateRoom(room.id, data).pipe(
      tap((room) => {
        this.rooms$.next();
        this.roomService.selectedRoom.next(room);
      }),
      catchError((err) => {
        console.error("Error updating room:", err);
        return throwError(() => err);
      })
    );
  }

  joinRoom(room: Room): Observable<void> {
    if (!this.wsService.connected) {
      console.warn("Websocket not connected");
      return throwError(() => new Error("Not connected"));
    }

    this.wsService.sendMessage({
      type: "room.join",
      payload: { roomId: room.id },
    });

    return this.roomService.joinRoom(room.id).pipe(
          tap(() => {
            this.roomService.newRoom.next(room);
            this.roomService.selectedRoom.next(room);
            this.typingUsers = [];
          })
        );
  }

  leaveRoom(): Observable<void> {
    const roomId = this.currentRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return throwError(() => new Error("Not connected"));
    }

    this.wsService.sendMessage({
      type: "room.leave",
      payload: { roomId: roomId },
    });

    this.rooms$.next();
    this.typingUsers = [];

    this.roomService.selectedRoom.next(null);
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  exitRoom(): Observable<void> {
    const roomId = this.currentRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return throwError(() => new Error("Not connected"));
    }

    this.wsService.sendMessage({
      type: "room.exit",
      payload: { roomId: roomId },
    });

    this.typingUsers = [];
    this.roomService.selectedRoom.next(null);

    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  reloadRooms() {
    this.rooms$.next();
  }
}
