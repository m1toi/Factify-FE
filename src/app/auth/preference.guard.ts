import { Injectable } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { inject } from '@angular/core';
import { UserPreferenceService } from '../services/user-preference.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const PreferenceGuard: CanActivateFn = () => {
  const router = inject(Router);
  const preferenceService = inject(UserPreferenceService);

  return preferenceService.hasPreferences().pipe(
    map(hasPrefs => {
      if (hasPrefs) {
        return true;
      } else {
        router.navigate(['/pick-interests']);
        return false;
      }
    }),
    catchError(() => {
      // If error occurs (e.g. user not logged in), block access
      router.navigate(['/login']);
      return of(false);
    })
  );
};
