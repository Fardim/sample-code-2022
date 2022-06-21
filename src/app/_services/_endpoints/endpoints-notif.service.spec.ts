import { TestBed } from '@angular/core/testing';

import { EndpointsNotifService } from './endpoints-notif.service';

describe('EndpointsNotifService', () => {
  let service: EndpointsNotifService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsNotifService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
