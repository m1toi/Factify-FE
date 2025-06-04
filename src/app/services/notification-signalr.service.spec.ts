import { TestBed } from '@angular/core/testing';

import { NotificationSignalrService } from './notification-signalr.service';

describe('NotificationSignalrService', () => {
  let service: NotificationSignalrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationSignalrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
