import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class DeviceService {
  private readonly mobileWidthThreshold = 768;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  isMobile(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return window.innerWidth <= this.mobileWidthThreshold;
  }

  isPathname(pathname: string): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return this.router.url === pathname;
  }

  isInPathname(pathnames: string[]): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return pathnames.some((pathname) => this.router.url === pathname);
  }

  endsWithPathname(pathname: string): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return this.router.url.endsWith(pathname);
  }
}
