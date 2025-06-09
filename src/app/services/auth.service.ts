import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {ChatSignalRService} from './chat-signalr.service';
import {NotificationSignalRService} from './notification-signalr.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient,
              private router: Router,
              private chatSignalR: ChatSignalRService,
              private notificationSignalR: NotificationSignalRService
  ) {}

  login(data: LoginRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/Users/login`, data, { responseType: 'text' });
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Users/register`, data);
  }

  saveToken(token: string) {
    sessionStorage.setItem('token', token);
    this.chatSignalR.startConnection(token);
    this.notificationSignalR.startConnection(token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }
}
