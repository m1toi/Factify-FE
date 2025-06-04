// src/app/services/notification-signalr.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { NotificationDto } from '../pages/notifications-panel/notifications-panel.component';

@Injectable({ providedIn: 'root' })
export class NotificationSignalRService {
  private hubConnection!: signalR.HubConnection;

  /** 1) Pornește conexiunea la hub‐ul de notificări cu tokenul JWT */
  public startConnection(token: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        // environment.apiUrl e, de obicei, ceva de genul "https://localhost:5001/api"
        // Scoatem "/api" și punem "/hubs/notifications"
        `${environment.apiUrl.replace('/api', '')}/hubs/notifications`,
        {
          accessTokenFactory: () => token
        }
      )
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('NotificationHub connected'))
      .catch(err => console.error('NotificationHub connection error:', err));
  }

  /** 2) Ascultă evenimentul ReceiveNotification trimis de server */
  public onReceiveNotification(handler: (notif: NotificationDto) => void): void {
    this.hubConnection.on('ReceiveNotification', (dto: NotificationDto) => {
      handler(dto);
    });
  }

  /** 3) Închide conexiunea (de exemplu în ngOnDestroy) */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error(err));
    }
  }
}
