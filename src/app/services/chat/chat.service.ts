import { computed, Injectable, signal } from "@angular/core";
import type { Room } from "../../models/rooms.models";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private rooms = signal<Room[]>([]);
  private selectedRoomId = signal<string | null>(null);

  constructor() {
    this.initRooms();
  }

  OnNgInit() {
    this.initRooms();
  }

  private async initRooms() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.rooms.set([
      { id: "6s7f8g9h0j1k2l3m4n5o", name: "General" },
      { id: "1a2b3c4d5e6f7g8h9i0j", name: "Random" },
      { id: "0j9i8h7g6f5e4d3c2b1a", name: "Tech Talk" },
    ]);
    this.selectedRoomId.set(this.rooms()[0].id);
  }

  get selectedRoom() {
    return this.rooms().find((room) => room.id === this.selectedRoomId());
  }

  selectRoom(roomId: string) {
    this.selectedRoomId.set(roomId);
  }

  getRooms = computed((search: string = "") => {
    return this.rooms().filter((room) => room.name.includes(search));
  });
}
