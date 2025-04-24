import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  markAsSeen(postId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}/interaction/seen`, {});
  }
  likePost(postId: number, isLiked: boolean): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}/interaction/like`, { liked: isLiked });
  }
  sharePost(postId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}/interaction/share`, {});
  }
}
