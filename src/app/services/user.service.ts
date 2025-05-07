// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: number;
  name: string;                // display name
  role: string;
  profilePicture?: string;     // e.g. "avatar2.png"
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
}
