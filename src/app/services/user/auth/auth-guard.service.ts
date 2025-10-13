import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import {
  Router,
  type CanActivate,
  type RouterStateSnapshot,
} from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGuardService implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  canActivate(_: unknown, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      return this.router.createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
    }
  }
}
