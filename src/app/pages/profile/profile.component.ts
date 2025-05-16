// profile.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PostCardComponent } from '../post-card/post-card.component';
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
    ConfirmDialogModule,
    PostCardComponent
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
  pageSize = 10;
  loadingMore = false;
  hasMore = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmation: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // ne abonăm la orice schimbare de :id din URL
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const idStr = params.get('id');
          if (idStr) {
            // când vinem de pe /profile/:id
            const requestedId = +idStr;
            return this.userService.getCurrent().pipe(
              switchMap(current => {
                this.isOwnProfile = current.id === requestedId;
                return this.userService.getById(requestedId).pipe(
                  tap(u => {
                    this.user = u;
                    this.buildForm(u);
                    this.resetPosts();
                  })
                );
              })
            );
          } else {
            // când suntem pur și simplu pe /profile (profilul propriu)
            this.isOwnProfile = true;
            return this.userService.getCurrent().pipe(
              tap(u => {
                this.user = u;
                this.buildForm(u);
                this.resetPosts();
              })
            );
          }
        })
      )
      .subscribe({
        error: err => console.error('Profile load failed', err)
      });
  }

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
    const el = event.target as HTMLElement;
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
      .subscribe(() => (this.errorMessage = ''));
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
    const pic = this.editForm.get('profilePicture')?.value;
    return name !== this.user.name || pic !== this.user.profilePicture;
  }

  saveProfile(): void {
    this.showEditDialog = false;
    this.confirmation.confirm({
      message: 'Are you sure you want to save these changes?',
      accept: () => this.actuallySave(),
      reject: () => (this.showEditDialog = true)
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
