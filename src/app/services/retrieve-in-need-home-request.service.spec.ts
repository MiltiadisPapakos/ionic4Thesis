import { TestBed } from '@angular/core/testing';

import { RetrieveInNeedHomeRequestService } from './retrieve-in-need-home-request.service';

describe('RetrieveInNeedHomeRequestService', () => {
  let service: RetrieveInNeedHomeRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveInNeedHomeRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
