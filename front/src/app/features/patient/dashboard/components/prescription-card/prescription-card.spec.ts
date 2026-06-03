import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionCard } from './prescription-card';

describe('PrescriptionCard', () => {
  let component: PrescriptionCard;
  let fixture: ComponentFixture<PrescriptionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
