import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private authService = inject(AuthService);
  private socket$: WebSocketSubject<any>;
  private readonly WS_URL = "ws://localhost:8000/api/ws";

  connected = false;

  constructor() {
    this.socket$ = this.getNewWebSocket();
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: `${this.WS_URL}?at=${this.authService.getToken()}`,
      openObserver: {
        next: () => {
          console.log("WebSocket connection opened");
          this.connected = true;
        },
      },
      closeObserver: {
        next: () => {
          console.log("WebSocket connection closed");
          this.socket$ = this.getNewWebSocket();
          this.connected = false;
        },
      },
      serializer: (msg) => JSON.stringify(msg),
      deserializer: (msg) => JSON.parse(msg.data),
    });
  }

  connection(): Observable<any> {
    return this.socket$.asObservable();
  }

  sendMessage(msg: any): void {
    this.socket$.next(msg);
  }

  close(): void {
    this.socket$.complete();
  }
}
