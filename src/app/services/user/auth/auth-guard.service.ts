import { inject, Injectable } from "@angular/core";
import {
  Router,
  type CanActivate,
  type RouterStateSnapshot,
} from "@angular/router";
import { DeviceService } from "../../device.service";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuardService implements CanActivate {
  private authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  private router = inject(Router);

  constructor() {}

  canActivate(_: unknown, state: RouterStateSnapshot) {
    if (!this.deviceService.isBrowser) {
      return false;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    return this.router.createUrlTree(["/login"], {
      queryParams: { returnUrl: state.url },
    });
  }
}
