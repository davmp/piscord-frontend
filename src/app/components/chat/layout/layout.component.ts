import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SplitterModule } from "primeng/splitter";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet, SidebarComponent, SplitterModule],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {}
