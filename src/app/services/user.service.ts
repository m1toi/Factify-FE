import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {Post} from '../models/post.model';

export interface UserResponse {
  id: number;
  name: string;                // display name
  role: string;
  profilePicture?: string;     // e.g. "avatar2.png"
}

export interface UserSearchResult {
  userId: number;
  username: string;
  profilePicture?: string;
}

export interface UpdateUserDto {
  name: string;
  profilePicture?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) {}

  getCurrent(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/current`);
  }

  getById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  update(id: number, payload: UpdateUserDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  updateProfile(payload: UpdateUserDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profile`, payload);
  }

  getPostsByUser(userId: number, page: number, pageSize: number): Observable<Post[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<Post[]>(`${this.apiUrl}/${userId}/posts`, { params });
  }

  searchUsers(query: string): Observable<UserSearchResult[]> {
    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('query', query)
    });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      { token, newPassword }
    );
  }
}
