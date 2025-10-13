import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-friends",
  imports: [RouterLink],
  templateUrl: "./friends.component.html",
})
export class FriendsComponent {
  isLoading = false;
}
