import { Component, inject } from "@angular/core";
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
import type { Profile, UpdateProfileRequest } from "../../models/user.models";
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

  isLoading = false;
  success = false;
  errorMessage: string | null = null;
  private profile: Profile | null = null;

  buttonThemes = themes.buttonThemes;
  inputThemes = themes.inputThemes;

  constructor() {
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
    this.getProfile();
  }

  getProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.form.get("username")?.setValue(profile.username);
        this.form.get("picture")?.setValue(profile.picture);
        this.form.get("bio")?.setValue(profile.bio);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error.message;
      },
    });
    this.isLoading = false;
  }

  updateProfile() {
    this.isLoading = true;
    this.success = false;
    this.errorMessage = null;

    const dat: Partial<UpdateProfileRequest> = {};

    if (this.form.get("username")?.value !== this.profile?.username) {
      dat.username = this.form.get("username")?.value;
    }
    if (this.form.get("password")?.value) {
      dat.password = this.form.get("password")?.value;
    }
    if (this.form.get("bio")?.value !== this.profile?.bio) {
      dat.bio = this.form.get("bio")?.value;
    }
    if (this.form.get("picture")?.value !== this.profile?.picture) {
      dat.picture = this.form.get("picture")?.value;
    }

    this.authService.updateProfile(dat).subscribe({
      next: () => {
        this.success = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error.error;
        this.isLoading = false;

        if (err.status === 400) {
          this.form.markAllAsTouched();
        } else if (err.status === 409) {
          this.form.get("username")?.setErrors({ unique: true });
        } else {
          this.errorMessage =
            err.error.error ?? "Ocorreu um erro ao atualizar o perfil.";
        }
      },
    });
  }
}
