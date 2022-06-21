import { EndpointsProcessService } from './_endpoints/endpoints-process.service';
import { TestBed, fakeAsync, async } from '@angular/core/testing';
import { TaskListService } from './task-list.service';
import { AppMaterialModuleForSpec } from '../app-material-for-spec.module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskListViewObject } from '@models/task-list/columnSetting';
import { TaskListRequest } from '@models/task-list/filter';
import { TaskListRow } from '@models/task-list/taskListRow';
import { CommonGridRequestObject } from '@models/task-list/taskListDetails';

describe('TaskListService', () => {
  let service: TaskListService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsProcessService> ;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsProcessService', ['getInboxNodesCountUrl', 'saveTasklistVisitByUserUrl', 'saveOrUpdateTasklistHeadersUrl', 'getHeadersForNodeUrl', 'getTaskListDataUrl']);
    TestBed.configureTestingModule({
      providers: [TaskListService, HttpClientModule, HttpClientTestingModule, { provide: EndpointsProcessService, useValue: endpointSpy}],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, HttpClientModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointServiceSpy = TestBed.inject(EndpointsProcessService) as jasmine.SpyObj<EndpointsProcessService>;
  });

  it('should be created', () => {
    service = TestBed.inject(TaskListService)
    expect(service).toBeTruthy();
  });

  it('should call getTasks()', () => {
    service = TestBed.inject(TaskListService);
    const filterRequest: TaskListRequest = {
      objectToLoad: ['ALL'],
      fetchSize: 10,
      fetchCount: 0,
      sortField: [],
      filtersMap: { wildCardSearch: 'a' }
    }
    service.getTasks(filterRequest).subscribe((response: TaskListRow[]) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getTasksUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListRow[];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  })

  it('should call getTaskListCount()', () => {
    service = TestBed.inject(TaskListService);
    const filterRequest = {
      objectToLoad: ['ALL'],
      fetchSize: 10,
      fetchCount: 0,
      sortField: [],
      filtersMap: { wildCardSearch: 'a' }
    }
    service.getTaskListCount(filterRequest).subscribe((response: number) => {
      expect(response).toBeGreaterThanOrEqual(0)
    });
    const testurl = service.endpointService.getTaskListCountURL()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = 0 as number;
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call getDynamicFilters()', () => {
    service = TestBed.inject(TaskListService);
    const userDetails = {
      firstName: 'Demo',
      lastName: 'Approver',
      currentRoleId: '663065348460318692',
      assignedRoles: [{
        sno: '521017956918018581',
        roleId: '663065348460318692',
        roleDesc: 'DemoApprover',
        userId: 'DemoApp',
        defaultRole: '1'
      },
      {
        sno: '867216031918019215',
        roleId: '143739996174018010',
        roleDesc: 'DemoApprover2',
        userId: 'DemoApp',
        defaultRole: '0'
      }],
      fullName: 'Demo Approver',
      plantCode: 'MDO1003',
      userName: 'DemoApp',
      email: 'prostenant@gmail.com',
      dateformat: 'dd.mm.yy'
    }
    service.getDynamicFilters(userDetails).subscribe((response) => {
      expect(response).not.toBe(null);
    });

    const testurl = service.endpointService.getFiltersUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  })

  it('should call getTasklListViews()', fakeAsync(() => {
    service = TestBed.inject(TaskListService);
    service.getTasklListViews('DemoApp').subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getTaskListViewsUrl('DemoApp')
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListViewObject[];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('should call deleteTaskListItem()', () => {
    service = TestBed.inject(TaskListService);
    service.deleteTaskListItem('591446167348980453').subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getDeleteTaskListViewUrl('591446167348980453')
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('DELETE');
    httpTestingController.verify();
  });


  it('should call saveTaskListView()', () => {
    service = TestBed.inject(TaskListService);

    const requestJSON = {
      userCreated: 'DemoApp',
      viewId: null,
      viewName: 'test for test case',
      plantCode: 'MDO1003',
      fieldId: [],
      default: null,
      fields: [
        {
          fieldId: 'fname',
          order: 1
        },
        {
          fieldId: 'duedate',
          order: 2
        },
        {
          fieldId: 'objectdesc',
          order: 3
        },
        {
          fieldId: 'taskid',
          order: 4
        },
        {
          fieldId: 'datestarted',
          order: 5
        },
        {
          fieldId: 'emailtext',
          order: 6
        }
      ]
    }
    service.saveTaskListView(requestJSON).subscribe((response) => {
      expect(response).toBe('Record is Successfully saved')
    });

    const testurl = service.endpointService.getSaveTaskListURL()
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    httpTestingController.verify();
  });

  it('should call updateTaskListView()', () => {
    service = TestBed.inject(TaskListService);

    const requestJSON = {
      userCreated: 'DemoApp',
      viewId: '789050838156482977',
      viewName: 'test for test case',
      plantCode: 'MDO1003',
      fieldId: [],
      default: null,
      fields: [
        {
          fieldId: 'fname',
          order: 1
        },
        {
          fieldId: 'duedate',
          order: 2
        },
        {
          fieldId: 'objectdesc',
          order: 3
        },
        {
          fieldId: 'taskid',
          order: 4
        },
        {
          fieldId: 'datestarted',
          order: 5
        },
        {
          fieldId: 'emailtext',
          order: 6
        }
      ]
    }
    service.updateTaskListView(requestJSON).subscribe((response) => {
      expect(response).toBe('Record is Successfully saved')
    });

    const testurl = service.endpointService.getSaveTaskListURL()
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    httpTestingController.verify();
  });

  it('it should call getAuditLogs()', () => {
    service = TestBed.inject(TaskListService);
    service.getAuditLogs('1', '1', 'en').subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getAuditTrailLogsURL()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListViewObject[];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  })

  it('it should call getGridMetaData()', () => {
    service = TestBed.inject(TaskListService);
    const gridRequestParams: CommonGridRequestObject = {
      objecttype: '',
      objectNumber: '',
      eventCode: '',
      plantCode: '',
      lang: '',
      taskId: '',
      wfId: '',
      userRole: '',
      userId: '',
      tabCode: '',
      tabId: '',
      fetchSize: 10,
      fetchCount: 1,
      gridId: ''
    }
    service.getGridMetaData(gridRequestParams).subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getGridMetaDataURL(gridRequestParams)
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListViewObject[];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  });

  it('it should call getGridData()', () => {
    service = TestBed.inject(TaskListService);
    const gridRequestParams: CommonGridRequestObject = {
      objecttype: 'ERSA1005',
      objectNumber: '10100110',
      eventCode: '10',
      plantCode: 'MDO1005',
      lang: 'en',
      taskId: '663021653484603186921',
      wfId: '66460318692',
      userRole: '663065348460318692',
      userId: '663065348460318692',
      tabCode: 'header',
      tabId: '1001',
      fetchSize: 10,
      fetchCount: 1,
      gridId: '010101'
    }
    service.getGridData(gridRequestParams).subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getGridDataUrl(gridRequestParams)
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListViewObject[];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  });

  it('it should call getMetadataByWfid()', () => {
    service = TestBed.inject(TaskListService);
    service.getMetadataByWfid('1234567890').subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getMetadataByWfid('1234567890')
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListViewObject[];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  });

  it('it should call getCommonLayoutData()', () => {
    service = TestBed.inject(TaskListService);
    const taskListSummaryRequestParams = {
      plantCode: 'MDO1005',
      userRole: '663065348460318692',
      taskId: '66302165348460318692',
      userId: 'DemoApp',
      wfId: '663065348',
      lang: 'en',
      objectnumber: 'ERSA1005',
      objecttype: '91919',
      eventCode: '5',
      fetchSize: 10,
      fetchCount: 1,
      gridId: '12456'
    }
    service.getCommonLayoutData(taskListSummaryRequestParams).subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getCommonLayoutDataUrl(taskListSummaryRequestParams)
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  });

  it('it should call getChangeAuditLogDetails()', () => {
    service = TestBed.inject(TaskListService);

    service.getChangeAuditLogDetails('DemoApp', '663065348460318692', 'en').subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getChangeLogDetails()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  });

  it('getInboxNodesCount()', async(() => {
    service = TestBed.inject(TaskListService);
    const url = `getInboxNodesCountUrl`;
    // mock url
    endpointServiceSpy.getInboxNodesCountUrl.and.returnValue(url);

    const response = [];

    // actual service call
    service.getInboxNodesCount().subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('saveTasklistVisitByUser()', async(() => {
    service = TestBed.inject(TaskListService);
    const url = `saveTasklistVisitByUserUrl`;
    // mock url
    endpointServiceSpy.saveTasklistVisitByUserUrl.and.returnValue(url);

    const response = [];

    // actual service call
    service.saveTasklistVisitByUser('inbox').subscribe((actualResponse) => {
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

  it('saveOrUpdateTasklistHeaders()', async(() => {
    service = TestBed.inject(TaskListService);
    const url = `saveOrUpdateTasklistHeadersUrl`;
    // mock url
    endpointServiceSpy.saveOrUpdateTasklistHeadersUrl.and.returnValue(url);

    const payload = [
      {fldId: 'labels', order: 1},
      {fldId: 'sent', order: 2},
      {fldId: 'description', order: 3}
    ]
    // actual service call
    service.saveOrUpdateTasklistHeaders('inbox', payload).subscribe((actualResponse) => {
      expect(actualResponse).not.toBe(null);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(payload);
    // verify http
    httpTestingController.verify();
  }));

  it('getHeadersForNode()', async(() => {
    service = TestBed.inject(TaskListService);
    const url = `getHeadersForNodeUrl`;
    // mock url
    endpointServiceSpy.getHeadersForNodeUrl.and.returnValue(url);

    const response = [];

    // actual service call
    service.getHeadersForNode('inbox').subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  // it('getTaskListData()', async(() => {
  //   service = TestBed.inject(TaskListService);
  //   const url = `getTaskListDataUrl`;
  //   // mock url
  //   endpointServiceSpy.getTaskListDataUrl.and.returnValue(url);

  //   const response = {};

  //   // actual service call
  //   service.getTaskListData('inbox', 'en', 10, '').subscribe((actualResponse) => {
  //     expect(actualResponse).not.toBe(null);
  //   });
  //   // mock http call
  //   const mockRequst = httpTestingController.expectOne(`${url}`);
  //   expect(mockRequst.request.method).toEqual('POST');
  //   expect(mockRequst.request.responseType).toEqual('json');
  //   mockRequst.flush(response);
  //   // verify http
  //   httpTestingController.verify();
  // }));
});
