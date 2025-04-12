import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Post } from '../../models/post.model';
import { ButtonModule } from 'primeng/button';
import {SidebarComponent} from '../sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  currentPostIndex = 0;
  flipped: boolean[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

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
          this.flipped = new Array(data.length).fill(false);
        },
        error: (err) => {
          console.error('Failed to load feed:', err);
        },
      });
    }
  }

  scrollToPost(index: number): void {
    const container = this.scrollContainer.nativeElement;
    const postElements = container.children;
    if (postElements[index]) {
      postElements[index].scrollIntoView({ behavior: 'smooth' });
    }
  }

  nextPost(): void {
    if (this.currentPostIndex < this.posts.length - 1) {
      this.currentPostIndex++;
      this.scrollToPost(this.currentPostIndex);
    }
  }

  previousPost(): void {
    if (this.currentPostIndex > 0) {
      this.currentPostIndex--;
      this.scrollToPost(this.currentPostIndex);
    }
  }

  toggleFlip(index: number): void {
    this.flipped[index] = !this.flipped[index];
  }
}
