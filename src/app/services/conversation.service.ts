// src/app/services/conversation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';
import { environment } from '../../environments/environment';

export interface Participant {
  userId: number;
  username: string;
  profilePicture?: string;
}

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private apiUrl = `${environment.apiUrl}/Conversations`;

  constructor(private http: HttpClient) {}

  /** Aduce toate conversațiile curentului */
  getMyConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/mine`);
  }

  markAsRead(conversationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${conversationId}/mark-read`, {});
  }

  getParticipants(conversationId: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(
      `${this.apiUrl}/${conversationId}/participants`
    );
  }
}
