import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import type { Room } from '../../models/rooms.models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private _selectedRoom = signal<Room | null>(null);

  get selectedRoom() {
    return this._selectedRoom();
  }

  selectRoom(room: Room | null) {
    this._selectedRoom.set(room);
  }

  getRooms(): Observable<Room[]> {
    return new Observable((observer) => {
      setTimeout(() => {
        const rooms = [
          { id: '6s7f8g9h0j1k2l3m4n5o', name: 'General' },
          { id: '1a2b3c4d5e6f7g8h9i0j', name: 'Random' },
          { id: '0j9i8h7g6f5e4d3c2b1a', name: 'Tech Talk' },
        ];
        observer.next(rooms);
        observer.complete();
      }, 1000);
    });
  }
}
