import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepEmergencyContact } from './step-emergency-contact';

describe('StepEmergencyContact', () => {
  let component: StepEmergencyContact;
  let fixture: ComponentFixture<StepEmergencyContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEmergencyContact],
    }).compileComponents();

    fixture = TestBed.createComponent(StepEmergencyContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
