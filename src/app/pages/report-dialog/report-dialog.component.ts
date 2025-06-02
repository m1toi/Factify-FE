// src/app/components/report-dialog/report-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ReportReason, ReportService, ReportRequest } from '../../services/report.service';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss']
})
export class ReportDialogComponent {
  @Input() visible = false;
  @Input() postId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  // Default la primul motiv
  selectedReason: ReportReason = ReportReason.InappropriateContent;

  // Array de opțiuni pentru <select>
  reasons = [
    { value: ReportReason.InappropriateContent, label: 'Inappropriate Content' },
    { value: ReportReason.WrongCategory,        label: 'Wrong Category' },
    { value: ReportReason.Spam,                 label: 'Spam' },
    { value: ReportReason.Other,                label: 'Other' }
  ];

  isSubmitting = false;
  errorMsg: string | null = null;

  constructor(private reportService: ReportService) {}

  onCancel(): void {
    this.errorMsg = null;
    this.visible = false;
    this.close.emit();
  }

  onSubmit(): void {
    this.errorMsg = null;
    this.isSubmitting = true;

    const payload: ReportRequest = {
      postId: this.postId,
      reason: this.selectedReason
    };

    this.reportService.submitReport(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.visible = false;
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
