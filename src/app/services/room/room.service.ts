import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, shareReplay, Subject } from "rxjs";
import type {
  CreateRoomRequest,
  GetRooms,
  PublicRoom,
  Room,
  RoomDetails,
  UpdateRoomRequest
} from "../../models/rooms.models";

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private readonly roomsApiUrl = "/api/rooms";
  private http = inject(HttpClient);

  selectedRoom = new BehaviorSubject<Room | null>(null);
  
  newRoom = new Subject<Room>();
  roomUpdated = new Subject<Room>();
  removeRoom = new Subject<string>();

  getRooms(search: string): Observable<GetRooms<PublicRoom>> {
    return this.http
      .get<GetRooms<PublicRoom>>(this.roomsApiUrl, {
        ...(search && { params: { search } }),
      })
      .pipe(
        shareReplay(),
        catchError((err) => {
          console.error("Error fetching rooms:", err);
          throw err;
        })
      );
  }

  getMyRooms(): Observable<GetRooms> {
    return this.http.get<GetRooms>(`${this.roomsApiUrl}/my-rooms`).pipe(
      shareReplay(),
      catchError((err) => {
        console.error("Error fetching rooms:", err);
        throw err;
      })
    );
  }

  getRoom(id: string): Observable<RoomDetails> {
    return this.http.get<RoomDetails>(`${this.roomsApiUrl}/${id}`).pipe(
      shareReplay(),
      catchError((err) => {
        console.error(`Error fetching room with id ${id}:`, err);
        throw err;
      })
    );
  }

  getDirectRoom(userId: string): Observable<RoomDetails> {
    return this.http
      .get<RoomDetails>(`${this.roomsApiUrl}/direct/${userId}`)
      .pipe(
        shareReplay(),
        catchError((err) => {
          console.error(
            `Error fetching direct room with user ID ${userId}:`,
            err
          );
          throw err;
        })
      );
  }

  createRoom(data: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(this.roomsApiUrl, data).pipe(
      catchError((err) => {
        console.error("Error creating room:", err);
        throw err;
      })
    );
  }

  updateRoom(
    roomId: string,
    data: Partial<UpdateRoomRequest>
  ): Observable<RoomDetails> {
    return this.http
      .put<RoomDetails>(`${this.roomsApiUrl}/${roomId}`, data)
      .pipe(
        catchError((err) => {
          console.error("Error creating room:", err);
          throw err;
        })
      );
  }

  joinRoom(id: string): Observable<void> {
    return this.http.post<void>(`${this.roomsApiUrl}/${id}/join`, {}).pipe(
      catchError((err) => {
        console.error(`Error joining room with id ${id}:`, err);
        throw err;
      })
    );
  }

  leaveRoom(id: string): Observable<void> {
    return this.http.post<void>(`${this.roomsApiUrl}/${id}/leave`, {}).pipe(
      catchError((err) => {
        console.error(`Error leaving room with id ${id}:`, err);
        throw err;
      })
    );
  }

  kickMember(roomId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.roomsApiUrl}/kick/${roomId}/${userId}`, {}).pipe(
      catchError((err) => {
        console.error(`Error kicking user with id ${userId} from room with id ${roomId}:`, err);
        throw err;
      })
    );
  }
}
