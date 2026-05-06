import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerRegister } from './practitioner-register';

describe('PractitionerRegister', () => {
  let component: PractitionerRegister;
  let fixture: ComponentFixture<PractitionerRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PractitionerRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(PractitionerRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
