import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { Message } from './message.service';

@Injectable({ providedIn: 'root' })
export class ChatSignalRService {
  private hubConnection!: signalR.HubConnection;

  /** 1) Pornește conexiunea la hub cu tokenul JWT */
  public startConnection(token: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api','')}/hubs/message`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(err => console.error('SignalR connection error:', err));
  }

  /** 2) Ascultă mesajele noi de la server */
  public onReceiveMessage(handler: (msg: Message) => void): void {
    this.hubConnection.on('ReceiveMessage', (msg: Message) => {
      handler(msg);
    });
  }

  /** 3) Închide conexiunea (la destroy) */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error(err));
    }
  }
}
