import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() flipped = false;
  @Input() liked = false;
  @Input() showLikeButton = true;
  @Input() showShareButton = true;
  @Input() size: 'forYou' | 'profile' | 'chat' = 'forYou';

  @Output() flip    = new EventEmitter<void>();
  @Output() like    = new EventEmitter<void>();
  @Output() share   = new EventEmitter<void>();
  @Output() report  = new EventEmitter<void>();

  onFlip()   { this.flip.emit(); }
  onLike()   { this.like.emit(); }
  onShare()  { this.share.emit(); }
  onReport(event: MouseEvent) {
    event.stopPropagation();
    this.report.emit();
  }

  ngOnInit() {
  //  console.log('post:', this.post);
  }

}
