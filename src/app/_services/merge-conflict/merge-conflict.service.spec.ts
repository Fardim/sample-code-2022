import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';

import { MergeConflictService } from './merge-conflict.service';

describe('MergeConflictService', () => {
  let service: MergeConflictService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsClassicService> ;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsClassicService', ['getConflictedRecordsListUrl', 'getConflictedRecordDetailsUrl',
      'saveConflicResolveUrl', 'resetConflictCrUrl']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: EndpointsClassicService, useValue: endpointSpy}
      ]
    });
    service = TestBed.inject(MergeConflictService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointServiceSpy = TestBed.inject(EndpointsClassicService) as jasmine.SpyObj<EndpointsClassicService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getConflictedRecordsList()', async(() => {

    const url = `getConflictedRecordsListUrl`;
    // mock url
    endpointServiceSpy.getConflictedRecordsListUrl.and.returnValue(url);
    const massId = '1701';
    const crId = '';
    const pageNo = 0;
    const pageSize = 20;

    const response = [
      { crId: 'CR_908955489209874264', rec_num: 'HERS001978', count: 5 }
    ];

    // actual service call
    service.getConflictedRecordsList(massId, crId, pageNo, pageSize, '')
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?crId=${crId}&massId=${massId}&pageNo=${pageNo}&pageSize=${pageSize}&s=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getConflictedRecordDetails()', async(() => {

    const url = `getConflictedRecordDetailsUrl`;
    // mock url
    endpointServiceSpy.getConflictedRecordDetailsUrl.and.returnValue(url);
    const crId = '1701';

    const response = {
      header: {
        fields :[
        {
          fieldId: 'MATL_GRP',
          fieldDesc: 'Material group',
          base: {
            value: '1701',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: '1702',
            isChecked: true,
            enabled: true
          }
        }]
      }
    };

    // actual service call
    service.getConflictedRecordDetails(crId)
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?crId=${crId}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('saveConflicResolve()', async(() => {

    const url = `saveConflicResolveUrl`;
    // mock url
    endpointServiceSpy.saveConflicResolveUrl.and.returnValue(url);
    const request = {
      CR_123 : {
        header: {},
        hierarchy: []
      }
    };

    const response = request;

    // actual service call
    service.saveConflicResolve(request, '517779857113201757')
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?massId=517779857113201757`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('resetConflictCR()', async(() => {

    const url = `resetConflictCrUrl`;
    const response = {};
    // mock url
    endpointServiceSpy.resetConflictCrUrl.and.returnValue(url);

    // actual service call
    service.resetConflictCR('CR_793327908324953657')
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?crId=CR_793327908324953657`);
    expect(mockRequst.request.method).toEqual('POST');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));
});
