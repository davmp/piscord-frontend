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
  selector: "app-register",
  imports: [
    ButtonModule,
    PasswordModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  registerForm: FormGroup;

  inputThemes = formThemes.inputThemes;
  buttonThemes = formThemes.buttonThemes;

  constructor() {
    this.registerForm = this.formBuilder.group({
      username: ["", Validators.required],
      profileUrl: [""],
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required],
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl("/");
    }
  }

  register() {
    const val = this.registerForm.value;

    if (val.username && val.password && val.password === val.confirmPassword) {
      const registerRequest = {
        username: val.username,
        picture: val.profileUrl,
        password: val.password,
      };
      this.authService.register(registerRequest).subscribe(() => {
        this.router.navigateByUrl("/");
      });
    }
  }
}
