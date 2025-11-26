import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EnvService {
  private http = inject(HttpClient);
  private env$?: Observable<any>;

  loadEnv() {
    if (!this.env$) {
      this.env$ = this.http.get('/env.json').pipe(shareReplay(1));
    }
    return this.env$;
  }
}