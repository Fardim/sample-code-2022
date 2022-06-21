import { TestBed } from '@angular/core/testing';

import { ServiceInstanceSharingService } from './service-instance-sharing.service';

describe('ServiceInstanceSharingService', () => {
  let service: ServiceInstanceSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceInstanceSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
