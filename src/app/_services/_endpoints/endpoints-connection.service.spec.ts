import { TestBed } from '@angular/core/testing';

import { EndpointsConnectionService } from './endpoints-connection.service';

describe('EndpointsTeamService', () => {
  let service: EndpointsConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
