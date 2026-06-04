import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Examens} from './examens';

describe('Analyses', () => {
  let component: Examens;
  let fixture: ComponentFixture<Examens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Examens],
    }).compileComponents();

    fixture = TestBed.createComponent(Examens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
