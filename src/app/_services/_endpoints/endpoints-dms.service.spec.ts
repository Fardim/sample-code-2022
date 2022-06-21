import { TestBed } from '@angular/core/testing';

import { EndpointsDmsService } from './endpoints-dms.service';

describe('EndpointsDmsService', () => {
  let service: EndpointsDmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsDmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upoadFileUrl', () => {
    expect(service.upoadFileUrl()).toContain(`/doc/upload`);
  });

  it('should downloadFileUrl', () => {
    expect(service.downloadFileUrl('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toContain(`/doc/3fa85f64-5717-4562-b3fc-2c963f66afa6`);
  });
});
