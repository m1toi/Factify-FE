import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// model TS (reflectă MessageResponseDto)
export interface Message {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  senderProfilePicture: string;
  content?: string;
  postId?: number;
  post?: any;            // pentru text-only, îl lăsăm ’any’
  sentAt: string;
}

export interface MessageRequest {
  conversationId: number;
  content?: string;
  postId?: number;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = `${environment.apiUrl}/Messages`;

  constructor(private http: HttpClient) {}

  /** 1) Aduce istoricul de mesaje */
  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/conversation/${conversationId}`
    );
  }

  getMessagesBatch(
    conversationId: number,
    beforeMessageId?: number,
    limit: number = 10
  ): Observable<Message[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (beforeMessageId != null) {
      params = params.set('beforeMessageId', beforeMessageId.toString());
    }
    return this.http
      .get<Message[]>(
        `${this.apiUrl}/conversation/${conversationId}`,
        { params }
      )
      .pipe(
        // serverul returnează mesajele în ordine cronologică,
        // dar dacă vreați să le inversați aici, o puteți face
        // map(arr => arr)
      );
  }

  /** 2) Trimite mesaj text sau post share-uit */
  sendMessage(dto: MessageRequest): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, dto);
  }
}
