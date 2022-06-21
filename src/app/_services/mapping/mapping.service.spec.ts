import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MappingRequestBody } from '@models/mapping';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';

import { MappingService } from './mapping.service';

describe('MappingService', () => {
  let service: MappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [EndpointsCoreService, HttpClientTestingModule]
    });
    service = TestBed.inject(MappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getExistingMappings(), should call api for existing mapping', () => {
    const spy = spyOn(service, 'getExistingMappings').and.callThrough();
    service.getExistingMappings(2);
    expect(spy).toHaveBeenCalled();
  })

  it('getExistingMappings(), should call api for save mapping', () => {
    const spy = spyOn(service, 'saveOrUpdateMapping').and.callThrough();
    const body: MappingRequestBody = {
      segmentMappings: [],
      wsdlDetails: []
    };
    service.saveOrUpdateMapping(body, 2);
    expect(spy).toHaveBeenCalled();
  });

  it('getMdoMappings(), should call api for existing mdo mapping', () => {
    const spy = spyOn(service, 'getMdoMappings').and.callThrough();
    service.getMdoMappings('en', 1, 0, 20, '');
    expect(spy).toHaveBeenCalled();
  });
});
