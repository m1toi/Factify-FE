// src/app/pages/profile/profile.component.ts
import {
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { PostCardComponent } from '../post-card/post-card.component';
import { UserService, UserResponse, UpdateUserDto } from '../../services/user.service';
import { FriendshipService, FriendshipResponse } from '../../services/friendship.service';
import { switchMap, tap } from 'rxjs/operators';
import { Post } from '../../models/post.model';

enum FriendshipStatus {
  NotFriends,
  PendingOutgoing,
  PendingIncoming,
  Friends
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    SidebarComponent,
    PostCardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ConfirmationService]
})
export class ProfileComponent implements OnInit {
  // ■ profile & edit
  user?: UserResponse;
  isOwnProfile = false;
  defaultAvatar = '/assets/avatars/placeholder1.png';
  showEditDialog = false;
  editForm!: FormGroup;
  errorMessage = '';
  avatarOptions = ['avatar1.png','avatar2.png'];

  // ■ infinite scroll posts
  posts: Post[] = [];
  flipped: boolean[] = [];
  page = 1;
  pageSize = 10;
  loadingMore = false;
  hasMore = true;

  // ■ current user id
  private currentUserId!: number;

  // ■ friendship
  FriendshipStatus = FriendshipStatus;
  friendStatus = FriendshipStatus.NotFriends;
  currentFriendshipId?: number;
  actionInProgress = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private friendshipService: FriendshipService,
    private confirmation: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // 1) decode current user ID once
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = +decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
    }

    // 2) subscribe to :id changes
    this.route.paramMap.pipe(
      switchMap(params => {
        const idStr = params.get('id');
        if (idStr) {
          // viewing another profile
          const profileId = +idStr;
          this.isOwnProfile = (profileId === this.currentUserId);
          return this.userService.getById(profileId).pipe(
            tap(u => {
              this.user = u;
              this.buildForm(u);
              this.resetPosts();
              this.initFriendshipState(profileId);
            })
          );
        } else {
          // viewing own profile
          this.isOwnProfile = true;
          return this.userService.getById(this.currentUserId).pipe(
            tap(u => {
              this.user = u;
              this.buildForm(u);
              this.resetPosts();
              this.friendStatus = FriendshipStatus.Friends; // self
            })
          );
        }
      })
    ).subscribe({
      error: err => console.error('Failed to load profile', err)
    });
  }

  // ─── Friendship ──────────────────────────────────────

  private initFriendshipState(profileId: number): void {
    this.friendshipService.listMine(this.currentUserId)
      .subscribe(list => {
        const rel = list.find(f =>
          (f.userId === profileId || f.friendId === profileId)
        );
        if (!rel) {
          this.friendStatus = FriendshipStatus.NotFriends;
          this.currentFriendshipId = undefined;
        } else {
          this.currentFriendshipId = rel.friendshipId;
          if (!rel.isConfirmed) {
            this.friendStatus = rel.userId === this.currentUserId
              ? FriendshipStatus.PendingOutgoing
              : FriendshipStatus.PendingIncoming;
          } else {
            this.friendStatus = FriendshipStatus.Friends;
          }
        }
      });
  }

  onFriendAction(): void {
    if (!this.user) return;
    this.actionInProgress = true;
    const pid = this.user.id;

    switch (this.friendStatus) {
      case FriendshipStatus.NotFriends:
        this.friendshipService
          .sendRequest(this.currentUserId, pid)
          .subscribe({
            next: (f: FriendshipResponse) => {
              this.friendStatus = FriendshipStatus.PendingOutgoing;
              this.currentFriendshipId = f.friendshipId;
            },
            error: e => console.error(e),
            complete: () => this.actionInProgress = false
          });
        break;

      case FriendshipStatus.PendingOutgoing:
      case FriendshipStatus.Friends:
        // cancel pending or unfriend
        this.friendshipService
          .remove(this.currentFriendshipId!)
          .subscribe({
            next: () => {
              this.friendStatus = FriendshipStatus.NotFriends;
              this.currentFriendshipId = undefined;
            },
            error: e => console.error(e),
            complete: () => this.actionInProgress = false
          });
        break;

      case FriendshipStatus.PendingIncoming:
        this.friendshipService
          .accept(this.currentFriendshipId!)
          .subscribe({
            next: f => {
              this.friendStatus = FriendshipStatus.Friends;
            },
            error: e => console.error(e),
            complete: () => this.actionInProgress = false
          });
        break;
    }
  }

  // ─── infinite scroll posts ────────────────────────────

  private resetPosts(): void {
    this.posts = [];
    this.flipped = [];
    this.page = 1;
    this.hasMore = true;
    this.loadPosts();
  }

  private loadPosts(): void {
    if (!this.user || this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.userService.getPostsByUser(this.user.id, this.page, this.pageSize)
      .subscribe({
        next: batch => {
          this.posts.push(...batch);
          this.flipped.push(...batch.map(() => false));
          this.hasMore = batch.length === this.pageSize;
          this.loadingMore = false;
        },
        error: err => {
          console.error('Error loading posts:', err);
          this.loadingMore = false;
        }
      });
  }

  onScroll(event: Event): void {
    const el = (event.target as HTMLElement);
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 100) {
      if (this.hasMore && !this.loadingMore) {
        this.page++;
        this.loadPosts();
      }
    }
  }

  toggleFlip(idx: number): void {
    this.flipped[idx] = !this.flipped[idx];
  }

  // ─── edit-profile form ───────────────────────────────

  private buildForm(u: UserResponse) {
    this.editForm = this.fb.group({
      name: [
        u.name, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern(/^[A-Za-z0-9_.]+$/)
        ]
      ],
      profilePicture: [u.profilePicture]
    });
    this.editForm.get('name')!
      .valueChanges
      .subscribe(() => this.errorMessage = '');
  }

  openEdit(): void {
    if (!this.user) return;
    this.editForm.reset({
      name: this.user.name,
      profilePicture: this.user.profilePicture
    });
    this.errorMessage = '';
    this.showEditDialog = true;
  }

  closeEdit(): void {
    this.showEditDialog = false;
  }

  selectAvatar(filename: string): void {
    this.editForm.patchValue({ profilePicture: filename });
    this.editForm.get('profilePicture')!.markAsDirty();
  }

  get hasChanges(): boolean {
    if (!this.user) return false;
    const name = this.editForm.get('name')?.value;
    const pic  = this.editForm.get('profilePicture')?.value;
    return name !== this.user.name || pic !== this.user.profilePicture;
  }

  saveProfile(): void {
    this.showEditDialog = false;
    this.confirmation.confirm({
      message: 'Are you sure you want to save these changes?',
      accept: () => this.actuallySave(),
      reject: () => this.showEditDialog = true
    });
  }

  private actuallySave(): void {
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
