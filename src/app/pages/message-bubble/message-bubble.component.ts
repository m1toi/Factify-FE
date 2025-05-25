import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../services/message.service';
import {PostCardComponent} from '../post-card/post-card.component';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.scss']
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() isMine = false;

  flipped = false;
}
