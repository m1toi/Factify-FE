// src/app/auth/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const token = this.authService.getToken();
    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    try {
      const decoded: any = jwtDecode(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (role === 'Admin') {
        return true;
      } else {
        return this.router.createUrlTree(['/home']);
      }
    } catch (e) {
      return this.router.createUrlTree(['/login']);
    }
  }
}
