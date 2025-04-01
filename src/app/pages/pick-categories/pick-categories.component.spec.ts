import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickCategoriesComponent } from './pick-categories.component';

describe('PickCategoriesComponent', () => {
  let component: PickCategoriesComponent;
  let fixture: ComponentFixture<PickCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
