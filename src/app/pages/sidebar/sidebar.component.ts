import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { UserSearchComponent } from '../user-search/user-search.component';
import {NotificationsPanelComponent} from '../notifications-panel/notifications-panel.component';
import {AuthService} from '../../services/auth.service';
import {jwtDecode} from 'jwt-decode';
import { UserService, UserResponse } from '../../services/user.service';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonDirective, UserSearchComponent, NotificationsPanelComponent,
    ConfirmDialogModule,   ],
  providers: [
    ConfirmationService
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{
  currentUserId!: number;
  profilePicture?: string | null = null;
  defaultAvatar = '/assets/avatars/placeholder1.png';

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

  constructor(private router: Router,
              private authService: AuthService,
              private userService: UserService,
              private confirmationService: ConfirmationService
              ) {
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

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      // 1) decodezi ID-ul curent
      const decoded: any = jwtDecode(token);
      this.currentUserId = +decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];

      // 2) ceri user-ul de pe server
      this.userService.getById(this.currentUserId)
        .subscribe({
          next: (u: UserResponse) => {
            this.profilePicture = u.profilePicture;
            // opțional, și rolul admin
            const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            this.isAdmin = roleClaim === 'Admin';
          },
          error: () => {
            // fallback la avatar default
            this.profilePicture = null;
          }
        });
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
  goToProfile(): void {
    this.router.navigate(['/profile', this.currentUserId]);
  }
  logout(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to log out?',
      accept: () => {
        // doar după confirm
        this.authService.logout();
      },
      reject: () => {
        // nu faci nimic la reject
      }
    });
  }
}
