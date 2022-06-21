import { EndpointsSapwsService } from '@services/_endpoints/endpoints-sapws.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';

import { SapwsService } from './sapws.service';
import { NewDatasetMappingsResponse, SapRequestDTO } from '@models/connector/connector.model';

describe('SapwsService', () => {
  let service: SapwsService;
  let sapwsEndpointServiceSpy: jasmine.SpyObj<EndpointsSapwsService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const sapwsEndpointSpy = jasmine.createSpyObj('EndpointsSapwsService', [
      'getNewDatasetMappingsUrl', 'getSapServices', 'saveOrUpdateConnection', 'getStandardPackagesUrl', 'fetchSAPTablesUrl'
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: EndpointsSapwsService, useValue: sapwsEndpointSpy },
      ],
    });
    service = TestBed.inject(SapwsService);
    sapwsEndpointServiceSpy = TestBed.inject(EndpointsSapwsService) as jasmine.SpyObj<EndpointsSapwsService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getNewDatasetMappings()', async(() => {
    const url = `getNewDatasetMappingsUrl`;
    // mock url
    sapwsEndpointServiceSpy.getNewDatasetMappingsUrl.and.returnValue(url);

    const payload: SapRequestDTO = {
      pageNo: 0,
      pageSize: 10,
      password: 'Int@2022',
      username: 'prospecta',
      tableName: '/1CN/CTXSAPD0001',
      url: 'http://sap-de1.prospecta.com:8000/sap/bc/soap/rfc',
    };
    const response: NewDatasetMappingsResponse = new NewDatasetMappingsResponse();

    // actual service call
    service.getNewDatasetMappings(payload).subscribe((actualResponse) => {
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

  it('fetchSAPTables()', async(() => {
    const url = `fetchSAPTablesUrl`;
    // mock url
    sapwsEndpointServiceSpy.fetchSAPTablesUrl.and.returnValue(url);

    const payload: SapRequestDTO = {
      pageNo: 0,
      pageSize: 10,
      password: 'Int@2022',
      username: 'prospecta',
      tableName: '/1CN/CTXSAPD0001',
      url: 'http://sap-de1.prospecta.com:8000/sap/bc/soap/rfc',
    };
    const response: string[] = [
      '/1CN/CRMSAP_PART',
      '/1CN/CTXSAPD0001',
      '/1CN/CTXSAPD0002',
      '/1CN/CTXSAPD0003',
      '/1CN/CTXSAPD0004',
      '/1CN/CTXSAPD0201',
      '/1CN/CTXSAPR0100',
      '/1CN/CTXSAPR0103',
      '/1CN/CTXSAPR0104',
      '/1CN/CTXSAPR0105',
    ];

    // actual service call
    service.fetchSAPTables(payload).subscribe((actualResponse) => {
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

});
