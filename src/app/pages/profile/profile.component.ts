import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserService, UserResponse, UpdateUserDto } from '../../services/user.service';
import { switchMap, tap } from 'rxjs/operators';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

  // edit-profile form
  showEditDialog = false;
  editForm!: FormGroup;
  errorMessage = '';
  public avatarOptions = ['avatar1.png', 'avatar2.png'];

  // infinite scroll
  posts: Post[] = [];
  flipped: boolean[] = [];
  page = 1;
  pageSize = 10;    // magic number de start
  loadingMore = false;
  hasMore = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmation: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userService.getCurrent().pipe(
        switchMap(current =>
          this.userService.getById(+idParam).pipe(
            tap(u => {
              this.user = u;
              this.isOwnProfile = u.id === current.id;
              this.buildForm(u);
              this.resetPosts();   // lansez încărcarea primului batch
            })
          )
        )
      ).subscribe();
    } else {
      // profil propriu
      this.isOwnProfile = true;
      this.userService.getCurrent().pipe(
        tap(u => {
          this.user = u;
          this.buildForm(u);
          this.resetPosts();   // lansez încărcarea primului batch
        })
      ).subscribe();
    }
  }

  // ─── infinite scroll ─────────────────────────────────────────────────────

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
    this.userService
      .getPostsByUser(this.user.id, this.page, this.pageSize)
      .subscribe({
        next: batch => {
          console.log('BATCH RECEIVED:', batch);
          this.posts.push(...batch);
          this.flipped.push(...batch.map(() => false));
          this.hasMore = batch.length === this.pageSize;
          this.loadingMore = false;
        },
        error: err => {
          console.error('Error loading posts:', err);
          if (err.error instanceof ProgressEvent) {
            console.error('⚠️ This is likely a response parsing issue');
          }
          this.loadingMore = false;
        }
      });
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    // dacă mai e <100px până jos, car ă încărc următoarea pagină
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

  // ─── edit-profile form ───────────────────────────────────────────────────

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
