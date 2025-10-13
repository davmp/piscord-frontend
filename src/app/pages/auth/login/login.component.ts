import { Component, inject } from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormGroup,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { AuthService } from "../../../services/user/auth/auth.service";
import * as formThemes from "../../../themes/form.themes";

@Component({
  selector: "app-login",
  imports: [
    ButtonModule,
    PasswordModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  loginForm: FormGroup;

  inputThemes = formThemes.inputThemes;
  buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl("/");
    }
  }

  login() {
    const val = this.loginForm.value;

    if (val.username && val.password) {
      const loginRequest = { username: val.username, password: val.password };
      this.authService.login(loginRequest).subscribe(() => {
        this.router.navigateByUrl("/");
      });
    }
  }
}
