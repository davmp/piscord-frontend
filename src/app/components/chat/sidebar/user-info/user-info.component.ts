import { Component } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import type { User } from '../../../../models/user.models';

@Component({
  selector: 'app-user-info',
  imports: [Avatar],
  templateUrl: './user-info.component.html',
  styles: ``,
})
export class UserInfoComponent {
  user: User;

  constructor() {
    this.user = {
      id: '6s7f8g9h0j1k2l3m4n5o',
      username: 'JohnDoe',
      avatarUrl: 'https://dbl-discord.usercontent.prism.gg/embed/avatars/1.png',
    };
  }
}
