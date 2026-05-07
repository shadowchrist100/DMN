import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDossier } from './patient-dossier';

describe('PatientDossier', () => {
  let component: PatientDossier;
  let fixture: ComponentFixture<PatientDossier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDossier],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDossier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
