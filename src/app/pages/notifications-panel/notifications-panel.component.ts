import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { NotificationService } from '../../services/notification.service';
import { FriendshipService, FriendshipResponse } from '../../services/friendship.service';
import {NotificationSignalRService} from '../../services/notification-signalr.service';
import {AuthService} from '../../services/auth.service';

export interface NotificationDto {
  notificationId: number;
  fromUserId: number;
  fromUsername: string;
  fromUserProfilePicture: string | null; // nou

  toUserId: number;
  type: 'FriendRequest';
  message: string;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string; // ISO
}

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, ButtonDirective],
  templateUrl: './notifications-panel.component.html',
  styleUrls: ['./notifications-panel.component.scss']
})
export class NotificationsPanelComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  notifications: NotificationDto[] = [];

  // În loc de processedMap pur boolean, ținem și „action” (accepted/denied) ca string
  localActionMap: { [notificationId: number]: 'accepted' | 'denied' | null } = {};

  constructor(
    private notificationService: NotificationService,
    private friendshipService: FriendshipService,
    private notificationSignalR: NotificationSignalRService,
    private authService: AuthService

  ) {}

  ngOnInit(): void {
    this.loadNotifications();

    const token = this.authService.getToken();
    if (token) {
      this.notificationSignalR.startConnection(token);
    } else {
      console.warn('No token found: SignalR notificări nu poate porni.');
    }

    this.notificationSignalR.onReceiveNotification((notif: NotificationDto) => {
      this.notifications.unshift(notif);
      this.localActionMap[notif.notificationId] = null;
    });
  }

  ngOnDestroy(): void {
    this.notificationSignalR.stopConnection();
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (list) => {
        this.notifications = list;
        // Inițial, pentru fiecare notificare action=null
        this.notifications.forEach(n => {
          this.localActionMap[n.notificationId] = null;
        });
      },
      error: (err) => {
        console.error('Eroare la încărcarea notificărilor:', err);
      }
    });
  }

  onCloseClicked(): void {
    this.close.emit();
  }

  acceptFriendRequest(notif: NotificationDto): void {
    if (!notif.referenceId) return;

    // 1️⃣ acceptăm cererea de prietenie
    this.friendshipService.accept(notif.referenceId).subscribe({
      next: () => {
        // 2️⃣ marchem notificarea ca citită (backend va exclude la refresh)
        this.notificationService.markAsRead(notif.notificationId).subscribe({
          next: () => {
            // 3️⃣ stocăm local acțiunea → pentru UI ne spune că butoanele nu mai apar
            this.localActionMap[notif.notificationId] = 'accepted';
          },
          error: (err) => console.error('Eroare la markAsRead:', err)
        });
      },
      error: (err) => console.error('Eroare la acceptFriendRequest:', err)
    });
  }

  denyFriendRequest(notif: NotificationDto): void {
    if (!notif.referenceId) return;

    // 1️⃣ ștergem (sau „dez-prieteniem”)
    this.friendshipService.remove(notif.referenceId).subscribe({
      next: () => {
        // 2️⃣ marchem notificarea ca citită
        this.notificationService.markAsRead(notif.notificationId).subscribe({
          next: () => {
            // 3️⃣ stocăm local acțiunea
            this.localActionMap[notif.notificationId] = 'denied';
          },
          error: (err) => console.error('Eroare la markAsRead:', err)
        });
      },
      error: (err) => console.error('Eroare la denyFriendRequest:', err)
    });
  }
}
