import {
  Component,
  OnInit,
  ViewChild,
  ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Post } from '../../models/post.model';
import { ButtonModule } from 'primeng/button';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {InteractionService} from '../../services/interaction.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  posts: Post[] = [];
  currentPostIndex = 0;
  flipped: boolean[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private feedService: FeedService,
    private authService: AuthService,
    private interactionService: InteractionService,
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

          if (this.posts.length > 0) {
            const firstPostId = this.posts[0].postId;
            this.interactionService.markAsSeen(firstPostId).subscribe();
          }
        },
        error: (err) => {
          console.error('Failed to load feed:', err);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement;

    container.addEventListener('scroll', () => {
      this.detectCurrentPost();
    });
  }

  detectCurrentPost(): void {
    const container = this.scrollContainer.nativeElement;
    const postElements = Array.from(container.children) as HTMLElement[];

    for (let i = 0; i < postElements.length; i++) {
      const rect = postElements[i].getBoundingClientRect();
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (inView && i !== this.currentPostIndex) {
        this.currentPostIndex = i;
        this.interactionService.markAsSeen(this.posts[i].postId).subscribe();
        break;
      }
    }
  }


  scrollToPost(index: number): void {
    const container = this.scrollContainer.nativeElement;
    const postElements = container.children;
    if (postElements[index]) {
      postElements[index].scrollIntoView({ behavior: 'smooth' });
    }
    const seenPost = this.posts[index];
    if (seenPost) {
      this.interactionService.markAsSeen(seenPost.postId).subscribe({
        error: err => console.error('Failed to mark post as seen', err)
      });
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
