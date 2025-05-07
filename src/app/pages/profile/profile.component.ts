import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService, UserResponse } from '../../services/user.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user?: UserResponse;
  isOwnProfile = false;
  defaultAvatar = '/assets/avatars/placeholder1.png';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('ProfileComponent init, idParam =', idParam);

    if (idParam) {
      this.userService.getById(+idParam).subscribe(u => {
        console.log('Loaded other user →', u);
        this.user = u;
      });
    } else {
      this.isOwnProfile = true;
      this.userService.getCurrent().subscribe(u => {
        console.log('Loaded current user →', u);
        this.user = u;
      });
    }
  }

}
