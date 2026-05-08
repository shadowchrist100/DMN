import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepIdentity } from './step-identity';

describe('StepIdentity', () => {
  let component: StepIdentity;
  let fixture: ComponentFixture<StepIdentity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepIdentity],
    }).compileComponents();

    fixture = TestBed.createComponent(StepIdentity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
