import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, Message } from '../../services/message.service';
import { ChatSignalRService } from '../../services/chat-signalr.service';
import { AuthService } from '../../services/auth.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import {jwtDecode} from 'jwt-decode';

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
export class ChatWindowComponent implements OnInit, OnDestroy, OnChanges {
  @Input() conversationId!: number;
  messages: Message[] = [];
  currentUserId!: number;
  private jwtToken!: string;

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
      this.currentUserId = +decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      this.jwtToken = token;
    }

    // Pornește conexiunea SignalR o singură dată
    this.signalR.startConnection(this.jwtToken);
    this.signalR.onReceiveMessage((msg: Message) => {
      // Adaugă doar dacă e din conversația curentă
      if (msg.conversationId === this.conversationId) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Dacă conversationId s-a schimbat, reîncarcă istoricul
    if (changes['conversationId'] && changes['conversationId'].currentValue) {
      this.loadHistory();
    }
  }

  ngOnDestroy() {
    // Opresc SignalR când componenta e distrusă
    this.signalR.stopConnection();
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

  private loadHistory() {
    // Golește lista curentă și reîncarcă
    this.messages = [];
    this.msgService.getMessages(this.conversationId).subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
}
