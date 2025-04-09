import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../models/post.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private apiUrl = `${environment.apiUrl}/Feed`;

  constructor(private http: HttpClient) {}

  getPersonalizedFeed(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${userId}`);
  }
}
