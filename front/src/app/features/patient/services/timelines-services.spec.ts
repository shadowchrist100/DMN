import { TestBed } from '@angular/core/testing';

import { TimelinesServices } from './timelines-services';

describe('TimelinesServices', () => {
  let service: TimelinesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelinesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
