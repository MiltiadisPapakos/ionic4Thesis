import { TestBed } from '@angular/core/testing';

import { RetrieveRequestListService } from './retrieve-request-list.service';

describe('RetrieveRequestListService', () => {
  let service: RetrieveRequestListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveRequestListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
