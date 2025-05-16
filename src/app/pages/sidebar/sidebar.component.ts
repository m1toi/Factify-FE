import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {ButtonDirective} from 'primeng/button';
import {UserSearchComponent} from '../user-search/user-search.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonDirective, UserSearchComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isSearchOpen: boolean = false;
  constructor(private router: Router) {}

  goToForYou() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/home']);
    });
  }

  goToCreatePost(){
    this.router.navigate(['/create-post']);
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }
}
