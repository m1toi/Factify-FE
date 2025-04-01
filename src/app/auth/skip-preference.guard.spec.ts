import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { skipPreferenceGuard } from './skip-preference.guard';

describe('skipPreferenceGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => skipPreferenceGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
