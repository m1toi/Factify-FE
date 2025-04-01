import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {
  private apiUrl = `${environment.apiUrl}/UserPreference`;

  constructor(private http: HttpClient) {}

  submitPreferences(categoryIds: number[]): Observable<any> {
    return this.http.post(this.apiUrl, { categoryIds });
  }

  hasPreferences(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/has-preferences`);
  }
}
