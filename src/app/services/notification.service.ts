import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

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


@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.apiUrl);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }
}
