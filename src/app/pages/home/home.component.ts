import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Post } from '../../models/post.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  currentPostIndex = 0;

  constructor(
    private feedService: FeedService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      const userId = parseInt(
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ]
      );

      this.feedService.getPersonalizedFeed(userId).subscribe({
        next: (data) => {
          this.posts = data;
        },
        error: (err) => {
          console.error('Failed to load feed:', err);
        },
      });
    }
  }

  nextPost(): void {
    if (this.currentPostIndex < this.posts.length - 1) {
      this.currentPostIndex++;
    }
  }

  previousPost(): void {
    if (this.currentPostIndex > 0) {
      this.currentPostIndex--;
    }
  }
}
