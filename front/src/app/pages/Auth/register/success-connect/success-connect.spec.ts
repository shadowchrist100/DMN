import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessConnect } from './success-connect';

describe('SuccessConnect', () => {
  let component: SuccessConnect;
  let fixture: ComponentFixture<SuccessConnect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessConnect],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessConnect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
