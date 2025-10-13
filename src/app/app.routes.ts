import { Routes } from "@angular/router";
import { LayoutComponent } from "./components/layout/layout.component";
import { AuthGuardService } from "./services/auth/auth-guard.service";

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./pages/chat/chat.component").then((m) => m.ChatComponent),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./pages/settings/settings.component").then(
            (m) => m.SettingsComponent
          ),
      },
      {
        path: "notifications",
        loadComponent: () =>
          import("./pages/notifications/notifications.component").then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        path: "chat/:roomId",
        loadComponent: () =>
          import("./pages/chat/chat.component").then((m) => m.ChatComponent),
      },
    ],
    canActivate: [AuthGuardService],
  },
  {
    path: "login",
    loadComponent: () =>
      import("./pages/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./pages/auth/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  { path: "**", redirectTo: "" },
];
