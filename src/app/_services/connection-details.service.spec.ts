import { TestBed } from '@angular/core/testing';

import { ConnectionDetailsService } from './connection-details.service';

describe('ConnectionDetailsService', () => {
  let service: ConnectionDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
