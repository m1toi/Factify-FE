import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FriendshipResponse {
  friendshipId: number;
  userId:        number;
  friendId:      number;
  isConfirmed:   boolean;
  createdAt:     string;
}

@Injectable({ providedIn: 'root' })
export class FriendshipService {
  private apiUrl = `${environment.apiUrl}/Friendships`;

  constructor(private http: HttpClient) {}

  // verifică dacă suntem deja prieteni
  check(friendId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${friendId}`);
  }

  // obține toate relațiile mele
  listMine(userId: number): Observable<FriendshipResponse[]> {
    return this.http.get<FriendshipResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  // trimite sau auto-acceptă o cerere
  sendRequest(userId: number, friendId: number): Observable<FriendshipResponse> {
    return this.http.post<FriendshipResponse>(this.apiUrl, { userId, friendId });
  }

  // acceptă o cerere primită
  accept(friendshipId: number): Observable<FriendshipResponse> {
    return this.http.patch<FriendshipResponse>(`${this.apiUrl}/${friendshipId}/accept`, {});
  }

  // șterge o relație (unfriend sau cancel request)
  remove(friendshipId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${friendshipId}`);
  }
}
