import { TestBed } from '@angular/core/testing';

import { RetrieveVolunteerHomeRequestService } from './retrieve-volunteer-home-request.service';

describe('RetrieveVolunteerHomeRequestService', () => {
  let service: RetrieveVolunteerHomeRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveVolunteerHomeRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
