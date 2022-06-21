import { TestBed } from '@angular/core/testing';

import { EndpointTransformationService } from './endpoint-transformation.service';

describe('EndpointTransformationService', () => {
  let service: EndpointTransformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointTransformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
