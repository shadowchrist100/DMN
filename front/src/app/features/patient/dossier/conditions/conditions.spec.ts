import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conditions } from './conditions';

describe('Conditions', () => {
  let component: Conditions;
  let fixture: ComponentFixture<Conditions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conditions],
    }).compileComponents();

    fixture = TestBed.createComponent(Conditions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
