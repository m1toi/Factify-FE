import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { PreferenceGuard } from './preference.guard';

describe('preferenceGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => PreferenceGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
