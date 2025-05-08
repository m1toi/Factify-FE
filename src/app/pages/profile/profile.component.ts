import { Component, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogModule }      from 'primeng/dialog';
import { ButtonModule }      from 'primeng/button';
import { InputTextModule }   from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule }   from 'primeng/confirmdialog';

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
    SidebarComponent,
    ConfirmDialogModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ConfirmationService]
})
export class ProfileComponent implements OnInit {
  user?: UserResponse;
  isOwnProfile = false;
  defaultAvatar = '/assets/avatars/placeholder1.png';
  showEditDialog = false;
  selectedFilePreview?: string;
  editableUser: Partial<UserResponse> = {};
  public avatarOptions = [
    'avatar1.png',
    'avatar2.png',
  ];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmation: ConfirmationService
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

  selectAvatar(filename: string) {
    this.editableUser.profilePicture = filename;
    // clear any old “upload preview”
    this.selectedFilePreview = undefined;
  }

  get hasChanges(): boolean {
    // if there's no user yet, no changes possible
    if (!this.user) return false;
    // name changed?
    const nameChanged = this.editableUser.name !== this.user.name;
    // avatar changed?
    const picChanged = this.editableUser.profilePicture !== this.user.profilePicture;
    return nameChanged || picChanged;
  }

  saveProfile() {
    // fire the confirmation dialog
    this.showEditDialog = false;
    this.confirmation.confirm({
      message: 'Are you sure you want to save these changes?',
      accept: () => this.actuallySave(),    // if they click “Yes”
      reject: () =>
      {this.showEditDialog=true},                     // do nothing on “No”
    });
  }

  private actuallySave() {
    if (!this.user) return;

    const dto: UpdateUserDto = {
      name: this.editableUser.name!,
      profilePicture: this.editableUser.profilePicture!
    };

    this.userService
      .updateProfile(dto)         // ← use updateProfile instead of update(...)
      .subscribe(() => {
        Object.assign(this.user!, dto);
        this.closeEdit();
      });
  }



}
