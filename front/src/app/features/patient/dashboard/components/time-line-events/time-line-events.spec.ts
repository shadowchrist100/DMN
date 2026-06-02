import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLineEvents } from './time-line-events';

describe('TimeLineEvents', () => {
  let component: TimeLineEvents;
  let fixture: ComponentFixture<TimeLineEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeLineEvents],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeLineEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
