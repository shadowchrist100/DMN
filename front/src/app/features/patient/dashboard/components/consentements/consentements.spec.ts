import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Consentements } from './consentements';

describe('Consentements', () => {
  let component: Consentements;
  let fixture: ComponentFixture<Consentements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consentements],
    }).compileComponents();

    fixture = TestBed.createComponent(Consentements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
