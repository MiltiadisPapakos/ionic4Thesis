import { TestBed } from '@angular/core/testing';

import { MatchingUsersService } from './matching-users.service';

describe('MatchingUsersService', () => {
  let service: MatchingUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchingUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
