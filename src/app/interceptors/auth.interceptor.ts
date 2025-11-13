import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { DeviceService } from "../services/device.service";
import { AuthService } from "../services/user/auth/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const deviceService = inject(DeviceService);
  const router = inject(Router);

  const token = authService.getToken();

  if (req.url.includes("/auth/login") || req.url.includes("/auth/register")) {
    return next(req);
  }

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 0) {
        console.warn("Network or CORS error detected, not reloading.");
        return throwError(() => error);
      }
      if (error.status === 401) {
        authService.logout();

        if (deviceService.isBrowser) {
          router.navigate(["/login"]);
        }
      }

      return throwError(() => error);
    })
  );
};
