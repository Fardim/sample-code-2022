import { TestBed, async } from '@angular/core/testing';

import { ReportService } from './report.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EndpointsAnalyticsService } from '@services/_endpoints/endpoints-analytics.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { WidgetDownloadBody, WidgetDownloadUser } from '@models/collaborator';

describe('ReportService', () => {
  let service: ReportService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsClassicService>;
  let httpTestingController: HttpTestingController;
  let analyticsServiceSpy: jasmine.SpyObj<EndpointsAnalyticsService>;
  beforeEach(() => {
    const epsSpy = jasmine.createSpyObj('EndpointsClassicService', [
      'getPermissionUrl',
      'returnCollaboratorsPermisisonUrl',
      'saveUpdateReportCollaborator',
      'deleteCollaboratorUrl',
    ]);
    const ansSpy = jasmine.createSpyObj('EndpointsAnalyticsService', ['reportDashboardUrl', 'docCountUrl', 'saveReportDownload']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReportService,
        { provide: EndpointsClassicService, useValue: epsSpy },
        { provide: EndpointsAnalyticsService, useValue: ansSpy },
      ],
    }).compileComponents();
    service = TestBed.inject(ReportService);
    endpointServiceSpy = TestBed.inject(EndpointsClassicService) as jasmine.SpyObj<EndpointsClassicService>;
    analyticsServiceSpy = TestBed.inject(EndpointsAnalyticsService) as jasmine.SpyObj<EndpointsAnalyticsService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getReportInfo() : be able to retrive report information', async(() => {
    const testurl = 'dummy url to test';
    const plantCode = '0';
    // mocking url
    analyticsServiceSpy.reportDashboardUrl.withArgs(265623).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.getReportInfo(265623, plantCode).subscribe((actualData) => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}?plantCode=${plantCode}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('getDocCount() : should be return count', async(() => {
    const testurl = 'count testing url';
    const objectType = '1005';
    const plantCode = '0';
    // mocking url
    analyticsServiceSpy.docCountUrl.withArgs(objectType).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.getDocCount(objectType, plantCode).subscribe((actualData) => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}?plantCode=${plantCode}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  // it('getCollaboratorPermission() : get all collaborators permisison', async(() => {
  //   const testurl = 'get collaborator permission url';
  //   const queryString = '';
  //   const fetchCount = 0;
  //   // mocking url
  //   endpointServiceSpy.getAllUserDetailsUrl.and.returnValue(testurl);
  //   // mock data
  //   const mockhttpData = {} as any;
  //   // actual call
  //   service.getCollaboratorPermission(queryString, fetchCount).subscribe(actualData => {
  //     expect(actualData).toEqual(mockhttpData);
  //   });
  //   // mocking http
  //   const req = httpTestingController.expectOne(`${testurl}?queryString=${queryString}?fetchcount=${fetchCount}`);
  //   expect(req.request.method).toEqual('GET');
  //   req.flush(mockhttpData);
  //   // verify http
  //   httpTestingController.verify();

  // }));

  it('getCollaboratorsPermisison() : get all collaborators with permisison', async(() => {
    const testurl = 'get collaborator with permission url';
    const reportId = '724752745672';
    // mocking url
    endpointServiceSpy.returnCollaboratorsPermisisonUrl.withArgs(reportId).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.getCollaboratorsPermisison(reportId).subscribe((actualData) => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('saveUpdateReportCollaborator() : should call to save/update permission', async(() => {
    const testurl = 'save update url';
    // mocking url
    endpointServiceSpy.saveUpdateReportCollaborator.and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.saveUpdateReportCollaborator([]).subscribe((actualData) => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteCollaborator() : should call to delete collaborator', async(() => {
    const testurl = 'delete collaborator url';
    // mocking url
    endpointServiceSpy.deleteCollaboratorUrl.and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.deleteCollaborator('7235745').subscribe((actualData) => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('saveUpdateportDownload() : should call to save/update report download', async(() => {
    const testurl = 'save update url';
    const userList = [{ email: 'abc@getMaxListeners.com', description: '', userName: 'admin' } as WidgetDownloadUser];
    const widgetId = '654367';
    const username = 'Admin';
    const conditionList = '';
    const location = 'abc';
    const request: WidgetDownloadBody = new WidgetDownloadBody();

    request.userList = userList;

    request.filterCriteria = conditionList;
    // mocking url
    // console.log(analyticsServiceSpy.saveReportDownload);
    analyticsServiceSpy.saveReportDownload.withArgs(widgetId, username).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.saveUpdateportDownload(request, widgetId, username, location).subscribe((actualData) => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));
});
