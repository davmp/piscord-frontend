import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, shareReplay } from "rxjs";
import type { MessagePaginationResult } from "../../models/message.models";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private readonly apiUrl = "/api/rooms";
  private readonly http = inject(HttpClient);

  getMessages(
    roomId: string,
    page: number = 1,
    limit: number = 20
  ): Observable<MessagePaginationResult> {
    let params = new HttpParams();
    params = params.append("page", page.toString());
    params = params.append("limit", limit.toString());
    return this.http
      .get<MessagePaginationResult>(`${this.apiUrl}/${roomId}/messages`, {
        params,
      })
      .pipe(
        shareReplay(),
        catchError((err) => {
          console.error("Error fetching messages: ", err);
          throw err;
        })
      );
  }
}
