import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepTypeCompte } from './step-type-compte';

describe('StepTypeCompte', () => {
  let component: StepTypeCompte;
  let fixture: ComponentFixture<StepTypeCompte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTypeCompte],
    }).compileComponents();

    fixture = TestBed.createComponent(StepTypeCompte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
