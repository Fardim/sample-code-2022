import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { ListPageFilters, ListPageViewDetails, ViewsPage } from '@models/list-page/listpage';
import { EndpointsListService } from '@services/_endpoints/endpoints-list.service';

import { ListService } from './list.service';

describe('ListService', () => {
  let listService: ListService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsListService> ;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsListService', ['getAllListPageViewsUrl', 'getListPageViewDetailsUrl', 'upsertListPageViewUrl', 'deleteListPageViewUrl',
    'getTableDataUrl', 'getDataCountUrl', 'upsertListFiltersUrl', 'updateDefaultViewUrl', 'getUserSearchHistoryUrl', 'saveSearchHistoryUrl', 'clearSearchHistoryUrl',
    'getSavedFiltersUrl']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: EndpointsListService, useValue: endpointSpy}
      ]
    });
    listService = TestBed.inject(ListService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointServiceSpy = TestBed.inject(EndpointsListService) as jasmine.SpyObj<EndpointsListService>;
  });

  it('should be created', () => {
    expect(listService).toBeTruthy();
  });

  it('getAllListPageViews()', async(() => {

    const url = `getAllListPageViewsUrl`;
    // mock url
    endpointServiceSpy.getAllListPageViewsUrl.and.returnValue(url);

    const response = new ViewsPage();
    const moduleId = '1005';

    // actual service call
    listService.getAllListPageViews(moduleId,0 )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}&offSet=0`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getListPageViewDetails()', async(() => {

    const url = `getListPageViewDetailsUrl`;
    // mock url
    endpointServiceSpy.getListPageViewDetailsUrl.and.returnValue(url);

    const viewDetails = new ListPageViewDetails();
    viewDetails.viewId = '1701';
    const moduleId = '1005';

    // actual service call
    listService.getListPageViewDetails(viewDetails.viewId, moduleId )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(viewDetails);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(viewDetails);
    // verify http
    httpTestingController.verify();
  }));

  it('upsertListPageViewDetails()', async(() => {

    const url = `upsertListPageViewUrl`;
    // mock url
    endpointServiceSpy.upsertListPageViewUrl.and.returnValue(url);

    const viewDetails = new ListPageViewDetails();
    viewDetails.viewId = '1701';
    const moduleId = '1005';

    // actual service call
    listService.upsertListPageViewDetails(viewDetails, moduleId )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(viewDetails);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(viewDetails);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteListPageView()', async(() => {

    const url = `deleteListPageViewUrl`;
    // mock url
    endpointServiceSpy.deleteListPageViewUrl.and.returnValue(url);

    const viewDetails = new ListPageViewDetails();
    viewDetails.viewId = '1701';
    const moduleId = '1005';

    // actual service call
    listService.deleteListPageView(viewDetails.viewId, moduleId )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(viewDetails);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}`);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(viewDetails);
    // verify http
    httpTestingController.verify();
  }));

  it('getTableData()', async(() => {

    const url = `getTableDataUrl`;
    // mock url
    endpointServiceSpy.getTableDataUrl.and.returnValue(url);

    const moduleId = '1005';
    const viewId = '1701';
    const pageIndex = 0;
    const response = [];

    // actual service call
    listService.getTableData(moduleId, viewId, pageIndex, [] )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}&viewId=${viewId}&pageId=${pageIndex}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getDataCount()', async(() => {

    const url = `getDataCountUrl`;
    // mock url
    endpointServiceSpy.getDataCountUrl.and.returnValue(url);

    const moduleId = '1005';
    const response = 1000;

    // actual service call
    listService.getDataCount(moduleId, [] )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('upsertListFilters()', async(() => {

    const url = `upsertListFiltersUrl`;
    // mock url
    endpointServiceSpy.upsertListFiltersUrl.and.returnValue(url);

    const response = {
      filterId: '1701'
    }

    // actual service call
    listService.upsertListFilters(new ListPageFilters())
      .subscribe(actualResponse => {
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

  it('updateDefaultView()', async(() => {

    const url = `updateDefaultViewUrl`;
    // mock url
    endpointServiceSpy.updateDefaultViewUrl.and.returnValue(url);

    const viewId = '1701';
    const objectId = '1005';

    const response = {
      acknowledge: true,
      viewId: '1701',
      viewName: 'test view'
    }

    // actual service call
    listService.updateDefaultView(objectId, viewId )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?objectId=${objectId}&viewId=${viewId}`);
    expect(mockRequst.request.method).toEqual('PUT');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getUserSearchHistory()', async(() => {

    const url = `getUserSearchHistoryUrl`;
    // mock url
    endpointServiceSpy.getUserSearchHistoryUrl.and.returnValue(url);

    const objectId = '1005';

    const response = []

    // actual service call
    listService.getUserSearchHistory(objectId)
    .subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });

    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?objectId=${objectId}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();

  }));

  it('getSavedFilters()', async(() => {

    const url = `getSavedFiltersUrl`;
    // mock url
    endpointServiceSpy.getSavedFiltersUrl.and.returnValue(url);

    const moduleId = '1005';
    const page = 1;
    const response = [
      {
        description: 'string',
        filterId: 'string'
      }
    ]

    // actual service call
    listService.getSavedFilters(moduleId, 1)
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?moduleId=${moduleId}&page=${page}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('saveSearchHistory()', async(() => {

    const url = `saveSearchHistoryUrl`;
    // mock url
    endpointServiceSpy.saveSearchHistoryUrl.and.returnValue(url);

    const searchStr = 'blue';
    const objectId = '1005';

    const response = {
      acknowledge: true,
      errorMsg: '',
      id: '1701'
    }

    // actual service call
    listService.saveSearchHistory(objectId, searchStr )
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?objectId=${objectId}&searchStr=${searchStr}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('clearSearchHistory()', async(() => {

    const url = `clearSearchHistoryUrl`;
    // mock url
    endpointServiceSpy.clearSearchHistoryUrl.and.returnValue(url);

    const response = {
      acknowledge: true,
      errorMsg: '',
      id: '1701'
    }

    // actual service call
    listService.clearSearchHistory()
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));
});
