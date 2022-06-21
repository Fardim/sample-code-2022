import { ConnectionDTO, NewDatasetMappingsResponse, MDOMappingsResponse } from '@models/connector/connector.model';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { EndpointsIntgService } from '@services/_endpoints/endpoints-intg.service';

import { IntgService } from './intg.service';

describe('IntgService', () => {
  let service: IntgService;
  let intgEndpointServiceSpy: jasmine.SpyObj<EndpointsIntgService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const intgEndpointSpy = jasmine.createSpyObj('EndpointsIntgService', [
      'getMappingsByURL',
      'getMdOMappingsUrl'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: EndpointsIntgService, useValue: intgEndpointSpy },
      ],
    });
    intgEndpointServiceSpy = TestBed.inject(EndpointsIntgService) as jasmine.SpyObj<EndpointsIntgService>;
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(IntgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getNewDatasetMappings()', async(() => {
    const url = `getMappingsByURL`;
    // mock url
    intgEndpointServiceSpy.getMappingsByURL.and.returnValue(url);

    const payload: ConnectionDTO = {
      password: 'Int@2022',
      userName: 'prospecta',
      systemURL: 'http://sap-de1.prospecta.com:8000/sap/bc/soap/wsdl11?services=/PROS/MDO_COST_CNT_DOWNLOAD',
    };
    const response: NewDatasetMappingsResponse = new NewDatasetMappingsResponse();

    // actual service call
    service.getMappingsByURL(payload).subscribe((actualResponse) => {
      // expect(actualResponse).toEqual(response);
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getNewDatasetMappings()', async(() => {
    const url = `getMdOMappingsUrl`;
    // mock url
    intgEndpointServiceSpy.getMdOMappingsUrl.and.returnValue(url);

    const language = 'en';
    const moduleId = '337';
    const response: MDOMappingsResponse = new MDOMappingsResponse();

    // actual service call
    service.getMdOMappings(moduleId, language).subscribe((actualResponse) => {
      // expect(actualResponse).toEqual(response);
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?language=${language}&moduleId=${moduleId}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));
});
