import { Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputText } from "primeng/inputtext";
import { Message } from "primeng/message";
import { Password } from "primeng/password";
import { Textarea } from "primeng/textarea";
import { catchError, EMPTY, finalize, startWith, tap } from "rxjs";
import type { UpdateProfileRequest } from "../../models/user.models";
import { AuthService } from "../../services/user/auth/auth.service";
import * as themes from "../../themes/form.themes";

@Component({
  selector: "app-settings",
  imports: [
    Button,
    InputText,
    Avatar,
    Message,
    Textarea,
    InputGroup,
    InputGroupAddon,
    ReactiveFormsModule,
    Password,
    RouterLink,
  ],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  form: FormGroup;

  readonly profile = signal(this.authService.profileChanged.value);
  isLoading = signal(false);
  success = signal(false);
  errorMessage = signal(undefined as string | undefined);

  readonly buttonThemes = themes.buttonThemes;
  readonly inputThemes = themes.inputThemes;

  constructor() {
    this.getProfile();

    this.authService.profileChanged.pipe(takeUntilDestroyed()).subscribe({
      next: (profile) => {
        this.form.get("username")?.setValue(profile?.username);
        this.form.get("picture")?.setValue(profile?.picture);
        this.form.get("bio")?.setValue(profile?.bio);

        this.profile.set(profile);
      },
    });

    this.form = this.formBuilder.group({
      username: [
        "",
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.required,
        ]),
      ],
      picture: [""],
      bio: [""],
      password: [
        "",
        Validators.compose([Validators.minLength(4), Validators.maxLength(50)]),
      ],
    });
  }

  getProfile() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe(() => this.isLoading.set(false));
  }

  updateProfile() {
    this.errorMessage.set(undefined);

    const dat = this.getChangedFields();
    this.authService
      .updateProfile(dat)
      .pipe(
        tap(() => this.success.set(true)),
        finalize(() => this.isLoading.set(false)),
        catchError((err) => {
          this.errorMessage.set(
            err.error.error ?? "Ocorreu um erro ao atualizar o perfil."
          );
          return EMPTY;
        }),
        startWith(() => this.isLoading.set(true))
      )
      .subscribe();
  }

  getChangedFields(): Partial<UpdateProfileRequest> {
    const dat: Partial<UpdateProfileRequest> = {};

    if (this.form.get("username")?.value !== this.profile()?.username) {
      dat.username = this.form.get("username")?.value;
    }
    if (this.form.get("password")?.value) {
      dat.password = this.form.get("password")?.value;
    }
    if (this.form.get("bio")?.value !== this.profile()?.bio) {
      dat.bio = this.form.get("bio")?.value;
    }
    if (this.form.get("picture")?.value !== this.profile()?.picture) {
      dat.picture = this.form.get("picture")?.value;
    }

    return dat;
  }
}
