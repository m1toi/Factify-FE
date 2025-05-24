import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserService,
  UserSearchResult
} from '../../services/user.service';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareDialogComponent {
  @Input() postId!: number;
  @Input() visible = false;

  @Output() close = new EventEmitter<void>();
  @Output() shareConfirmed = new EventEmitter<{
    userIds: number[];
    content?: string;
    postId: number;
  }>();

  searchQuery = '';
  results: UserSearchResult[] = [];
  selected: UserSearchResult[] = [];
  messageText = '';

  constructor(private userService: UserService) {}

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q.length < 2) {
      this.results = [];
      return;
    }
    this.userService.searchUsers(q).subscribe({
      next: users => {
        // elimină deja selectații
        this.results = users.filter(u =>
          !this.selected.find(s => s.userId === u.userId)
        );
      },
      error: () => (this.results = [])
    });
  }

  addRecipient(user: UserSearchResult) {
    this.selected = [...this.selected, user];
    this.searchQuery = '';
    this.results = [];
  }

  removeRecipient(user: UserSearchResult) {
    this.selected = this.selected.filter(u => u.userId !== user.userId);
  }

  onSend() {
    if (!this.selected.length) return;
    const userIds = this.selected.map(u => u.userId);
    this.shareConfirmed.emit({
      userIds,
      content: this.messageText || undefined,
      postId: this.postId
    });
  }
}
