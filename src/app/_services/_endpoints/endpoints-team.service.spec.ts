import { TestBed } from '@angular/core/testing';

import { EndpointsTeamService } from './endpoints-team.service';

describe('EndpointsTeamService', () => {
  let service: EndpointsTeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsTeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
