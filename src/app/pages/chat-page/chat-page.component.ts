import { Component } from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {ConversationListComponent} from '../conversation-list/conversation-list.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [SidebarComponent, ConversationListComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent {}
