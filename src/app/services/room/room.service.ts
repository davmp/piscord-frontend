import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { catchError, Observable, shareReplay, tap } from "rxjs";
import type {
  CreateRoomRequest,
  GetRooms,
  PublicRoom,
  Room,
} from "../../models/rooms.models";

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private readonly roomsApiUrl = "http://127.0.0.1:8000/api/rooms";
  private http = inject(HttpClient);
  selectedRoom = signal<Room | null>(null);

  selectRoom(room: Room | null) {
    this.selectedRoom.set(room);
  }

  getRooms(search: string): Observable<GetRooms<PublicRoom>> {
    return this.http
      .get<GetRooms<PublicRoom>>(this.roomsApiUrl, {
        params: { search },
      })
      .pipe(
        shareReplay(),
        catchError((error) => {
          console.error("Error fetching rooms:", error);
          return [];
        })
      );
  }

  getMyRooms(): Observable<GetRooms> {
    return this.http.get<GetRooms>(`${this.roomsApiUrl}/my-rooms`).pipe(
      shareReplay(),
      catchError((error) => {
        console.error("Error fetching rooms:", error);
        return [];
      })
    );
  }

  getRoom(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.roomsApiUrl}/${id}`).pipe(
      shareReplay(),
      catchError((error) => {
        console.error(`Error fetching room with id ${id}:`, error);
        throw error;
      })
    );
  }

  createRoom(data: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(this.roomsApiUrl, data).pipe(
      catchError((error) => {
        console.error("Error creating room:", error);
        throw error;
      })
    );
  }

  joinRoom(id: string): Observable<void> {
    return this.http.post<void>(`${this.roomsApiUrl}/${id}/join`, {}).pipe(
      catchError((error) => {
        console.error(`Error joining room with id ${id}:`, error);
        throw error;
      })
    );
  }

  leaveRoom(id: string): Observable<void> {
    return this.http.post<void>(`${this.roomsApiUrl}/${id}/leave`, {}).pipe(
      catchError((error) => {
        console.error(`Error leaving room with id ${id}:`, error);
        throw error;
      })
    );
  }
}
