import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PostRequest } from '../models/post-request.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/Posts`;

  constructor(private http: HttpClient) {}

  createPost(data: PostRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
