import { Component, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogModule }      from 'primeng/dialog';
import { ButtonModule }      from 'primeng/button';
import { InputTextModule }   from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule }   from 'primeng/confirmdialog';
import { ReactiveFormsModule } from '@angular/forms';

import { SidebarComponent } from '../sidebar/sidebar.component';
import {UserService, UserResponse, UpdateUserDto} from '../../services/user.service';
import {switchMap, tap} from 'rxjs';

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
    ConfirmDialogModule,
    ReactiveFormsModule
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
  errorMessage ='';
  editForm!: FormGroup;
  editableUser: Partial<UserResponse> = {};
  public avatarOptions = [
    'avatar1.png',
    'avatar2.png',
  ];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmation: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // mai întâi află cine e „eu”
      this.userService.getCurrent().pipe(
        switchMap(current =>
          this.userService.getById(+idParam).pipe(
            tap(u => {
              this.user = u;
              // dacă id-ul din url e al meu, pot edita
              this.isOwnProfile = u.id === current.id;
              this.buildForm(u);
            })
          )
        )
      ).subscribe();
    } else {
      this.isOwnProfile = true;
      this.userService.getCurrent().subscribe(u => {
        this.user = u;
        this.buildForm(u);
      });
    }
  }

  private buildForm(u: UserResponse) {
    this.editForm = this.fb.group({
      name: [
        u.name,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern(/^[A-Za-z0-9_.]+$/)
        ]
      ],
      profilePicture: [u.profilePicture]
    });

    // când cineva modifică numele, ștergi eroarea de server
    this.editForm.get('name')!.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  openEdit() {
    if (!this.user) return;
    this.editForm.reset({
      name: this.user.name,
      profilePicture: this.user.profilePicture
    });
    this.errorMessage = '';
    this.selectedFilePreview = undefined;
    this.showEditDialog = true;
  }

  closeEdit() {
    this.showEditDialog = false;
  }

  selectAvatar(filename: string) {
    this.editForm.patchValue({ profilePicture: filename });
    // forţează dirty, ca să activezi butonul Save
    this.editForm.get('profilePicture')!.markAsDirty();
    this.selectedFilePreview = undefined;
  }


  get hasChanges(): boolean {
    if (!this.user) return false;
    const currentName = this.editForm.get('name')?.value;
    const currentPic  = this.editForm.get('profilePicture')?.value;
    return currentName !== this.user.name
      || currentPic  !== this.user.profilePicture;
  }

  get isNameTooShort(): boolean {
    const name = this.editableUser.name?.trim() || '';
    return name.length < 2;
  }

  get isNameTooLong(): boolean {
    return !!this.editableUser.name && this.editableUser.name.length > 30;
  }

  get isNameInvalid(): boolean {
    return this.isNameTooShort || this.isNameTooLong;
  }

  saveProfile() {
    this.showEditDialog = false;
    this.confirmation.confirm({
      message: 'Are you sure you want to save these changes?',
      accept: () => this.actuallySave(),
      reject: () => this.showEditDialog = true
    });
  }

  private actuallySave() {
    if (!this.user || this.editForm.invalid) return;

    const dto: UpdateUserDto = this.editForm.value;
    this.userService.updateProfile(dto).subscribe({
      next: () => {
        Object.assign(this.user!, dto);
        this.closeEdit();
      },
      error: err => {
        this.errorMessage = err.status === 409
          ? 'That username is already taken'
          : 'An unexpected error occurred.';
        this.showEditDialog = true;
      }
    });
  }
}
