import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportingListComponent } from './reporting-list.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { WidgetService } from '@services/widgets/widget.service';
import { WidgetHeader, ReportingWidget, Criteria, DisplayCriteria, BlockType, ConditionOperator, FormControlType, LayoutConfigWorkflowModel, Widget, WidgetType } from '@modules/report/_models/widget';
import { of } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { RouterTestingModule } from '@angular/router/testing';
import { SimpleChanges } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { ReportService } from '@modules/report/_service/report.service';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Userdetails } from '@models/userdetails';
import { MetadataModel, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserService } from '@services/user/userservice.service';
import { SharedServiceService } from '@shared/_services/shared-service.service';

describe('ReportingListComponent', () => {
  let component: ReportingListComponent;
  let fixture: ComponentFixture<ReportingListComponent>;
  let widgetServiceSpy: WidgetService;
  let reportServiceSpy: ReportService;
  let router: Router;
  let schemaDetailsService: SchemaDetailsService
  let userService: UserService;
  let sharedService: SharedServiceService;
  let sharedServices: SharedServiceService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportingListComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, MatMenuModule, RouterTestingModule, SharedModule],
      providers: [WidgetService, SchemaDetailsService,ReportService, UserService, SharedServiceService]
    })
      .compileComponents();
    router = TestBed.inject(Router);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingListComponent);
    component = fixture.componentInstance;
    widgetServiceSpy = fixture.debugElement.injector.get(WidgetService);
    reportServiceSpy = fixture.debugElement.injector.get(ReportService);
    userService = fixture.debugElement.injector.get(UserService);
    sharedServices = fixture.debugElement.injector.get(SharedServiceService);
    component.reportingListFilterForm = new FormGroup({});

    component.tableColumnMetaData = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '1',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];

    component.filteredList = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: 'test',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      }
    ];

    component.selectedMultiSelectData = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: ['test', 'test2'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      },
      {
        fieldId: 'column',
        conditionFieldId: 'column',
        conditionFieldValue: ['test'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      }
    ];

    component.localFilterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: 'test',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      } as Criteria
    ];
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    userService = fixture.debugElement.injector.get(UserService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.initializeForm();
    expect(component.initializeForm).toBeTruthy();
  });

  it('getHeaderMetaData, return header data', async(() => {
    component.widgetId = 75656;
    const response: WidgetHeader = new WidgetHeader();
    response.pageDefaultSize = 25;
    response.displayCriteria = DisplayCriteria.TEXT;
    spyOn(widgetServiceSpy, 'getHeaderMetaData').withArgs(component.widgetId).and.returnValue(of(response));
    component.widgetHeader = response;
    component.getHeaderMetaData();
    expect(widgetServiceSpy.getHeaderMetaData).toHaveBeenCalledWith(component.widgetId);
    expect(component.pageSizeOption).toEqual([25, 100, 200, 300, 400]);
    expect(component.widgetHeader.displayCriteria).toEqual('TEXT');
    expect(component.pageSize).toEqual(25);
  }));

  it('getHeaderMetaData, return header data', async(() => {
    component.widgetId = 75656;
    const response: WidgetHeader = new WidgetHeader();
    component.widgetHeader = response;
    spyOn(widgetServiceSpy, 'getHeaderMetaData').withArgs(component.widgetId).and.returnValue(of(response));
    component.getHeaderMetaData();
    expect(widgetServiceSpy.getHeaderMetaData).toHaveBeenCalledWith(component.widgetId);
    expect(component.pageSizeOption).toEqual([100, 200, 300, 400]);
    expect(component.widgetHeader.displayCriteria).toEqual('CODE');
    expect(component.pageSize).toEqual(100);
  }));

  it('getListTableMetadata, return table data', async(() => {
    component.widgetId = 75656;
    component.allColumnMetaDataFields = {} as MetadataModeleResponse;
    const response: ReportingWidget[] = [{ widgetId: 75656, fields: 'test', fieldOrder: 'APPTEST', fieldDesc: 'testing', sno: 65467465, fldMetaData: { picklist: '4' } as MetadataModel, displayCriteria: DisplayCriteria.TEXT }];
    spyOn(widgetServiceSpy, 'getListTableMetadata').withArgs(component.widgetId, component.widgetInfo.objectType,component.widgetInfo).and.returnValue(of(response));
    spyOn(component, 'getFieldType').withArgs(response[0].fldMetaData).and.returnValue(of({ isHierarchy: false, isGrid: false }));
    component.getListTableMetadata();
    expect(widgetServiceSpy.getListTableMetadata).toHaveBeenCalledWith(component.widgetId, component.widgetInfo.objectType,component.widgetInfo);
    expect(component.getFieldType).toHaveBeenCalledWith(response[0].fldMetaData);
    expect(component.displayedColumnsId.length).toEqual(2);
  }));

  it('getServerData(), do pagination ', async(() => {
    // mock data
    const evnet = new PageEvent();
    evnet.pageIndex = 0;
    evnet.pageSize = 10;
    component.filterCriteria = [];
    component.userDetails={defLocs:['abc']} as Userdetails;
    const actualData = component.getServerData(evnet);
    expect(evnet.pageSize).toEqual(actualData.pageSize);
    expect(evnet.pageIndex).toEqual(actualData.pageIndex);
  }));

  // it('details(), get the url', async(() =>{
  //   const data = {ObjectNumber:''};
  //   component.objectType = '';
  //   component.details(data);
  //   expect(component.details(data)).not.toBe(null);
  // }))
  it('downloadCSV, download the data', async(() => {
    component.filterCriteria = [{ fieldId: 'test' } as Criteria, { fieldId: 'test1' } as Criteria];
    spyOn(router, 'navigate');
    const widgetId = component.widgetId;
    component.downloadCSV()
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/report/download-widget/${widgetId}` } }], { queryParams: { conditionList: `${JSON.stringify(component.filterCriteria)}` }, queryParamsHandling: 'merge' });
  }));

  it('sortTable(), sort the data in asc or desc ', async(() => {
    const sort: Sort = { active: '2', direction: 'asc' } as Sort;
    component.filterCriteria = [];
    component.userDetails={defLocs:['abc']} as Userdetails;
    component.sortTable(sort);

    expect(component.sortTable(sort)).not.toBe(null);

    const sort1: Sort = { active: '2', direction: '' } as Sort;
    component.sortTable(sort1);

    expect(component.sortTable(sort1)).not.toBe(null);

    expect(component.sortTable(null)).not.toBe(null);
  }));

  it('ngOnChanges(), should check if there are new filter criteria', async(() => {
    const filterCriteria = [{ fieldId: 'test' } as Criteria, { fieldId: 'test1' } as Criteria];
    const chnages: SimpleChanges = { filterCriteria: { currentValue: filterCriteria, previousValue: null, firstChange: null, isFirstChange: null } };
    spyOn(component.reportingListWidget, 'next');
    component.widgetHeader = { isEnableGlobalFilter: false } as WidgetHeader;
    component.ngOnChanges(chnages);
    expect(component.reportingListWidget.next).toHaveBeenCalled();

    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.ngOnChanges(chnages);
    expect(component.ngOnChanges).toBeTruthy();

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('getListdata(), should return the data of field', async(() => {
    const res = { data: { hits: { hits: [{ sourceAsMap: { stat: 'APP', staticFields: { OBJECTID: { fId: 'OBJECTID', ls: 'OBJECTID', vc: [{ c: 'C000164628' }] }, WFID: { fId: 'WFID', ls: 'WFID', vc: [{ c: '130086693666196566' }] }, REQUESTOR_DATE: { fId: 'REQUESTOR_DATE', ls: 'Requested Date', vc: [{ c: '1584440382535' }] }, TIME_TAKEN: { fId: 'TIME_TAKEN', ls: 'Time Taken', vc: [{ c: 97089034 }] }, FORWARDENABLED: { fId: 'FORWARDENABLED', ls: 'FORWARDENABLED', vc: [{ c: 1 }] }, OVERDUE: { fId: 'OVERDUE', ls: 'OVERDUE', vc: [{ c: 'n' }] } }, id: 103048380550997539 }, id: 103048380550997539, sort: [103048380550997539], _score: null }], total: { value: 1, relation: 'eq' }, max_score: null }, took: 4, timed_out: false }, count: 1 };
    const pageSize = 10;
    const pageIndex = 0;
    const widgetId = 1612965351574;
    const criteria = [];
    const soringMap = null;
    component.userDetails = {defLocs:['abc']} as Userdetails;
    component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.displayedColumnsId = ['REQUESTOR_DATE', 'WFID', 'objectNumber', 'OVERDUE', 'FORWARDENABLED', 'TIME_TAKEN'];
    const reportingW = [{ fields: 'REQUESTOR_DATE', fldMetaData: { dataType: 'DTMS', picklist: '1' } } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { dataType: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { dataType: '0' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW);
    component.widgetHeader = { displayCriteria: DisplayCriteria.CODE } as WidgetHeader;
    spyOn(widgetServiceSpy, 'getListdata').withArgs(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString()).and.returnValue(of(res));

    component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);

    expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
    expect(component.resultsLength).toEqual(1);
    expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
    expect(component.listData[0].WFID).toEqual('130086693666196566');
    expect(component.listData[0].OVERDUE).toEqual('No');
    expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
    expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
    expect(component.listData[0].objectNumber).toEqual(103048380550997540);

    component.widgetHeader = { displayCriteria: DisplayCriteria.TEXT } as WidgetHeader;
    component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);

    expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
    expect(component.resultsLength).toEqual(1);
    expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
    expect(component.listData[0].WFID).toEqual('130086693666196566');
    expect(component.listData[0].OVERDUE).toEqual('No');
    expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
    expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
    expect(component.listData[0].objectNumber).toEqual(103048380550997540);

    component.widgetHeader = { displayCriteria: DisplayCriteria.CODE_TEXT } as WidgetHeader;
    component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);

    expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
    expect(component.resultsLength).toEqual(1);
    expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
    expect(component.listData[0].WFID).toEqual('130086693666196566');
    expect(component.listData[0].OVERDUE).toEqual('No');
    expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
    expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
    expect(component.listData[0].objectNumber).toEqual(103048380550997540);

    component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);
    expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
    expect(component.resultsLength).toEqual(1);
    expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
    expect(component.listData[0].WFID).toEqual('130086693666196566');
    expect(component.listData[0].OVERDUE).toEqual('No');
    expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
    expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
    expect(component.listData[0].objectNumber).toEqual(103048380550997540);
  }));

  it('isDateType(),isDateType  case', async(() => {
    let result = component.isDateType('column');
    expect(result).toBeFalse();

    const reportingW = [{ fields: 'column', fldMetaData: { dataType: 'DTMS' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW);
    result = component.isDateType('column');
    expect(result).toBeTrue();


    const reportingW2 = [{ fields: 'column', fldMetaData: { dataType: 'CHAR', picklist: '1' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW2);
    result = component.isDateType('column');
    expect(result).toBeFalse();

    const reportingW3 = [{ fields: 'column' } as ReportingWidget];
    component.reportingListWidget.next(reportingW3);
    result = component.isDateType('column');
    expect(result).toBeFalse();
  }));

  it('isDropdownType(), should check field picklist is 1, 37, 30', async(() => {
    let result = component.isDropdownType('column');
    expect(result).toBeFalse();

    const reportingW = [{ fields: 'requestor_date', fldMetaData: { picklist: '1' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW);
    result = component.isDropdownType('requestor_date');
    expect(result).toBeTrue();

    const reportingW2 = [{ fields: 'Due_date', fldMetaData: { picklist: '30' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW2);
    result = component.isDropdownType('Due_date');
    expect(result).toBeTrue();

    const reportingW3 = [{ fields: 'forwarded_date', fldMetaData: { picklist: '37' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW3);
    result = component.isDropdownType('forwarded_date');
    expect(result).toBeTrue();

    const reportingW4 = [{ fields: 'TimeTaken' } as ReportingWidget];
    component.reportingListWidget.next(reportingW4);
    result = component.isDropdownType('TimeTaken');
    expect(result).toBeFalse();
  }));

  it('getDateTypeValue(), should check the value is number or not', async(() => {
    let fld = '7654345';
    expect(component.getDateTypeValue(fld)).toEqual(fld);

    fld = 'aftadrtsa';
    expect(component.getDateTypeValue(fld)).toEqual('');
  }));

  it('getFormFieldType(), return the form field type value', async(() => {
    component.tableColumnMetaData[0].fldMetaData = { picklist: '22', dataType: 'CHAR' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TEXTAREA);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'DATS' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.DATE);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'DTMS' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.DATE_TIME);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'true' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.MULTI_SELECT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'false' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.DROP_DOWN);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'TIMS' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TIME);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'CHAR' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'ALTN' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'ICSN' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'REQ' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'TEXT' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'NUMC' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.NUMBER);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'DEC' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.NUMBER);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.CHECKBOX);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '4' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.RADIO);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'ABCd' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toBeFalse();
    component.tableColumnMetaData[0].fldMetaData = { picklist: '20' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toBeFalse();

  }));


  it('configureFilters(), should open configure-filter window', async(() => {
    spyOn(router, 'navigate');
    component.configureFilters();
    expect(component.configureFilters).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: 'sb/report/configure-filters/' + component.widgetId } }]);
  }));


  it('getColumnDisplayCriteria(), should return display type', async(() => {
    component.tableColumnMetaData = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', picklist: '22', dataType: 'CHAR' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];

    const res = component.getColumnDisplayCriteria('MATL_GROUP');
    expect(res).toBe(component.tableColumnMetaData[0].displayCriteria)

  }));


  it('setFilter(), should set filters', async(() => {
    component.userDetails = { defLocs:['1001']}as Userdetails
    component.filterCriteria = [];
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    const event: any = {
      formFieldId: 'MATL_GROUP',
      value: [{
        CODE: 'CODE',
        TEXT: 'TEXT',
        PLANTCODE: '',
        LANGU: '',
        FIELDNAME: 'MATL_GROUP',
        SNO: '1'
      } as DropDownValue]
    };

    component.tableColumnMetaData = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', picklist: '1', isCheckList: 'true' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];

    spyOn(component, 'onFilterApplied');
    component.setFilter(event);
    expect(component.setFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '22', dataType: 'CHAR' } as MetadataModel;
    component.setFilter(event);
    expect(component.setFilter).toBeTruthy();
    expect(component.onFilterApplied).toHaveBeenCalled();
  }));


  it('clearFilter(), should clear filter', async(() => {
    component.userDetails = {defLocs:['1001']} as Userdetails;
    component.selectedMultiSelectData = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: ['test', 'test2'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      },
      {
        fieldId: 'column',
        conditionFieldId: 'column',
        conditionFieldValue: ['test'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      }
    ];
    component.filterCriteria = [];
    component.widgetId = 3673673;

    spyOn(reportServiceSpy, 'setFilterCriteria').withArgs([],component.widgetId);
    component.clearFilter(true);
    expect(component.selectedMultiSelectData[0].length).toBe(0);

  }));

  it('getRangeLimit(), should return range limit', async(() => {
    component.tableColumnMetaData = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', maxChar: '50' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];
    const res = component.getRangeLimit('MATL_GROUP', 'max');
    expect(res).toEqual(50);
  }));


  // it('onFilterApplied()', async(() => {
  //   // const res = { data: { hits: { hits: [{ sourceAsMap: { stat: 'APP', staticFields: { OBJECTID: { fId: 'OBJECTID', ls: 'OBJECTID', vc: [{ c: 'C000164628' }] }, WFID: { fId: 'WFID', ls: 'WFID', vc: [{ c: '130086693666196566' }] }, REQUESTOR_DATE: { fId: 'REQUESTOR_DATE', ls: 'Requested Date', vc: [{ c: '1584440382535' }] }, TIME_TAKEN: { fId: 'TIME_TAKEN', ls: 'Time Taken', vc: [{ c: 97089034 }] }, FORWARDENABLED: { fId: 'FORWARDENABLED', ls: 'FORWARDENABLED', vc: [{ c: 1 }] }, OVERDUE: { fId: 'OVERDUE', ls: 'OVERDUE', vc: [{ c: 'n' }] } }, id: 103048380550997539 }, id: 103048380550997539, sort: [103048380550997539], _score: null }], total: { value: 1, relation: 'eq' }, max_score: null }, took: 4, timed_out: false }, count: 1 };
  //   // const pageSize = 10;
  //   // const pageIndex = 0;
  //   // const criteria = [];
  //   // const widgetId = 1612965351574;
  //   // const soringMap = null;
  //   // spyOn(widgetServiceSpy, 'getListdata').withArgs(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap).and.returnValue(of(res));
  //   component.userDetails = {defLocs:['1001']} as Userdetails;
  //   component.filterCriteria = [];
  //   const value = {CODE:'test',TEXT:'test'};
  //   component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());

  //   component.reportingListFilterForm.controls.MATL_GROUP.setValue({ min: 10, max: 20 });

  //   component.onFilterApplied('MATL_GROUP', 'number');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.onFilterApplied('MATL_GROUP', 'radio', value);
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: new Date() });
  //   component.onFilterApplied('MATL_GROUP', 'date');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.onFilterApplied('MATL_GROUP', 'dropdown');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: { hours: '2', minutes: 23 }, end: { hours: 4, minutes: 32 } });
  //   component.onFilterApplied('MATL_GROUP', 'time');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: new Date() });
  //   component.onFilterApplied('MATL_GROUP', 'dateTime');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', '');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', 'number');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', 'radio', value);
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', 'date');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', 'dropdown');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', 'time');
  //   expect(component.onFilterApplied).toBeTruthy();

  //   component.filteredList = [];
  //   component.localFilterCriteria = [];
  //   component.onFilterApplied('MATL_GROUP', 'dateTime');
  //   expect(component.onFilterApplied).toBeTruthy();

  // }));


  it('ngOnInit()', async(() => {
    // component.ngOnInit();
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    spyOn(reportServiceSpy, 'sideSheetStatusChange')
      .withArgs().and.returnValue(of(true));
    spyOn(component, 'getUserDetails').and.callFake(() => of([]));
    spyOn(component, 'getHeaderMetaData').and.callFake(() => of([]))
    expect(component.ngOnInit).toBeTruthy();
    component.ngOnInit();
  }));


  it('getValue()', async(() => {
    const matl = 'MATL_GROUP';
    const column = 'column';
    component.dropDownValues[matl] = [{ CODE: 'test1', TEXT: 'text1' }];
    component.dropDownValues[column] = [{ CODE: 'test1', TEXT: 'text1' }];
    const res = component.getValue('MATL_GROUP');
    expect(res.length).toEqual(1);
  }));


  it('getUsetDetails()', async(() => {

    const res = { dateformat: 'mm.dd.yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('MM.dd.yyyy, h:mm:ss a');
  }));

  it('getUsetDetails(),when date format is dd.MM.yy', async(() => {

    const res = { dateformat: 'dd.MM.yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('dd.MM.yyyy, h:mm:ss a');
  }));

  it('getUsetDetails(),when date format is dd M, yy', async(() => {

    const res = { dateformat: 'dd M, yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('dd MMM, yyyy, h:mm:ss a');
  }));

  it('getUsetDetails(),when date format is MM d, yy', async(() => {

    const res = { dateformat: 'MM d, yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('MMMM d, yyyy, h:mm:ss a');
  }));

  it('getPreSelectedRangeValue()', async ()=>{
    component.localFilterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: null,
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: '10',
        conditionFieldEndValue: '20',
        udrid: null,
      } as Criteria
    ];

    const res = {max:'20',min:'10'};
    expect(component.getPreSelectedRangeValue('MATL_GROUP')).toEqual(res);
  })

  it('getSelectedDateValue()', async () =>{
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: new Date() });

    const result = component.reportingListFilterForm.controls.MATL_GROUP.value;
    expect(component.getSelectedDateValue('MATL_GROUP')).toEqual(result);
  })

  it('getSelectedTimeValue()', async () =>{
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: { hours: '2', minutes: 23 }, end: { hours: 4, minutes: 32 } });

    const result = component.reportingListFilterForm.controls.MATL_GROUP.value;
    expect(component.getSelectedTimeValue('MATL_GROUP')).toEqual(result);
  })

  it('getPreSelectedDropdownValue()', async ()=>{
    component.localFilterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: 'test',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      } as Criteria
    ];
    expect(component.getPreSelectedDropdownValue('MATL_GROUP')).toEqual('test');
  })
  it('getObjectData(), get display data according to its display criteria', async(() => {
    component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.getObjectData('Code', 'Value', 'REQUESTOR_DATE');
    expect(component.getObjectData('Code', 'Value', 'REQUESTOR_DATE')).toEqual('Value');

    const reportingW = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { dataType: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { dataType: '0' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW);
    component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.CODE_TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.getObjectData('Code', 'Value', 'REQUESTOR_DATE');
    expect(component.getObjectData('Code', 'Value', 'REQUESTOR_DATE')).toEqual('Code -- Value');

    // const reportingW = [{ fields: 'REQUESTOR_DATE', fldMetaData: {picklist: '1' } } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { dataType: '0' } } as ReportingWidget,{ fields: 'WFID', fldMetaData: { dataType: '0' } } as ReportingWidget,{ fields: 'TIME_TAKEN', fldMetaData: { dataType: '0' } } as ReportingWidget,{ fields: 'FORWARDENABLED', fldMetaData: { dataType: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { dataType: '0' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW);
    component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.CODE_TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.getObjectData('Code', null, 'REQUESTOR_DATE');
    expect(component.getObjectData('Code', null, 'REQUESTOR_DATE')).toEqual('Code -- Code');

    component.reportingListWidget.next(reportingW);
    component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.CODE_TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.getObjectData('Code', null, 'REQUESTOR_DATE');
    expect(component.getObjectData(null, null, 'REQUESTOR_DATE')).toEqual('');

    component.tableColumnMetaData = null;
    component.getObjectData('Code', null, 'REQUESTOR_DATE');
    expect(component.getObjectData(null, null, 'REQUESTOR_DATE')).toEqual(undefined);

    component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.getObjectData('Code', 'Value', 'REQUESTOR_DATE');
    expect(component.getObjectData('Code', 'Value', 'REQUESTOR_DATE')).toEqual(undefined);
  }));

  it('getFieldType,get field type for column', async(() => {
    let fldMetaData = { dataType: '0', parentField: 'ADD_EANDATA' } as MetadataModel;
    component.allColumnMetaDataFields = {
      headers: { MARA_NRFHG: { fieldId: 'MARA_NRFHG', fieldDescri: 'Qual.f.FreeGoodsDis' } },
      grids: { ADD_EANDATA: { fieldId: 'ADD_EANDATA', fieldDescri: 'Additional EAN Grid', dataType: 'CHAR', maxChar: '100' } },
      gridFields: { ADD_EANDATA: { ADD_EANCAT: { fieldId: 'ADD_EANCAT', fieldDescri: 'EAN category', dataType: 'CHAR', maxChar: '2', mandatory: '0' } } },
      hierarchy: [{ objnr: 1, heirarchyId: '1', heirarchyText: 'Plant Data', fieldId: 'PLANT', structureId: '0002' }],
      hierarchyFields: { 1: { ABC_ID: { fieldId: 'ABC_ID', fieldDescri: 'ABC Indicator', dataType: 'CHAR', maxChar: '1', mandatory: '0' } } },
    } as MetadataModeleResponse;
    component.getFieldType(fldMetaData);
    expect(component.getFieldType(fldMetaData)).toEqual({ isGrid: true, parentFieldId: 'ADD_EANDATA' });

    fldMetaData = { dataType: '0', parentField: 'PLANT' } as MetadataModel;
    component.getFieldType(fldMetaData);
    expect(component.getFieldType(fldMetaData)).toEqual({ isHierarchy: true, hierarchyId: '1' });

    fldMetaData = { dataType: '0', parentField: 'ABC' } as MetadataModel;
    component.getFieldType(fldMetaData);
    expect(component.getFieldType(fldMetaData)).toEqual({ isHierarchy: false, isGrid: false });

    fldMetaData = { dataType: '0', fieldId: 'ABC_ID' } as MetadataModel;
    component.getFieldType(fldMetaData);
    expect(component.getFieldType(fldMetaData)).toEqual({ isHierarchy: true, hierarchyId: '1' });

    fldMetaData = { dataType: '0', fieldId: 'ADD_EANCAT' } as MetadataModel;
    component.getFieldType(fldMetaData);
    expect(component.getFieldType(fldMetaData)).toEqual({ isGrid: true, parentFieldId: 'ADD_EANDATA' });

    fldMetaData = { dataType: '0', fieldId: 'MARA_NRFHG' } as MetadataModel;
    component.getFieldType(fldMetaData);
    expect(component.getFieldType(fldMetaData)).toEqual({ isGrid: false, isHierarchy: false });
  }))

  it('getMetaDataFields(), call api to get meta data fields', async(() => {
    const obj = '1005';
    const res = {
      headers: { MARA_NRFHG: { fieldId: 'MARA_NRFHG', fieldDescri: 'Qual.f.FreeGoodsDis' } },
      grids: { ADD_EANDATA: { fieldId: 'ADD_EANDATA', fieldDescri: 'Additional EAN Grid', dataType: 'CHAR', maxChar: '100' } },
      gridFields: { ADD_EANDATA: { ADD_EANCAT: { fieldId: 'ADD_EANCAT', fieldDescri: 'EAN category', dataType: 'CHAR', maxChar: '2', mandatory: '0' } } },
      hierarchy: [{ objnr: 1, heirarchyId: '1', heirarchyText: 'Plant Data', fieldId: 'PLANT', structureId: '0002' }],
      hierarchyFields: { 1: { ABC_ID: { fieldId: 'ABC_ID', fieldDescri: 'ABC Indicator', dataType: 'CHAR', maxChar: '1', mandatory: '0' } } },
    } as MetadataModeleResponse;
    spyOn(schemaDetailsService, 'getMetadataFields').withArgs(obj).and.returnValue(of(res));
    component.getMetaDataFields(obj);
    expect(schemaDetailsService.getMetadataFields).toHaveBeenCalledWith(obj);
  }))

  it('ngOnInit(), ngOnInit method called', async(() => {
    spyOn(component, 'getUserDetails');
    const response = { isRefresh: true }
    spyOn(sharedService, 'getReportDataTableSetting').and.returnValue(of(response));
    const res: WidgetHeader = new WidgetHeader();
    res.pageDefaultSize = 25;
    res.displayCriteria = DisplayCriteria.TEXT;
    spyOn(widgetServiceSpy,'getHeaderMetaData').and.returnValue(of(res));
    component.widgetHeader = {} as WidgetHeader;
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('getAlllayouts()', async(() => {
    const row = {WFID: '5487987654356'};
    component.widgetHeader = {objectType:'1005'} as WidgetHeader;
    component.roleId = 'admin';
    component.plantCode = '0';
    const res = [{sno:'675645789'}] as LayoutConfigWorkflowModel[];
    spyOn(reportServiceSpy, 'getAllLayoutsForSummary').withArgs(component.widgetHeader.objectType, row.WFID, component.roleId, component.plantCode).and.returnValue(of(res));
    component.getAlllayouts(row);

    expect(reportServiceSpy.getAllLayoutsForSummary).toHaveBeenCalledWith(component.widgetHeader.objectType, row.WFID, component.roleId, component.plantCode);
  }));

  it('openTableColumnSideSheet()', async(() => {
    component.tableColumnMetaData = [{ sno: 1,fieldOrder: '0' ,fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel } as ReportingWidget, { sno: 2, fieldOrder:'1', fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget];
    component.widgetHeader = {objectType:'1005', isWorkflowdataSet: true, displayCriteria: DisplayCriteria.CODE_TEXT} as WidgetHeader;
    component.widgetInfo = {widgetType:WidgetType.TABLE_LIST} as Widget;
    component.widgetId = 64567876;
    component.userDetails = {firstName: 'admin'} as Userdetails;
    spyOn(sharedServices, 'setReportDataTableSetting');
    spyOn(router, 'navigate');

    component.openTableColumnSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/report/column-settings/${component.widgetId}` } }]);
  }));

  it('emitEvtFilterCriteria(), should emit filterCriteria', async()=>{
    component.filterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: 'test',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      } as Criteria];

    component.emitEvtFilterCriteria();
    expect(component.emitEvtFilterCriteria).toBeTruthy()
  });
});
