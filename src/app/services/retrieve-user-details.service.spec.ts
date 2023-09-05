import { TestBed } from '@angular/core/testing';

import { RetrieveUserDetailsService } from './retrieve-user-details.service';

describe('RetrieveUserDetailsService', () => {
  let service: RetrieveUserDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveUserDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
