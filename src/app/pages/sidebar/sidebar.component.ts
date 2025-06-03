import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { UserSearchComponent } from '../user-search/user-search.component';
import {NotificationsPanelComponent} from '../notifications-panel/notifications-panel.component';
import {AuthService} from '../../services/auth.service';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonDirective, UserSearchComponent, NotificationsPanelComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isSearchOpen = false;
  isNotificationsOpen = false;

  // stocăm intern valoarea defaultCollapsed
  private _defaultCollapsed = false;
  isAdmin = false;

  // setter care se execută înainte de primul render
  @Input()
  set defaultCollapsed(value: boolean) {
    this._defaultCollapsed = value;
    this.isCollapsed = value;
  }
  get defaultCollapsed(): boolean {
    return this._defaultCollapsed;
  }

  // inițializăm imediat cu valoarea defaultCollapsed
  isCollapsed = this._defaultCollapsed;

  constructor(private router: Router, private authService: AuthService) {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Observație: token-ul folosește namespaces microsoft/ws/2008/06
        const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        this.isAdmin = roleClaim === 'Admin';
      } catch {
        this.isAdmin = false;
      }
    }
  }

  goToForYou(): void {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate(['/home']));
  }

  goToCreatePost(): void {
    this.router.navigate(['/create-post']);
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    // collapsed dacă e deschis search sau dacă defaultCollapsed e true
    this.isCollapsed = this.isSearchOpen || this.defaultCollapsed;
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }
  goToAdminVerify(): void {
    // ③ când apasă butonul admin, navighează către verify-reports
    this.router.navigate(['/verify-reports']);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isCollapsed = this.isSearchOpen || this.isNotificationsOpen || this.defaultCollapsed;
    // dacă încercăm să deschidem notifications, închidem search (nu pot fi ambele deschise simultan)
    if (this.isNotificationsOpen && this.isSearchOpen) {
      this.isSearchOpen = false;
    }
  }

  onNotificationsClose(): void {
    this.isNotificationsOpen = false;
    // după închidere, determinăm dacă rămâne collapsed
    this.isCollapsed = this.isSearchOpen || this.defaultCollapsed;
  }
}
