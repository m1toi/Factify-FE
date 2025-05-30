// src/app/chat/share-dialog/share-dialog.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FriendshipService,
  FriendForShare
} from '../../services/friendship.service';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareDialogComponent implements OnInit {
  @Input() postId!: number;
  private _visible = false;

  @Input() set visible(value: boolean) {
    this._visible = value;
    if (!value) {
      this.resetDialog();
    }
  }
  get visible(): boolean {
    return this._visible;
  }


  @Output() close = new EventEmitter<void>();
  @Output() shareConfirmed = new EventEmitter<{
    userIds: number[];
    content?: string;
    postId: number;
  }>();

  searchQuery = '';
  friends: FriendForShare[] = [];    // întreaga listă
  filtered: FriendForShare[] = [];   // filtru după căutare
  selected: FriendForShare[] = [];   // destinatarii selectați
  messageText = '';

  constructor(private friendSvc: FriendshipService) {}

  ngOnInit(): void {
    this.friendSvc.getFriendsForShare().subscribe(list => {
      this.friends  = list;
      this.filtered = list;
    });
  }

  /** Filtrează lista de prieteni local */
  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filtered = q
      ? this.friends.filter(f =>
        f.username.toLowerCase().includes(q)
      )
      : this.friends;
  }

  addRecipient(u: FriendForShare) {
    if (!this.selected.find(s => s.userId === u.userId)) {
      this.selected = [...this.selected, u];
    }
  }

  removeRecipient(u: FriendForShare) {
    this.selected = this.selected.filter(s => s.userId !== u.userId);
  }

  isSelected(userId: number): boolean {
    return this.selected.some(s => s.userId === userId);
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

  private resetDialog(): void {
    this.searchQuery = '';
    this.filtered = this.friends;
    this.selected = [];
    this.messageText = '';
  }

}
