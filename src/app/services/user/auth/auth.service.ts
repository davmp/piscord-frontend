import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, shareReplay, Subject, tap } from "rxjs";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../../../models/auth.models";
import type {
  Profile,
  UpdateProfileRequest,
} from "../../../models/user.models";
import { DeviceService } from "../../device.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly authApiUrl = "http://localhost:8000/api";
  private readonly profileApiUrl = "http://localhost:8000/api/profile";
  private readonly deviceService = inject(DeviceService);
  private http = inject(HttpClient);

  profileChanged: Subject<Profile | null> = new Subject();

  getProfile() {
    return this.http.get<Profile>(this.profileApiUrl).pipe(
      tap((profile) => {
        this.profileChanged.next(profile);
        this.setProfile(profile);
      })
    );
  }

  updateProfile(data: Partial<UpdateProfileRequest>) {
    return this.http.put<Profile>(this.profileApiUrl, data).pipe(
      tap((profile) => {
        this.profileChanged.next(profile);
        this.setProfile(profile);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authApiUrl}/auth/login`, data)
      .pipe(
        tap((res) => {
          this.profileChanged.next(res.user);
          this.setSession(res);
        }),
        shareReplay()
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authApiUrl}/auth/register`, data)
      .pipe(
        tap((res) => {
          this.profileChanged.next(res.user);
          this.setSession(res);
        }),
        shareReplay()
      );
  }

  logout(): void {
    if (this.deviceService.isBrowser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (this.deviceService.isBrowser) {
      return localStorage.getItem("token");
    }
    return null;
  }

  private setProfile(user: Profile) {
    if (this.deviceService.isBrowser) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  private setSession(authResult: AuthResponse): void {
    if (this.deviceService.isBrowser) {
      localStorage.setItem("token", authResult.token);
      localStorage.setItem("user", JSON.stringify(authResult.user));
    }
  }
}
