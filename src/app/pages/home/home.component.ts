// src/app/pages/home/home.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Post } from '../../models/post.model';
import { ButtonModule } from 'primeng/button';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { InteractionService } from '../../services/interaction.service';
import { PostCardComponent } from '../post-card/post-card.component';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';
import { ConversationService } from '../../services/conversation.service';
import { MessageService } from '../../services/message.service';
import { Conversation } from '../../models/conversation.model';
import { ReportDialogComponent } from '../report-dialog/report-dialog.component';
import { ReportSuccessDialogComponent } from '../report-success-dialog/report-success-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    SidebarComponent,
    PostCardComponent,
    ShareDialogComponent,
    ReportDialogComponent,
    ReportSuccessDialogComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  posts: Post[] = [];
  currentPostIndex = 0;
  flipped: boolean[] = [];
  likedPosts: boolean[] = [];
  loadingMore = false;
  public defaultAvatar = 'assets/avatars/placeholder1.png';
  toastVisible = false;
  notInterestedToastVisible = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private userId!: number;

  shareDialogVisible = false;
  sharePostId!: number;
  myConversations: Conversation[] = [];

  reportDialogVisible = false;
  reportingPostId!: number;
  successDialogVisible = false;

  constructor(
    private feedService: FeedService,
    private authService: AuthService,
    private interactionService: InteractionService,
    private router: Router,
    private convService: ConversationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = parseInt(
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      );

      this.loadInitialPosts();
      this.convService.getMyConversations().subscribe((convs) => {
        this.myConversations = convs;
      });
    }
  }

  loadInitialPosts(): void {
    this.feedService.getPersonalizedFeed(this.userId).subscribe({
      next: (data) => {
        this.posts = data;
        this.flipped = new Array(data.length).fill(false);
        this.likedPosts = new Array(data.length).fill(false);

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

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement as HTMLElement;

    container.addEventListener('scroll', () => {
      this.detectCurrentPost();

      this.checkScrollBottom();
    });
  }


  detectCurrentPost(): void {
    const container = this.scrollContainer.nativeElement as HTMLElement;
    const children = Array.from(container.children) as HTMLElement[];
    const viewportMiddle = window.innerHeight / 2;

    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
        if (this.currentPostIndex !== i) {
          this.currentPostIndex = i;
          this.interactionService
            .markAsSeen(this.posts[i].postId)
            .subscribe({
              error: (err) => console.error('Failed to mark as seen:', err),
            });
        }
        break;
      }
    }
  }

  checkScrollBottom(): void {
    const container = this.scrollContainer.nativeElement as HTMLElement;
    const threshold = 50; // pixeli înainte de baza reală
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;

    if (position >= height - threshold && !this.loadingMore) {
      this.loadMorePosts();
    }
  }

  loadMorePosts(callback?: () => void): void {
    this.loadingMore = true;
    this.feedService.getPersonalizedFeed(this.userId).subscribe({
      next: (newPosts) => {
        const freshPosts = newPosts.filter(
          (p) => !this.posts.some((existing) => existing.postId === p.postId)
        );
        this.posts = [...this.posts, ...freshPosts];
        this.flipped.push(...new Array(freshPosts.length).fill(false));
        this.likedPosts.push(...new Array(freshPosts.length).fill(false));

        this.loadingMore = false;
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        console.error('Failed to load more posts:', err);
        this.loadingMore = false;
      },
    });
  }

  toggleLike(index: number): void {
    const post = this.posts[index];
    const isCurrentlyLiked = this.likedPosts[index];
    const newLikeStatus = !isCurrentlyLiked;

    this.interactionService.likePost(post.postId, newLikeStatus).subscribe({
      next: () => {
        this.likedPosts[index] = newLikeStatus;
        if (newLikeStatus) {
          post.likesCount++;
        } else {
          post.likesCount = Math.max(0, post.likesCount - 1);
        }
      },
      error: (err) => console.error('Failed to like/unlike post:', err),
    });
  }

  sharePost(index: number): void {
    const post = this.posts[index];
    this.interactionService.sharePost(post.postId).subscribe({
      next: () => {
        console.log('Post shared successfully');
        post.sharesCount++;
      },
      error: (err) => console.error('Failed to share post:', err),
    });
    this.sharePostId = post.postId;
    this.shareDialogVisible = true;
  }

  onShareConfirmed(payload: {
    userIds: number[];
    content?: string;
    postId: number;
  }) {
    this.shareDialogVisible = false;
    for (const userId of payload.userIds) {
      const conv = this.myConversations.find(
        (c) => c.user1Id === userId || c.user2Id === userId
      );
      if (conv) {
        this.messageService
          .sendMessage({
            conversationId: conv.conversationId,
            postId: payload.postId,
            content: payload.content,
          })
          .subscribe(() => {
            this.showToast();
            console.log(
              `Shared post ${payload.postId} in conv ${conv.conversationId}`
            );
          });
      } else {
        console.error('Nu am găsit conversație cu userId', userId);
      }
    }
  }

  showToast() {
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 2500);
  }

  private showNotInterestedToast(): void {
    this.notInterestedToastVisible = true;
    setTimeout(() => {
      this.notInterestedToastVisible = false;
    }, 2500);
  }

  scrollToPost(index: number): void {
    const container = this.scrollContainer.nativeElement as HTMLElement;
    const postElements = container.children;
    if (postElements[index]) {
      postElements[index].scrollIntoView({ behavior: 'smooth' });
    }
    const seenPost = this.posts[index];
    if (seenPost) {
      this.interactionService.markAsSeen(seenPost.postId).subscribe({
        error: (err) => console.error('Failed to mark post as seen', err),
      });
    }
  }

  nextPost(): void {
    if (this.currentPostIndex < this.posts.length - 1) {
      this.currentPostIndex++;
      this.scrollToPost(this.currentPostIndex);
    } else {
      this.loadMorePosts(() => {
        this.currentPostIndex++;
        setTimeout(() => this.scrollToPost(this.currentPostIndex), 0);
      });
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

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  openReportDialog(index: number): void {
    this.reportingPostId = this.posts[index].postId;
    this.reportDialogVisible = true;
  }

  onReportSubmitted(): void {
    this.posts = this.posts.filter(
      (p) => p.postId !== this.reportingPostId
    );
    this.reportDialogVisible = false;
    this.successDialogVisible = true;
  }

  onReportCancel(): void {
    this.reportDialogVisible = false;
  }

  onSuccessDone(): void {
    this.successDialogVisible = false;
  }
  onNotInterested(index: number): void {
    const post = this.posts[index];
    this.interactionService.markNotInterested(post.postId).subscribe({
      next: () => {
        // Eliminăm postarea imediat din feed
        this.posts.splice(index, 1);
        this.flipped.splice(index, 1);
        this.likedPosts.splice(index, 1);
        this.showNotInterestedToast();
      },
      error: (err) => console.error('Failed to mark not interested:', err)
    });
  }
}
