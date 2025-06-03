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

// DTO‐ul pe care îl primim de la GET /api/Reports/{id}
export interface ReportResponse {
  reportId: number;
  reason: ReportReason;
  reporterUserId: number;
  reporterUsername: string;
  reporterProfilePicture?: string;
  post: {
    postId: number;
    categoryName: string;
    question: string;
    answer: string;
    createdAt: string;         // ISO string
    userName: string;          // autorul postării
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

  /** Trimite un raport noi */
  submitReport(request: ReportRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  /** Ia toate rapoartele în așteptare (already există metoda getPendingReports în lista de rapoarte) */
  fetchPendingReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/pending`);
  }

  /** Ia un raport după ID */
  fetchReportById(reportId: number): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/${reportId}`);
  }

  /** Rezolvă raportul:
   *  PATCH /api/Reports/{id}/solve?deletePost={boolean}
   */
  solveReport(reportId: number, deletePost: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${reportId}/solve`, null, {
      params: { deletePost: deletePost.toString() }
    });
  }
}
