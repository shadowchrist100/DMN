import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Allergies } from './allergies';

describe('Allergies', () => {
  let component: Allergies;
  let fixture: ComponentFixture<Allergies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allergies],
    }).compileComponents();

    fixture = TestBed.createComponent(Allergies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
