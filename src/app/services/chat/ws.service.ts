import { inject, Injectable } from "@angular/core";
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  map,
  Observable,
  retry,
  shareReplay,
  switchMap,
  timer,
} from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { DeviceService } from "../device.service";
import { EnvService } from "../env.service";
import { AuthService } from "../user/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  private envService = inject(EnvService);

  private socket$!: WebSocketSubject<any>;
  connection$ = this.deviceService.isBrowser
    ? this.authService.profileChanged.pipe(
        filter((profile) => !!profile),
        switchMap(() => this.createConnection()),
        shareReplay({ bufferSize: 1, refCount: true })
      )
    : EMPTY;
  wsUrl$ = this.envService
    .loadEnv()
    .pipe(
      map(
        (env) =>
          env.wsUrl ??
          (this.deviceService.isBrowser && window.location
            ? `ws://${window.location.host}/api/ws`
            : null)
      )
    );

  connected = false;

  private createConnection(): Observable<any> {
    if (!this.deviceService.isBrowser || !this.authService.isAuthenticated()) {
      return EMPTY;
    }

    return this.wsUrl$.pipe(
      filter((url) => !!url),
      switchMap((url) => {
        const finalUrl = `${url}?at=${this.authService.getToken()}`;

        return new Observable<any>((subscriber) => {
          if (!this.socket$ || this.socket$.closed) {
            console.log("Creating new WebSocket connection:", finalUrl);

            this.socket$ = webSocket({
              url: finalUrl,
              openObserver: { next: () => (this.connected = true) },
              closeObserver: { next: () => (this.connected = false) },
              serializer: (msg) => JSON.stringify(msg),
              deserializer: (msg) => JSON.parse(msg.data),
            });
          }

          const sub = this.socket$.subscribe(subscriber);
          return () => sub.unsubscribe();
        });
      }),
      retry({
        delay: (_, count) => timer(Math.min(1000 * 2 ** count, 30000)),
      }),
      finalize(() => console.log("WebSocket finalized")),
      catchError((err) => {
        console.error("WebSocket error:", err);
        return EMPTY;
      })
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
    if (this.deviceService.isBrowser && this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined!;
    }
  }
}
