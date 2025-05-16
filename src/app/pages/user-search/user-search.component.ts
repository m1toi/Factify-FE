import { Component } from '@angular/core';
import { UserService, UserSearchResult } from '../../services/user.service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

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
  searchQuery: string = '';
  results: UserSearchResult[] = [];

  constructor(private userService: UserService) {}

  onSearch(): void {
    const trimmed = this.searchQuery.trim();
    if (trimmed.length < 2) {
      this.results = [];
      return;
    }

    this.userService.searchUsers(trimmed).subscribe({
      next: (users) => this.results = users,
      error: (err) => {
        console.error('Search failed', err);
        this.results = [];
      }
    });
  }
}
