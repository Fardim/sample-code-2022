import { Report } from '@modules/report-v2/_models/widget';
import { TestBed, async } from '@angular/core/testing';

import { ReportService } from './report.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EndpointsAnalyticsService } from '@services/_endpoints/endpoints-analytics.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { WidgetDownloadUser } from '@models/collaborator';
import { ReportDashboardReq } from '../_models/widget';
import { ObjectTypeResponse } from '@models/schema/schema';

describe('ReportService', () => {
  let service: ReportService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsClassicService>;
  let httpTestingController: HttpTestingController;
  let analyticsServiceSpy: jasmine.SpyObj<EndpointsAnalyticsService>;
  beforeEach(() => {
    const epsSpy = jasmine.createSpyObj('EndpointsClassicService', [ 'getPermissionUrl','returnCollaboratorsPermisisonUrl','saveUpdateReportCollaborator','deleteCollaboratorUrl']);
    const ansSpy = jasmine.createSpyObj('EndpointsAnalyticsService', [ 'reportDashboardUrl', 'docCountUrl','saveReportDownload', 'discardDraftReport', 'saveDraft', 'deleteWidget', 'saveReport', 'getReport', 'getDIWDatasetUrl']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        ReportService,
        { provide: EndpointsClassicService, useValue: epsSpy },
        { provide: EndpointsAnalyticsService, useValue: ansSpy}
      ]
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
    service.getReportInfo(265623,plantCode).subscribe(actualData => {
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
    service.getDocCount(objectType, plantCode).subscribe(actualData => {
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
    service.getCollaboratorsPermisison(reportId).subscribe(actualData => {
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
    service.saveUpdateReportCollaborator([]).subscribe(actualData => {
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
    service.deleteCollaborator('7235745').subscribe(actualData => {
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
    const request = [{email:'abc@getMaxListeners.com', description: '', userName:'admin'} as WidgetDownloadUser]
    const widgetId = '654367';
    const username = 'Admin';
    const conditionList = [];
    const location = 'abc';
    // mocking url
    analyticsServiceSpy.saveReportDownload.withArgs(widgetId, username, location).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.saveUpdateportDownload(request,widgetId,username, conditionList, location).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('discardDraftReport() : should call to discard report', async(() => {
    const testurl = 'save update url';
    const reportId = 654367;
    // mocking url
    analyticsServiceSpy.discardDraftReport.withArgs(reportId).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.discardDraftReport(reportId).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('saveDraft() : should call to save draft report', async(() => {
    const testurl = 'save draft url';
    const reportId = 654367;
    const request = new ReportDashboardReq();
    // mocking url
    analyticsServiceSpy.saveDraft.withArgs(reportId).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.saveDraft(reportId, request).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteWidget() : should call to delete widget', async(() => {
    const testurl = 'delete widget url';
    const reportId = 654367;
    const widgetId = 654367;
    // mocking url
    analyticsServiceSpy.deleteWidget.withArgs(reportId, widgetId).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.deleteWidget(reportId, widgetId).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('saveReport() : should call to save report', async(() => {
    const testurl = 'save report url';
    const reportId = 654367;
    const request = new ReportDashboardReq();
    // mocking url
    analyticsServiceSpy.saveReport.withArgs(reportId).and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.saveReport(reportId, request).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(testurl);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('getReport() : should call to get a report', async(() => {
    const testurl = 'get report url';
    const reportId = 654367;
    // mocking url
    analyticsServiceSpy.getReport.withArgs(reportId).and.returnValue(testurl);
    // mock data
    const mockhttpData = new Report();
    // actual call
    service.getReport(reportId, 'need_publish_one').subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}?need_publish_one=need_publish_one`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('getDIWDataset() : will return list of object type ', async(() => {
    const url = 'getDIWDatasetUrl';
    const response: ObjectTypeResponse[] = [
      {objectid: '1005', objectdesc: 'Material'}
    ];

    analyticsServiceSpy.getDIWDatasetUrl.and.returnValue(url);

    service.getDIWDataset('',0,0).subscribe(modules => {
      expect(modules).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?s=&_page=0&_size=0&_prefetch=`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  }));
});
