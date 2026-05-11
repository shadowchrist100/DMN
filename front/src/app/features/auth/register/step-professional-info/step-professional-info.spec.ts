import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepProfessionalInfo } from './step-professional-info';

describe('StepProfessionalInfo', () => {
  let component: StepProfessionalInfo;
  let fixture: ComponentFixture<StepProfessionalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepProfessionalInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(StepProfessionalInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
