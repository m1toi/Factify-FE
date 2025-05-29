// src/app/chat/conversation-list/conversation-list.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '../../services/conversation.service';
import { Conversation } from '../../models/conversation.model';
import { RouterModule, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';
import { ChatSignalRService } from '../../services/chat-signalr.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent implements OnInit {
  @Input() selectedConversationId?: number;
  conversations: Conversation[] = [];
  currentUserId!: number;

  constructor(
    private convService: ConversationService,
    private authService: AuthService,
    private chatSignalR: ChatSignalRService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Ia token + userId
    const token = this.authService.getToken();
    if (!token) return;
    const decoded: any = jwtDecode(token);
    this.currentUserId = +decoded[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];

    // 2) Pornește SignalR
    //this.chatSignalR.startConnection(token);

    // 3) Subscribe la mesajele noi
    this.chatSignalR.onConversationUpdated(update => {
      const idx = this.conversations.findIndex(
        c => c.conversationId === update.conversationId
      );
      if (idx === -1) return;
      const conv = this.conversations[idx];

      // 3a) actualizează text + timestamp
      const oldTs = conv.lastMessageSentAt;
      conv.lastMessage         = update.lastMessage;
      conv.lastMessageSenderId = update.lastMessageSenderId;
      conv.lastMessageSentAt   = update.lastMessageSentAt;

      // 3b) badge-uri
      if (update.lastMessageSenderId !== this.currentUserId) {
        conv.unreadCount = update.unreadCount;
        conv.hasUnread   = update.hasUnread;
      } else {
        conv.unreadCount = 0;
        conv.hasUnread   = false;
      }

      // 3c) mută în vârf doar dacă e mesaj nou
      if (update.lastMessageSentAt !== oldTs) {
        this.conversations.splice(idx, 1);
        this.conversations.unshift(conv);
      }

      this.conversations = [...this.conversations];
    });

    // 4) Subscribe la evenimentul de marcare ca read
    this.chatSignalR.onConversationRead(read => {
      const idx = this.conversations.findIndex(
        c => c.conversationId === read.conversationId
      );
      if (idx === -1) return;
      const conv = this.conversations[idx];

      // **Doar** badge-ul: nu atingem niciodată lastMessage/timestamp
      conv.unreadCount = read.unreadCount;
      conv.hasUnread   = read.hasUnread;

      // nu reordonează aici
      this.conversations = [...this.conversations];
    });

    // 5) Încarcă lista inițială
    this.convService.getMyConversations().subscribe(list => {
      this.conversations = list.sort((a, b) => {
        const tA = a.lastMessageSentAt ?? a.createdAt;
        const tB = b.lastMessageSentAt ?? b.createdAt;
        return new Date(tB).getTime() - new Date(tA).getTime();
      });
    });
  }

  otherParticipant(conv: Conversation) {
    const isUser1 = conv.user1Id === this.currentUserId;
    return {
      id:       isUser1 ? conv.user2Id : conv.user1Id,
      username: isUser1 ? conv.user2Username : conv.user1Username,
      avatar:   isUser1
        ? conv.user2ProfilePicture
        : conv.user1ProfilePicture
    };
  }

  openConversation(conv: Conversation) {
    this.convService.markAsRead(conv.conversationId).subscribe(() => {
      conv.unreadCount = 0;
      conv.hasUnread   = false;
    });
    this.router.navigate(['/chat', conv.conversationId]);
  }
}
