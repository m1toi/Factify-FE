import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MessageService, Message } from '../../services/message.service';
import { ChatSignalRService } from '../../services/chat-signalr.service';
import { AuthService } from '../../services/auth.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { jwtDecode } from 'jwt-decode';
import {ConversationService, Participant} from '../../services/conversation.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    MessageInputComponent,
    MessageBubbleComponent
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy, AfterViewChecked
{
  @Input() conversationId!: number;

  @ViewChild('messagesContainer', { static: false })
  private messagesContainer!: ElementRef<HTMLElement>;

  messages: Message[] = [];
  currentUserId!: number;
  private jwtToken!: string;
  otherUser?: Participant;

  // pentru paginare
  private earliestMessageId?: number;
  isLoadingBatch = false;

  private scrollSub?: Subscription;
  private scrollToBottomPending = false;

  sendError: string | null = null;
  private isActive = false;

  constructor(
    private msgService: MessageService,
    private signalR: ChatSignalRService,
    private convoService: ConversationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Decode JWT și salvează userId + token o singură dată
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = +decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
      this.jwtToken = token;
    }

    // Pornește conexiunea SignalR o singură dată
   // this.signalR.startConnection(this.jwtToken);
    this.signalR.onReceiveMessage((msg: Message) => {
      if (msg.conversationId === this.conversationId) {
        this.enqueueMessage(msg);
        this.scrollToBottomPending = true;
        if (this.isActive) {
          this.convoService.markAsRead(this.conversationId).subscribe({
            next: () => { /*…*/ },
            error: err => console.error(err)
          });
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottomPending) {
      this.scrollToBottom();
      this.scrollToBottomPending = false;
    }
  }

  ngAfterViewInit() {
    // Abonare la evenimentul de scroll
    this.scrollSub = fromEvent(
      this.messagesContainer.nativeElement,
      'scroll'
    )
      .pipe(
        // fără throttleTime, ca să nu ratăm evenimentele când user-ul ajunge rapid sus
        filter(() => {
          const el = this.messagesContainer.nativeElement;
          return (
            el.scrollTop < 50 &&
            !this.isLoadingBatch &&
            this.earliestMessageId !== undefined
          );
        })
      )
      .subscribe(() => this.loadPreviousBatch());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['conversationId'] && changes['conversationId'].currentValue) {
      this.sendError = null;
      this.isActive = true;
      // 1) aduc interlocutorul
      this.convoService.getParticipants(this.conversationId)
        .subscribe(list => {
          this.otherUser = list.find(p => p.userId !== this.currentUserId);
        });
      // 2) apoi mesaje
      this.loadInitialBatch();

      this.convoService.markAsRead(this.conversationId)
        .subscribe({
          next: () => { /* eventual actualizezi vreun flag local */ },
          error: err => console.error('Mark-as-read error', err)
        });
    }
  }

  ngOnDestroy() {
  //  this.signalR.stopConnection();
    this.isActive = false;
    this.scrollSub?.unsubscribe();
  }

  onSendText(content: string) {
    if (!content.trim()) return;
    this.msgService
      .sendMessage({ conversationId: this.conversationId, content })
      .subscribe({
        next: msg => {
          this.enqueueMessage(msg);
          this.scrollToBottom();
          this.sendError = null;
          this.convoService.markAsRead(this.conversationId).subscribe();
        },
        error: err => {
          if (err.status === 403) {
            this.sendError = err.error || 'You cannot send this message.';
          } else {
            this.sendError = 'A apărut o eroare. Încearcă din nou.';
            console.error(err);
          }
        }
      });
  }

  private loadInitialBatch() {
    this.isLoadingBatch = true;
    this.msgService
      .getMessagesBatch(this.conversationId, undefined, 20)
      .subscribe(batch => {
        this.messages = [];
        batch.forEach(m => this.enqueueMessage(m));
        this.earliestMessageId = batch.length ? batch[0].messageId : undefined;
        this.scrollToBottom();
        this.isLoadingBatch = false;
        this.convoService
          .markAsRead(this.conversationId)
          .subscribe({
            next: () => {/* eventual actualizează ceva în UI */},
            error: err => console.error('Mark-as-read error', err)
          });
      });
  }

  private loadPreviousBatch() {
    if (!this.earliestMessageId) return;
    this.isLoadingBatch = true;
    const el = this.messagesContainer.nativeElement;
    const prevScrollHeight = el.scrollHeight;

    this.msgService
      .getMessagesBatch(this.conversationId, this.earliestMessageId, 20)
      .subscribe(batch => {
        if (!batch.length) {
          this.isLoadingBatch = false;
          return;
        }
        const old = [...this.messages];
        this.messages = [];
        batch.forEach(m => this.enqueueMessage(m));
        old.forEach(m => this.enqueueMessage(m));
        this.earliestMessageId = batch[0].messageId;
        setTimeout(() => {
          const newH = el.scrollHeight;
          el.scrollTop = newH - prevScrollHeight;
          this.isLoadingBatch = false;
          if (el.scrollTop < 50 && this.earliestMessageId) {
            this.loadPreviousBatch();
          }
        });
      });
  }
  private enqueueMessage(msg: Message) {
    // dacă avem şi post, şi text, creăm două intrări
    const hasPost = !!msg.postId;
    const hasText  = !!msg.content?.trim();

    if (hasPost && hasText) {
      // 1) bubble pentru post
      this.messages.push({
        ...msg,
        content: undefined,     // golim textul
        // păstrăm postId/post
      });
      // 2) bubble pentru text
      this.messages.push({
        ...msg,
        postId: undefined,     // golim postarea
        post: null!,
        content: msg.content
      });
    } else {
      // singular: text-only sau post-only
      this.messages.push(msg);
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
