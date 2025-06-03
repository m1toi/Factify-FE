// src/app/pages/verify-reports/verify-report-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PostCardComponent } from '../post-card/post-card.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ReportService, ReportResponse, ReportReason } from '../../services/report.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-verify-report-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CheckboxModule,
    SidebarComponent,
    PostCardComponent,
    ButtonModule,
    CheckboxModule
  ],
  templateUrl: './verify-report-detail.component.html',
  styleUrls: ['../verify-reports/verify-reports.component.scss']
})
export class VerifyReportDetailComponent implements OnInit {
  reportId!: number;
  report?: ReportResponse;
  loading: boolean = false;
  errorMessage: string = '';
  flipped: boolean = false;
  deletePost: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Preluăm ID‐ul din URL
    this.reportId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.reportId) {
      this.errorMessage = 'Invalid Report ID';
      return;
    }
    this.fetchReportDetails();
  }

  fetchReportDetails(): void {
    this.loading = true;
    this.reportService.fetchReportById(this.reportId).subscribe({
      next: (resp) => {
        this.report = resp;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load report details:', err);
        this.errorMessage = 'Could not load this report.';
        this.loading = false;
      }
    });
  }

  toggleFlip(): void {
    this.flipped = !this.flipped;
  }

  /** Apelează PATCH /api/Reports/{id}/solve */
  solveReport(): void {
    if (!this.report) return;

    this.reportService.solveReport(this.reportId, this.deletePost).subscribe({
      next: () => {
        // După rezolvare, redirecționăm înapoi la lista de rapoarte
        this.router.navigate(['/verify-reports']);
      },
      error: (err) => {
        console.error('Error solving report:', err);
        this.errorMessage = 'Failed to solve report.';
      }
    });
  }

  /** Arată textul motivului, din enum */
  reasonText(reason: ReportReason): string {
    switch (reason) {
      case ReportReason.InappropriateContent:
        return 'Inappropriate Content';
      case ReportReason.WrongCategory:
        return 'Wrong Category';
      case ReportReason.Spam:
        return 'Spam';
      case ReportReason.Other:
        return 'Other';
      default:
        return '';
    }
  }
}
