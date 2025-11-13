import { inject, Injectable } from "@angular/core";
import {
  catchError,
  EMPTY,
  finalize,
  Observable,
  retry,
  shareReplay,
  timer,
} from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { DeviceService } from "../device.service";
import { AuthService } from "../user/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private authService = inject(AuthService);
  private deviceService = inject(DeviceService);

  private socket$!: WebSocketSubject<any>;
  connection$ = this.deviceService.isBrowser
    ? this.createConnection().pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      )
    : EMPTY;

  connected = false;

  private get wsUrl() {
    return this.deviceService.isBrowser
      ? `ws://${window.location.host}/api/ws`
      : null;
  }

  private createConnection(): Observable<any> {
    if (!this.deviceService.isBrowser) {
      return EMPTY;
    }

    return new Observable<any>((subscriber) => {
      if (!this.socket$ || this.socket$.closed) {
        console.log("Creating new WebSocket connection");
        this.socket$ = webSocket({
          url: `${this.wsUrl}?at=${this.authService.getToken()}`,
          openObserver: { next: () => (this.connected = true) },
          closeObserver: { next: () => (this.connected = false) },
          serializer: (msg) => JSON.stringify(msg),
          deserializer: (msg) => JSON.parse(msg.data),
        });
      }

      const sub = this.socket$.subscribe(subscriber);
      return () => sub.unsubscribe();
    }).pipe(
      retry({ delay: (_, count) => timer(Math.min(1000 * 2 ** count, 30000)) }),
      finalize(() => console.log("WebSocket finalized")),
      catchError(() => EMPTY)
    );
  }

  public connection(): Observable<any> {
    return this.connection$;
  }

  public sendMessage(msg: any): void {
    if (this.deviceService.isBrowser && this.socket$) {
      this.socket$.next(msg);
    }
  }

  public close(): void {
    if (this.deviceService.isBrowser) {
      this.socket$.complete();
    }
  }
}
