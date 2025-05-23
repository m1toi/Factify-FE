import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {ConversationListComponent} from '../conversation-list/conversation-list.component';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {ChatWindowComponent} from '../chat-window/chat-window.component';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [SidebarComponent, ConversationListComponent, ChatWindowComponent, CommonModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit {
  selectedConversationId?: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Fie la init, fie la fiecare schimbare de param:
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('conversationId');
      this.selectedConversationId = id ? +id : undefined;
    });
  }
}
