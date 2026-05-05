import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Visites } from './visites';

describe('Visites', () => {
  let component: Visites;
  let fixture: ComponentFixture<Visites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Visites],
    }).compileComponents();

    fixture = TestBed.createComponent(Visites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
