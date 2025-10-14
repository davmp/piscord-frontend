import { inject, Injectable, signal } from "@angular/core";
import { tap, type Observable } from "rxjs";
import type { WSMessage } from "../../models/message.models";
import type { CreateRoomRequest, Room } from "../../models/rooms.models";
import { RoomService } from "../room/room.service";
import { WebsocketService } from "./ws.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private wsService = inject(WebsocketService);
  private roomService = inject(RoomService);

  roomChanged = signal(0);
  typingUsers: string[] = [];

  ngOnDestroy() {
    this.wsService.close();
  }

  sendMessage(
    content: string,
    replyMessageId: string | null,
    fileUrl: string | null
  ) {
    const roomId = this.roomService.selectedRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return "Not connected";
    }

    if (content.trim().length > 0) {
      const message: WSMessage = {
        type: "message",
        payload: {
          action: "send_message",
          room_id: roomId,
          file_url: fileUrl,
          reply_to: replyMessageId,
          content,
        },
      };

      this.wsService.sendMessage(message);
      return null;
    }
    return "Too small";
  }

  editMessage(messageId: string, content: string) {
    const roomId = this.roomService.selectedRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return "Not connected";
    }

    if (content.trim().length > 0) {
      const message: WSMessage = {
        type: "message",
        payload: {
          action: "edit_message",
          room_id: roomId,
          message_id: messageId,
          content,
        },
      };

      this.wsService.sendMessage(message);
      return null;
    }
    return "Too small";
  }

  selectRoom(room: Room) {
    if (!this.wsService.connected) {
      return "Not connected";
    }

    this.roomService.selectRoom(room);
    this.typingUsers = [];

    if (room) {
      this.wsService.sendMessage({
        type: "connection",
        payload: { action: "enter_room", room_id: room.id },
      });
    }
    return null;
  }

  selectRoomId(roomId: string) {
    this.roomService.getRoom(roomId).subscribe((room) => {
      if (!room) return;

      this.roomService.selectRoom(room);
      this.typingUsers = [];

      this.wsService.sendMessage({
        type: "connection",
        payload: { action: "enter_room", room_id: roomId },
      });
    });
    return null;
  }

  selectedDirectRoomId(userId: string) {
    return this.roomService.getDirectRoom(userId).pipe(
      tap((room) => {
        if (!room) return;

        this.roomService.selectRoom(room);
        this.typingUsers = [];

        this.wsService.sendMessage({
          type: "connection",
          payload: { action: "enter_room", room_id: room.id },
        });
      })
    );
  }

  createRoom(data: CreateRoomRequest) {
    return this.roomService.createRoom(data).pipe(
      tap((data) => {
        if (data) {
          this.roomChanged.update((n) => n + 1);
          this.selectRoom(data);
        } else {
          console.error("Error creating room:", data);
        }
      })
    );
  }

  joinRoom(newRoomId: string): Observable<Room> | null {
    if (!this.wsService.connected) {
      console.warn("Websocket not connected");
      return null;
    }

    return this.roomService.getRoom(newRoomId).pipe(
      tap((room) => {
        if (!room) return;

        this.roomService.selectRoom(room);
        this.roomService.joinRoom(room.id).subscribe({
          next: () => {
            this.roomChanged.update((n) => n + 1);
            this.typingUsers = [];

            this.wsService.sendMessage(
              JSON.stringify({
                type: "connection",
                payload: { action: "join_room", room_id: newRoomId },
              })
            );
          },
        });
      })
    );
  }

  leaveRoom() {
    const roomId = this.roomService.selectedRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return "Not connected";
    }

    this.wsService.sendMessage(
      JSON.stringify({
        type: "connection",
        payload: { action: "leave_room", room_id: roomId },
      })
    );

    this.roomChanged.update((n) => n + 1);
    this.typingUsers = [];

    this.roomService.selectRoom(null);
    return null;
  }

  exitRoom() {
    const roomId = this.roomService.selectedRoom()?.id;

    if (!roomId || !this.wsService.connected) {
      return "Not connected";
    }

    console.log("refresj");

    this.wsService.sendMessage(
      JSON.stringify({
        type: "connection",
        payload: { action: "exit_room", room_id: roomId },
      })
    );

    this.typingUsers = [];
    this.roomService.selectRoom(null);

    return null;
  }
}
