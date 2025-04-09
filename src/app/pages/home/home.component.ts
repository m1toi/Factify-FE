import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../services/feed.service';
import { Post } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports:[CommonModule,FormsModule],
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  userId!: number;
  isLoading = true;

  constructor(private feedService: FeedService, private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userId = parseInt(decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
      this.loadFeed();
    }
  }

  loadFeed() {
    this.isLoading = true;
    this.feedService.getPersonalizedFeed(this.userId).subscribe({
      next: (data) => {
        this.posts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load feed:', err);
        this.isLoading = false;
      }
    });
  }

  onLike(post: Post) {
    // later we’ll wire this up to the interaction endpoint
    console.log('Liked:', post.postId);
  }

  onShare(post: Post) {
    console.log('Shared:', post.postId);
  }
}
