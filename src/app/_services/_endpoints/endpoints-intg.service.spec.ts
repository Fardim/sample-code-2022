import { TestBed } from '@angular/core/testing';

import { EndpointsIntgService } from './endpoints-intg.service';

describe('EndpointsIntgService', () => {
  let service: EndpointsIntgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsIntgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getMappingsByURL', () => {
    expect(service.getMappingsByURL()).toContain('/get-mappings-by-url');
  });

  it('should getMdOMappingsUrl', () => {
    expect(service.getMdOMappingsUrl()).toContain('/get-mdo-mappings');
  });
});
