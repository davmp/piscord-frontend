import { Routes } from "@angular/router";
import { LayoutComponent } from "./components/chat/layout/layout.component";

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
    ],
  },
  { path: "**", redirectTo: "" },
];
