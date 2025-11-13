import { Component, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Popover } from "primeng/popover";
import { catchError, EMPTY, finalize, startWith, tap } from "rxjs";
import type { Profile } from "../../../models/user.models";
import { UserService } from "../../../services/user/user.service";
import * as formThemes from "../../../themes/form.themes";

@Component({
  selector: "app-user-popover",
  standalone: true,
  imports: [Popover, Avatar, Button, RouterLink],
  templateUrl: "./user-popover.component.html",
})
export class UserPopoverComponent {
  private userService = inject(UserService);

  userId = input<string>();
  isOwn = input(false);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  userInfo = signal<Profile | null>(null);

  readonly menuThemes = formThemes.menuThemes;
  readonly buttonThemes = formThemes.buttonThemes;

  showUserPopup() {
    const id = this.userId();
    if (!id) {
      this.errorMessage.set("Usuário não existe.");
      return;
    }

    this.userInfo.set(null);
    this.errorMessage.set(null);

    this.userService
      .getProfileById(id)
      .pipe(
        tap((profile) => this.userInfo.set(profile)),
        finalize(() => this.isLoading.set(false)),
        catchError((err) => {
          this.errorMessage.set(
            err.error.error ??
              "Ocorreu um erro ao logar, tente novamente mais tarde."
          );
          return EMPTY;
        }),
        startWith(() => this.isLoading.set(true))
      )
      .subscribe();
  }
}
