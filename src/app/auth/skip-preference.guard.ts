import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserPreferenceService } from '../services/user-preference.service';
import { map, catchError, of } from 'rxjs';

export const SkipIfHasPreferencesGuard: CanActivateFn = () => {
  const router = inject(Router);
  const preferenceService = inject(UserPreferenceService);

  return preferenceService.hasPreferences().pipe(
    map((hasPrefs) => {
      if (hasPrefs) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      return of(true); // Allow access if check fails, fallback
    })
  );
};
