import {TestBed} from '@angular/core/testing';

import {ArbiterService} from './arbiter.service';

describe('ArbiterService', () => {
  let service: ArbiterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArbiterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
