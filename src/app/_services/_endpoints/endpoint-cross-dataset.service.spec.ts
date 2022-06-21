import { TestBed } from '@angular/core/testing';

import { EndpointCrossDatasetService } from './endpoint-cross-dataset.service';

describe('EndpointCrossDatasetService', () => {
  let service: EndpointCrossDatasetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointCrossDatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
