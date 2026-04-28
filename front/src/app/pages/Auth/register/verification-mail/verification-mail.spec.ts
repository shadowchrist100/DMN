import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationMail } from './verification-mail';

describe('VerificationMail', () => {
  let component: VerificationMail;
  let fixture: ComponentFixture<VerificationMail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationMail],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationMail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
