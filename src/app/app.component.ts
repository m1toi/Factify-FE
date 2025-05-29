import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {AuthService} from './services/auth.service';
import {ChatSignalRService} from './services/chat-signalr.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private chatSignalR: ChatSignalRService
  ) {}
  title = 'SocialMediaApp-UI';

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      this.chatSignalR.startConnection(token);
    }
  }
}
