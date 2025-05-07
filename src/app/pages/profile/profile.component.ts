import { Component, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// PrimeNG modules
import { DialogModule }      from 'primeng/dialog';
import { ButtonModule }      from 'primeng/button';
import { InputTextModule }   from 'primeng/inputtext';

import { SidebarComponent } from '../sidebar/sidebar.component';
import {UserService, UserResponse, UpdateUserDto} from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SidebarComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user?: UserResponse;
  isOwnProfile = false;
  defaultAvatar = '/assets/avatars/placeholder1.png';
  showEditDialog = false;
  selectedFilePreview?: string;
  editableUser: Partial<UserResponse> = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userService.getById(+idParam).subscribe(u => {
        this.user = u;
        this.editableUser = { ...u };
      });
    } else {
      this.isOwnProfile = true;
      this.userService.getCurrent().subscribe(u => {
        this.user = u;
        this.editableUser = { ...u };
      });
    }
  }

  openEdit() {
    this.showEditDialog = true;
  }
  closeEdit() {
    this.showEditDialog = false;
  }

  onFileSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.selectedFilePreview = reader.result as string;
      reader.readAsDataURL(file);
      // TODO: upload the file or store it in editableUser.profilePicture
    }
  }

  saveProfile() {
    const payload: UpdateUserDto = {
      name: this.editableUser.name!,
      profilePicture: this.selectedFilePreview || this.editableUser.profilePicture
    };

    this.userService.update(this.user!.id, payload)
      .subscribe(() => {
        // locally merge so UI reflects change immediately:
        Object.assign(this.user!, payload);
        this.selectedFilePreview = undefined;
        this.closeEdit();
      });
  }

}
