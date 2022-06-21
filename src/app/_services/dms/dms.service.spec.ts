import { EndpointsDmsService } from './../_endpoints/endpoints-dms.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';

import { DmsService } from './dms.service';

describe('DmsService', () => {
  let dmsService: DmsService;
  let dmsEndpointServiceSpy: jasmine.SpyObj<EndpointsDmsService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const dmsEndpointSpy = jasmine.createSpyObj('EndpointsDmsService', ['dummyCall', 'upoadFileUrl','downloadFileUrl']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DmsService, { provide: EndpointsDmsService, useValue: dmsEndpointSpy }],
    });
    dmsService = TestBed.inject(DmsService);
    dmsEndpointServiceSpy = TestBed.inject(EndpointsDmsService) as jasmine.SpyObj<EndpointsDmsService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(dmsService).toBeTruthy();
  });

  it('should upoadFile()', async(() => {

    const url = `upoadFileUrl`;
    // mock url
    dmsEndpointServiceSpy.upoadFileUrl.and.returnValue(url);

    const body = new File(['pros'], 'test.txt');
    const response = 'cd055dab-1b80-4411-b608-65ee529f1e89';


    // actual service call
    dmsService.uploadFile(body)
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should downloadFile()', async(() => {

    const url = `downloadFileUrl`;
    // mock url
    dmsEndpointServiceSpy.downloadFileUrl.and.returnValue(url);

    const response = new Blob(['pros']);


    // actual service call
    dmsService.downloadFile('1701')
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));
});
