import { TestBed } from '@angular/core/testing';

import { EndpointSalesforceAdaptorService } from './endpoint-salesforce-adaptor.service';

describe('EndpointSalesforceAdaptorService', () => {
  let service: EndpointSalesforceAdaptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointSalesforceAdaptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
