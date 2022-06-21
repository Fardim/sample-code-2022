import { TestBed, async } from '@angular/core/testing';

import { WidgetService } from './widget.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EndpointsAnalyticsService } from '@services/_endpoints/endpoints-analytics.service';
import { Criteria, DisplayCriteria, WidgetType } from '@modules/report/_models/widget';

describe('WidgetService', () => {
  let service: WidgetService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsAnalyticsService>;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    const epsSpy = jasmine.createSpyObj('EndpointsAnalyticsService', ['widgetDataUrl', 'copyReport', 'displayCriteria', 'exportReport', 'importUploadReport', 'importReport','displayCriteriaV2' , 'deleteLogs']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WidgetService,
        { provide: EndpointsAnalyticsService, useValue: epsSpy }
      ]
    }).compileComponents();
    service = TestBed.inject(WidgetService);
    endpointServiceSpy = TestBed.inject(EndpointsAnalyticsService) as jasmine.SpyObj<EndpointsAnalyticsService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getWidgetData() : be able to retrive widget data', async(() => {
    const testurl = 'dummy url to test';
    const widgetId = '6254672';
    const reportId = '724752745672';
    const liveEditValue = true;
    // mocking url
    endpointServiceSpy.widgetDataUrl.and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.getWidgetData(widgetId, null).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}?widgetId=${widgetId}&searchString=&searchAfter=&timeZone=&location=&timePeriod=`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

    // mocking http for else part
    const reqElse = httpTestingController.expectOne(`${testurl}?widgetId=${widgetId}&searchString=&searchAfter=&timeZone=&location=&timePeriod=&liveEditMode=${liveEditValue}&reportId=${reportId}`);
    expect(reqElse.request.method).toEqual('POST');
    reqElse.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('copyReport() : should call copyReport', async(() => {
    const reportName = 'Copy of Test';
    const reportId = '724752745672';
    const testurl = 'dummy url to test';

    endpointServiceSpy.copyReport.and.returnValue(testurl);

    const mockhttpData = {} as any;
    service.copyReport(reportId, reportName).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.reportName).toEqual(reportName);
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('getDisplayCriteria() : should call getDisplayCriteria', async(() => {
    const widgetId = '1234';
    const widgetType = WidgetType.PIE_CHART;
    const testurl = 'dummy url to test';

    endpointServiceSpy.displayCriteriaV2.and.returnValue(testurl);

    const mockhttpData = {} as any;
    service.getDisplayCriteria(widgetId, widgetType).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('saveDisplayCriteria() : should call saveDisplayCriteria', async(() => {
    const widgetId = '1234';
    const widgetType = WidgetType.PIE_CHART;
    const testurl = 'dummy url to test';
    const displayCriteria = DisplayCriteria.CODE;

    endpointServiceSpy.displayCriteria.withArgs(widgetId, widgetType).and.returnValue(testurl);

    const mockhttpData = {} as any;
    service.saveDisplayCriteria(widgetId, widgetType, displayCriteria).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}&displayCriteria=${displayCriteria}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('saveDisplayCriteria() : should call saveDisplayCriteria with table body', async(() => {
    const widgetId = '1234';
    const widgetType = WidgetType.TABLE_LIST;
    const testurl = 'dummy url to test';
    const body = [{ widgetId: 1618447669219, fields: 'DTECREATED', sno: 138938958398777400, displayCriteria: 'CODE_TEXT', createdBy: 'initiator', fieldOrder: 0 }, { widgetId: 1618447669219, fields: 'ZGR_DATE', sno: 650430342398777300, displayCriteria: 'CODE_TEXT', createdBy: 'initiator', fieldOrder: 1 }, { widgetId: 1618447669219, fields: 'GS_FROM_DATE', sno: 251245618398777400, displayCriteria: 'CODE_TEXT', createdBy: 'initiator', fieldOrder: 2 }, { widgetId: 1618447669219, fields: 'LOBM_VFDAT', sno: 418568174398777400, displayCriteria: 'CODE_TEXT', createdBy: 'initiator', fieldOrder: 3 }, { widgetId: 1618447669219, fields: 'MATL_TYPE', sno: 500297061398777400, displayCriteria: 'CODE_TEXT', createdBy: 'initiator', fieldOrder: 4 }];

    endpointServiceSpy.displayCriteria.and.returnValue(testurl);

    const mockhttpData = [{ sno: 138938958398777400, widgetId: 1618447669219, fields: 'DTECREATED', fieldOrder: 0, displayCriteria: 'CODE_TEXT', createdBy: 'initiator' }, { sno: 650430342398777300, widgetId: 1618447669219, fields: 'ZGR_DATE', fieldOrder: 1, displayCriteria: 'CODE_TEXT', createdBy: 'initiator' }, { sno: 251245618398777400, widgetId: 1618447669219, fields: 'GS_FROM_DATE', fieldOrder: 2, displayCriteria: 'CODE_TEXT', createdBy: 'initiator' }, { sno: 418568174398777400, widgetId: 1618447669219, fields: 'LOBM_VFDAT', fieldOrder: 3, displayCriteria: 'CODE_TEXT', createdBy: 'initiator' }, { sno: 500297061398777400, widgetId: 1618447669219, fields: 'MATL_TYPE', fieldOrder: 4, displayCriteria: 'CODE_TEXT', createdBy: 'initiator' }];
    service.saveDisplayCriteria(widgetId, widgetType, null, body).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('exportReport() : should call exportReport', async(() => {
    const testurl = 'dummy url to test';
    const reportId = '724752745672';
    const reportName = 'Test Report';

    endpointServiceSpy.exportReport.and.returnValue(testurl);

    const mockhttpData = {};
    service.exportReport(reportId,reportName).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('importUploadReport() : should call importUploadReport', async(() => {
    const testurl = 'dummy url to test';
    const file = new File([], 'test');

    endpointServiceSpy.importUploadReport.and.returnValue(testurl);

    const mockhttpData = { alreadyExits: false, acknowledge: true, reportId: 'extract_from_file', reportName: 'extract_from_file', importedBy: '${current_userid_who_imported}', importedAt: 16887879908, updatedAt: 16887879908, fileSno: 872234723674 };
    service.importUploadReport(file).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('importReport() : should call importReport', async(() => {
    const testurl = 'dummy url to test';
    const fileSno = '1234';
    const file = new File([], 'test');
    const replaceOld = false;
    const keepCopy = false;
    const reportId = '465643';

    endpointServiceSpy.importReport.and.returnValue(testurl);

    const mockhttpData = { alreadyExits: false, acknowledge: true, reportId: 'extract_from_file', reportName: 'extract_from_file', importedBy: '${current_userid_who_imported}', importedAt: 16887879908, updatedAt: 16887879908, fileSno: 872234723674 };
    service.importReport(file, fileSno, replaceOld, keepCopy, reportId).subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));

  it('sideSheetStatusChange: should return an observable',async(()=>{
    expect(service.sideSheetStatusChange()).toBeTruthy();
  }))

  it('setFilterCriteria',async(()=>{
    const filterCriteria = [{fieldId : 'TIME_TAKEN',conditionFieldValue:'03'} as Criteria];
    service.setFilterCriteria(filterCriteria);
    expect(service.filterdCriteria.length).toEqual(1);
  }))

  it('deleteLogs() : delete logs', async(() => {
    const testurl = 'delete-logs';

    endpointServiceSpy.deleteLogs.and.returnValue(testurl);

    const mockhttpData = {res : true};
    service.deleteLogs('12345').subscribe((response) => {
      expect(response).not.toBe(null)
    });

    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockhttpData);
    httpTestingController.verify();
  }));
});
