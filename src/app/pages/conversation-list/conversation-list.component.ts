// src/app/chat/conversation-list/conversation-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '../../services/conversation.service';
import { Conversation } from '../../models/conversation.model';
import { RouterModule, Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent implements OnInit {
  conversations: Conversation[] = [];
  currentUserId!: number;

  constructor(
    private convService: ConversationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Aflăm ID-ul curent (poți lua dintr-un AuthService)
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = +decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
    }
    // 2) Chemăm API-ul
    this.convService.getMyConversations().subscribe(list => {
      // 3) Sortăm după createdAt descrescător
      this.conversations = list.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }

  /** Returnează username-ul și ID-ul „celuilalt” */
  otherParticipant(conv: Conversation) {
    const isUser1 = conv.user1Id === this.currentUserId;
    return {
      id:      isUser1 ? conv.user2Id   : conv.user1Id,
      username:isUser1 ? conv.user2Username : conv.user1Username,
      avatar:  isUser1 ? conv.user2ProfilePicture : conv.user1ProfilePicture
    };
  }


  openConversation(conv: Conversation) {
    this.router.navigate(['/chat', conv.conversationId]);
  }
}
