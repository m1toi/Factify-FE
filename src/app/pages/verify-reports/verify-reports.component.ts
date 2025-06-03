// src/app/pages/verify-reports/verify-reports.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button'; // eventual vei folosi butoane PrimeNG
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-reports',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './verify-reports.component.html',
  styleUrls: ['./verify-reports.component.scss'],
})
export class VerifyReportsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
