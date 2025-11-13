import { Component, inject, signal } from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormGroup,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Button } from "primeng/button";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputText } from "primeng/inputtext";
import { Message } from "primeng/message";
import { Password } from "primeng/password";
import { catchError, EMPTY, finalize, startWith, tap } from "rxjs";
import { DeviceService } from "../../../services/device.service";
import { AuthService } from "../../../services/user/auth/auth.service";
import * as formThemes from "../../../themes/form.themes";

@Component({
  selector: "app-login",
  imports: [
    Button,
    Password,
    InputText,
    InputGroupModule,
    InputGroupAddonModule,
    Message,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  loginForm: FormGroup;

  isLoading = signal(false);
  errorMessage = signal(undefined as string | undefined);

  readonly inputThemes = formThemes.inputThemes;
  readonly buttonThemes = formThemes.buttonThemes;

  constructor() {
    if (this.deviceService.isBrowser && this.authService.isAuthenticated()) {
      this.router.navigateByUrl("/", { skipLocationChange: true });
    }

    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  login() {
    if (this.isLoading()) return;

    const val = this.loginForm.value;

    const loginRequest = { username: val.username, password: val.password };

    this.authService
      .login(loginRequest)
      .pipe(
        tap((profile) => {
          this.authService.profileChanged.next(profile.user);
          this.router.navigateByUrl("/", { skipLocationChange: true });
        }),
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
