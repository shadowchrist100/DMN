import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthProviderRegister } from './health-provider-register';

describe('HealthProviderRegister', () => {
  let component: HealthProviderRegister;
  let fixture: ComponentFixture<HealthProviderRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthProviderRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthProviderRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
