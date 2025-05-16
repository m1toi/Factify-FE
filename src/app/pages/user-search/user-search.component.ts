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

  constructor(private userService: UserService,
              private router: Router
  ) {}

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
}
