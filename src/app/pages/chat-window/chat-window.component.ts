import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef
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
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() conversationId!: number;

  @ViewChild('messagesContainer', { static: false })
  private messagesContainer!: ElementRef<HTMLElement>;

  messages: Message[] = [];
  currentUserId!: number;
  private jwtToken!: string;

  // pentru paginare
  private earliestMessageId?: number;
  isLoadingBatch = false;

  private scrollSub?: Subscription;

  constructor(
    private msgService: MessageService,
    private signalR: ChatSignalRService,
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
    this.signalR.startConnection(this.jwtToken);
    this.signalR.onReceiveMessage((msg: Message) => {
      if (msg.conversationId === this.conversationId) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });
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
    // La fiecare conversatie nouă, încărcăm primul batch
    if (
      changes['conversationId'] &&
      changes['conversationId'].currentValue
    ) {
      this.loadInitialBatch();
    }
  }

  ngOnDestroy() {
    this.signalR.stopConnection();
    this.scrollSub?.unsubscribe();
  }

  onSendText(content: string) {
    if (!content.trim()) return;
    this.msgService
      .sendMessage({ conversationId: this.conversationId, content })
      .subscribe(msg => {
        this.messages.push(msg);
        this.scrollToBottom();
      });
  }

  private loadInitialBatch() {
    this.isLoadingBatch = true;
    this.msgService
      .getMessagesBatch(this.conversationId, undefined, 20)
      .subscribe(batch => {
        this.messages = batch;
        this.earliestMessageId = batch.length
          ? batch[0].messageId
          : undefined;
        this.scrollToBottom();
        this.isLoadingBatch = false;
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
        if (batch.length) {
          // Prepend batch la lista existentă
          this.messages = [...batch, ...this.messages];
          this.earliestMessageId = batch[0].messageId;

          // După ce DOM-ul se actualizează, ajustăm scroll-ul și, dacă mai e nevoie, încărcăm iar
          setTimeout(() => {
            const newScrollHeight = el.scrollHeight;
            el.scrollTop = newScrollHeight - prevScrollHeight;
            this.isLoadingBatch = false;

            // Dacă suntem încă aproape de top, mai încărcăm un batch
            if (el.scrollTop < 50 && this.earliestMessageId) {
              this.loadPreviousBatch();
            }
          });
        } else {
          // Nu mai sunt mesaje vechi
          this.isLoadingBatch = false;
        }
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
