// src/app/pages/verify-reports/verify-reports.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PostCardComponent } from '../post-card/post-card.component';
import { ButtonModule } from 'primeng/button';
import {
  ReportService,
  ReportResponse,
  ReportReason,
} from '../../services/report.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-reports',
  standalone: true,
  imports: [CommonModule, SidebarComponent, PostCardComponent, ButtonModule],
  templateUrl: './verify-reports.component.html',
  styleUrls: ['./verify-reports.component.scss'],
})
export class VerifyReportsComponent implements OnInit {
  reports: ReportResponse[] = [];
  loading = false;

  // Pentru a afișa textul motivului în loc de enum numeric
  private reasonLabels = new Map<ReportReason, string>([
    [ReportReason.InappropriateContent, 'Inappropriate Content'],
    [ReportReason.WrongCategory, 'Wrong Category'],
    [ReportReason.Spam, 'Spam'],
    [ReportReason.Other, 'Other'],
  ]);

  constructor(
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchReports();
  }

  private fetchReports(): void {
    this.loading = true;
    this.reportService
      .getAllReports()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.reports = data;
        },
        error: (err) => {
          console.error('Failed to load reports', err);
          // Poți adăuga un mesaj de eroare aici dacă dorești
        },
      });
  }

  reasonText(reason: ReportReason): string {
    return this.reasonLabels.get(reason) ?? 'Unknown';
  }

  onSolve(reportId: number): void {
    // Deocamdată, doar trimitem PATCH-ul și eventual eliminăm entry-ul din listă
    this.reportService.solveReport(reportId).subscribe({
      next: () => {
        // După ce s‐a soluționat, scoatem reportul din listă
        this.reports = this.reports.filter((r) => r.reportId !== reportId);
      },
      error: (err) => {
        console.error('Error solving report', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
