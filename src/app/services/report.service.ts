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

// DTO‐ul de răspuns pentru un report
export interface ReportResponse {
  reportId: number;
  postId: number;
  reason: ReportReason;
  status: string;
  createdAt: string;
  reporterUserId: number;
  reporterUsername: string;
  // Postul în sine, cu structura PostResponseDto
  post: {
    postId: number;
    question: string;
    answer: string;
    createdAt: string;
    userName: string;
    categoryName: string;
    userId: number;
    likesCount: number;
    sharesCount: number;
  };
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

  /** Primește toate rapoartele (role=Admin) */
  getAllReports(): Observable<ReportResponse[]> {
       return this.http.get<ReportResponse[]>(`${this.apiUrl}/pending`);
  }

  /** Soluționează un report (vom implementa funcționalitatea mai târziu) */
  solveReport(reportId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${reportId}/solve`, {});
  }
}
