import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyReportsComponent } from './verify-reports.component';

describe('VerifyReportsComponent', () => {
  let component: VerifyReportsComponent;
  let fixture: ComponentFixture<VerifyReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
