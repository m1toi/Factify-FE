// src/app/components/report-dialog/report-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ReportService, ReportReason, ReportRequest } from '../../services/report.service';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss']
})
export class ReportDialogComponent {
  @Input() visible = false;
  @Input() postId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  // ❶ Stocăm motivul selectat (sau null dacă nu e nimic selectat)
  selectedReason: ReportReason | null = null;

  // ❷ Array de opțiuni (în ordinea în care apar pe UI)
  reasons = [
    { value: ReportReason.InappropriateContent, label: 'Inappropriate Content' },
    { value: ReportReason.WrongCategory,        label: 'Wrong Category' },
    { value: ReportReason.Spam,                 label: 'Spam' },
    { value: ReportReason.Other,                label: 'Other' }
  ];

  isSubmitting = false;
  errorMsg: string | null = null;

  constructor(private reportService: ReportService) {}

  // ❸ Când dau click pe un motiv, setez selectedReason
  onSelectReason(reason: ReportReason): void {
    if (this.isSubmitting) {
      return; // nu permitem schimbarea în timp ce e în trimitere
    }
    this.selectedReason = reason;
  }

  onCancel(): void {
    this.errorMsg = null;
    this.selectedReason = null;
    this.visible = false;
    this.close.emit();
  }

  onSubmit(): void {
    if (this.selectedReason === null) {
      return; // deși butonul e dezactivat, prevenim orice apel
    }

    this.errorMsg = null;
    this.isSubmitting = true;

    const payload: ReportRequest = {
      postId: this.postId,
      reason: this.selectedReason
    };

    this.reportService.submitReport(payload).subscribe({
      next: () => {
        // după trimitere cu succes:
        this.isSubmitting = false;
        this.visible = false;
        this.selectedReason = null;
        this.submitted.emit();
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMsg = err.error?.error || 'Failed to submit report.';
        console.error('Report error:', err);
      }
    });
  }
}
