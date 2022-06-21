import { TestBed } from '@angular/core/testing';

import { EndpointsCoreCrudService } from './endpoints-core-crud.service';

describe('EndpointsCoreCrudService', () => {
  let service: EndpointsCoreCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsCoreCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
