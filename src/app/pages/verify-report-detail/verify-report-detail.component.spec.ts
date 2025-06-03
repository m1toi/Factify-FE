import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyReportDetailComponent } from './verify-report-detail.component';

describe('VerifyReportDetailComponent', () => {
  let component: VerifyReportDetailComponent;
  let fixture: ComponentFixture<VerifyReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyReportDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
