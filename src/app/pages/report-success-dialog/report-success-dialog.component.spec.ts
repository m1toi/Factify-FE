import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSuccessDialogComponent } from './report-success-dialog.component';

describe('ReportSuccessDialogComponent', () => {
  let component: ReportSuccessDialogComponent;
  let fixture: ComponentFixture<ReportSuccessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSuccessDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
