import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserSearchResult } from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent {
  @Output() close = new EventEmitter<void>();

  searchQuery: string = '';
  results: UserSearchResult[] = [];

  recentResults: UserSearchResult[] = [];
  maxRecent = 10;

  defaultAvatar = '/assets/avatars/placeholder1.png';

  constructor(private userService: UserService,
              private router: Router
  ) {
    this.loadRecent();
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q.length < 2) {
      this.results = [];
      return;
    }
    this.userService.searchUsers(q).subscribe({
      next: users => this.results = users,
      error: () => this.results = []
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.results = [];
  }

  goToProfile(id: number) {
    this.close.emit();                       // tell the sidebar to collapse
    this.router.navigate(['/profile', id]);  // actually navigate
  }
  selectUser(user: UserSearchResult) {
    this.addToRecent(user);
    this.close.emit();
    this.router.navigate(['/profile', user.userId]);
  }

  private addToRecent(user: UserSearchResult) {
    // scoate dublurile
    this.recentResults = this.recentResults.filter(u => u.userId !== user.userId);
    // pune la început
    this.recentResults.unshift(user);
    // taie la maxRecent
    if (this.recentResults.length > this.maxRecent) {
      this.recentResults.length = this.maxRecent;
    }
    localStorage.setItem('recentSearches', JSON.stringify(this.recentResults));
  }

  removeRecent(user: UserSearchResult, ev: MouseEvent) {
    ev.stopPropagation();
    this.recentResults = this.recentResults.filter(u => u.userId !== user.userId);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentResults));
  }

  private loadRecent() {
    const saved = localStorage.getItem('recentSearches');
    this.recentResults = saved ? JSON.parse(saved) : [];
  }
}
