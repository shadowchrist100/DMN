import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepAuth } from './step-auth';

describe('StepAuth', () => {
  let component: StepAuth;
  let fixture: ComponentFixture<StepAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepAuth],
    }).compileComponents();

    fixture = TestBed.createComponent(StepAuth);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
