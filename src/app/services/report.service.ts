// src/app/services/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum ReportReason {
  InappropriateContent = 0,
  WrongCategory = 1,
  Spam = 2,
  Other = 3
}

export interface ReportRequest {
  postId: number;
  reason: ReportReason;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  /** Trimite un report la backend */
  submitReport(request: ReportRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
