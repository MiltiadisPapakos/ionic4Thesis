import { TestBed } from '@angular/core/testing';

import { DateTimeUtilsTsService } from './date-time-utils.ts.service';

describe('DateTimeUtilsTsService', () => {
  let service: DateTimeUtilsTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateTimeUtilsTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
