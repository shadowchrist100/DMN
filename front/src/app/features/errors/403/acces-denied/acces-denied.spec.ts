import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesDenied } from './acces-denied';

describe('AccesDenied', () => {
  let component: AccesDenied;
  let fixture: ComponentFixture<AccesDenied>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesDenied],
    }).compileComponents();

    fixture = TestBed.createComponent(AccesDenied);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
