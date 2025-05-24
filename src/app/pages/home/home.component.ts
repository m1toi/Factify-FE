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
import {Router, RouterModule} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Post } from '../../models/post.model';
import { ButtonModule } from 'primeng/button';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { InteractionService } from '../../services/interaction.service';
import{ PostCardComponent } from '../post-card/post-card.component';
import {ShareDialogComponent} from '../share-dialog/share-dialog.component';
import {ConversationService} from '../../services/conversation.service';
import {MessageService} from '../../services/message.service';
import {Conversation} from '../../models/conversation.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    ButtonModule,
    SidebarComponent ,
    PostCardComponent,
    ShareDialogComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  posts: Post[] = [];
  currentPostIndex = 0;
  flipped: boolean[] = [];
  likedPosts: boolean[] = [];
  loadingMore = false;   // 🔥 NEW: to avoid double loading
  public defaultAvatar = 'assets/avatars/placeholder1.png';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private userId!: number; // 🔥 NEW: Store userId so we don't decode token every time

  shareDialogVisible = false;
  sharePostId!: number; // 🔥 NEW: Store the post ID to share
  myConversations: Conversation[] = [];

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
      this.userId = parseInt(decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ]);

      this.loadInitialPosts();
      this.convService.getMyConversations().subscribe(convs => {
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
    const container = this.scrollContainer.nativeElement;

    container.addEventListener('scroll', () => {
      this.detectCurrentPost();
    });
  }

  detectCurrentPost(): void {
    const container = this.scrollContainer.nativeElement;
    const children  = Array.from(container.children) as HTMLElement[];
    const viewportMiddle = window.innerHeight / 2;

    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();

      if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
        if (this.currentPostIndex !== i) {
          this.currentPostIndex = i;
          this.interactionService
            .markAsSeen(this.posts[i].postId)
            .subscribe();
        }
        break;
      }
    }
  }


  loadMorePosts(callback?: () => void): void {
    this.loadingMore = true;
    this.feedService.getPersonalizedFeed(this.userId).subscribe({
      next: (newPosts) => {
        const freshPosts = newPosts.filter(p => !this.posts.some(existing => existing.postId === p.postId));
        this.posts = [...this.posts, ...freshPosts];
        this.flipped.push(...new Array(freshPosts.length).fill(false));
        this.likedPosts.push(...new Array(freshPosts.length).fill(false));
        this.loadingMore = false;

        if (callback) {
          callback();  // 🔥 Scroll to newly loaded post after DOM updates
        }
      },
      error: (err) => {
        console.error('Failed to load more posts:', err);
        this.loadingMore = false;
      }
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
          post.likesCount++; // like adăugat
        } else {
          post.likesCount = Math.max(0, post.likesCount - 1); // like scăzut
        }
      },
      error: err => console.error('Failed to like/unlike post:', err)
    });
  }

  sharePost(index: number): void {
    const post = this.posts[index];
    this.interactionService.sharePost(post.postId).subscribe({
      next: () => {
        console.log('Post shared successfully');
        post.sharesCount++;
      },
      error: err => console.error('Failed to share post:', err)
    });
    this.sharePostId = post.postId;
    this.shareDialogVisible = true;
  }

  onShareConfirmed(payload: {
    userIds: number[]; content?: string; postId: number;
      }) {
        this.shareDialogVisible = false;
        for (const userId of payload.userIds) {
            // găsește conversația unu-la-unu deja creată
          const conv = this.myConversations.find(c =>
                c.user1Id === userId || c.user2Id === userId
              );
            if (conv) {
        this.messageService.sendMessage({
          conversationId: conv.conversationId,
          postId: payload.postId,
          content: payload.content
               }).subscribe(() => {
                   console.log(`Shared post ${payload.postId} in conv ${conv.conversationId}`);
                  });
              } else {
              console.error('Nu am găsit conversație cu userId', userId);
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
    } else {
      console.log('Reached the last post, trying to load more...');
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

}
