// src/app/components/report-success-dialog/report-success-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-report-success-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './report-success-dialog.component.html',
  styleUrls: ['./report-success-dialog.component.scss']
})
export class ReportSuccessDialogComponent {
  @Input() visible = false;
  @Output() done = new EventEmitter<void>();

  onClose() {
    this.done.emit();
  }
}
