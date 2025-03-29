import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(
    public authService: AuthService,
    public router: Router,
    private http: HttpClient
  ) { }

  logout() {
    this.authService.logout();
  }

  // This method calls the protected endpoint to fetch users
  getUsers() {
    this.http.get('https://localhost:7091/api/Users').subscribe({
      next: (data) => {
        console.log('Users:', data);
        alert('Users data logged in console');
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        alert('Error fetching users. Check console for details.');
      }
    });
  }
}
