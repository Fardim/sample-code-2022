import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { DoCorrectionRequest, MasterRecordChangeRequest, RequestForCatalogCheckData, RequestForGroupList, SearchAfter } from '@models/schema/duplicacy';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

import { CatalogCheckService } from './catalog-check.service';

describe('CatalogCheckService', () => {
  let catalogService: CatalogCheckService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['duplicacyGroupsListUrl', 'catalogCheckRecordsUrl', 'markForDeletionUrl',
  'masterRecordChangeUrl','doDuplicacyCorrectionUrl','approveDuplicacyCorrectionUrl', 'rejectDuplicacyCorrectionUrl']);
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: EndpointsRuleService, useValue: endpointSpy }
      ]
    });
    catalogService = TestBed.inject(CatalogCheckService);
    endpointServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(catalogService).toBeTruthy();
  });

  it('get All group Ids ', async(() => {

    const request = new RequestForGroupList();
    request.schemaId = 'schema1';
    request.plantCode = '0';
    request.runId = '123';
    request.searchAfter = new SearchAfter();

    const url = 'get group ids url';

    // mock url
    endpointServiceSpy.duplicacyGroupsListUrl.and.returnValue(url);
    // mock data
    const mockData = {
      bucket:{
        buckets:[
          {
            key: {
              exact: '77F8C3099692477C',
              fuzzy: '',
              group: 'Group 1'
            }
          },
            {
              key: {
                exact: '',
                fuzzy: '7467374637',
                group: 'Group 2'
              }
          }
        ]
      }
    }

    // const mockResult
    const mockResult = {groups:[
      { groupId : '77F8C3099692477C', groupKey: 'exactGroupId', groupDesc:'Group 1'},
      { groupId : '7467374637', groupKey: 'fuzzyGroupId', groupDesc:'Group 2'}
    ], searchAfter:{ exact: '',fuzzy: '7467374637',group: 'Group 2'}};

    // actual service call
    catalogService.getAllGroupIds(request).subscribe(actualResponse => {
      console.log(actualResponse);
       expect(actualResponse).toEqual(mockResult);
    });

    // mock http call
    let mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();

    // actual service call
    catalogService.getAllGroupIds(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual([]);
    });

    // mock http call
    mockRequest = httpTestingController.expectOne(`${url}`);
    mockRequest.flush(null);

    // verify http
    httpTestingController.verify();

  }));

  it('get All data Records ', async(() => {

    const request = new RequestForCatalogCheckData();
    request.schemaId = 'schema1';
    request.groupId = 'group1';
    request.page = 0;
    request.size = 20;
    request.key = 'exactGroupId';
    request.runId = '123';

    const url = 'catalog check records url';

    // mock url
    endpointServiceSpy.catalogCheckRecordsUrl.and.returnValue(url);
    // mock data
    const mockData = {
      doc : [{}],
      totalCount: 0
    }


    // actual service call
    catalogService.getCatalogCheckRecords(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
      // expect(actualResponse.length).toEqual(2);
    });

    // mock http call
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('mark a record as master record ', async(() => {

    const request = new MasterRecordChangeRequest();
    request.id = 'Diw_15';
    request.schemaId = 'schema123';
    request.runId = 'run123';
    request.oldId = '';

    const url = 'catalog master record url';

    // mock url
    endpointServiceSpy.masterRecordChangeUrl.and.returnValue(url);
    // mock data
    const mockData = {
      message: 'success'
    }


    // actual service call
    catalogService.markAsMasterRecord(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
    });

    // mock http call
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('should mark a record for deletion ', async(() => {

    const url = 'catalog deletion record url';

    // mock url
    endpointServiceSpy.markForDeletionUrl.and.returnValue(url);
    // mock data
    const mockData = {
      message: 'success'
    }


    // actual service call
    catalogService.markForDeletion('Diw_15','module1','schema','run',false).subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
    });

    // mock http call
    const mockRequest = httpTestingController.expectOne(`${url}?isForRestore=false`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('should do record correction ', async(() => {

    const url = 'do-correction url';

    // mock url
    endpointServiceSpy.doDuplicacyCorrectionUrl.and.returnValue(url);
    // mock data
    const mockData = {
      message: 'success'
    }

    const request: DoCorrectionRequest = { id: 'Diw_15', fldId: 'MATL_GRP', vc: 'newValue', oc: 'oldVal',
      groupIdold: 'fuzzy1', groupIdnew:'',isReviewed: 'false' } as DoCorrectionRequest;


    // actual service call
    catalogService.doCorrection('schema1','run1', request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
    });

    // mock http call
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('should approve record correction ', async(() => {

    const url = 'approve-correction url';

    // mock url
    endpointServiceSpy.approveDuplicacyCorrectionUrl.and.returnValue(url);
    // mock data
    const mockData = {
      message: 'success'
    }


    // actual service call
    catalogService.approveDuplicacyCorrection('schema1','run1', ['diw_15'], 'user').subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
    });

    // mock http call
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('should reject record correction ', async(() => {

    const url = 'reject-correction url';

    // mock url
    endpointServiceSpy.rejectDuplicacyCorrectionUrl.and.returnValue(url);
    // mock data
    const mockData = {
      message: 'success'
    }


    // actual service call
    catalogService.rejectDuplicacyCorrection('schema1','run1', ['diw_15'], 'user').subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
    });

    // mock http call
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));


});
