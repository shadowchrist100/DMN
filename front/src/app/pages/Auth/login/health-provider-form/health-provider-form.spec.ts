import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthProviderForm } from './health-provider-form';

describe('HealthProviderForm', () => {
  let component: HealthProviderForm;
  let fixture: ComponentFixture<HealthProviderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthProviderForm],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthProviderForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
