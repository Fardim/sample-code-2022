import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingListComponent } from './reporting-list.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { WidgetService } from '@services/widgets/widget.service';
import { ReportingWidget, Criteria, DisplayCriteria, BlockType, ConditionOperator, FormControlType, Widget, WidgetTableModel, WidgetType } from '../../../_models/widget';
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
import { WidgetHeader } from '@modules/report/_models/widget';
import { CoreService } from '@services/core/core.service';

describe('ReportingListComponent', () => {
  let component: ReportingListComponent;
  let fixture: ComponentFixture<ReportingListComponent>;
  let widgetServiceSpy: WidgetService;
  let reportServiceSpy: ReportService;
  let router: Router;
  let schemaDetailsService: SchemaDetailsService
  let userService: UserService;
  let sharedService: SharedServiceService;
  let coreService: CoreService;
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
    component.widgetInfo = new Widget();
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    userService = fixture.debugElement.injector.get(UserService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    coreService = fixture.debugElement.injector.get(CoreService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.initializeForm();
    expect(component.initializeForm).toBeTruthy();
  });

  it('getListTableMetadata, return table data', async(() => {
    component.widgetId = 75656;
    component.widgetInfo.objectType = '1005';
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
    component.filterCriteria = [{fieldId:'__DIW_STATUS'} as Criteria];
    spyOn(component.reportingListWidget, 'next');
    component.widgetInfo.isEnableGlobalFilter = false;
    component.widgetId = 473748374
    component.ngOnChanges(chnages);
    expect(component.reportingListWidget.next).toHaveBeenCalled();

    component.widgetInfo.isEnableGlobalFilter = true;
    component.ngOnChanges(chnages);
    expect(component.ngOnChanges).toBeTruthy();

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();

    const Changes: SimpleChanges = {filterCriteria:{currentValue:[],previousValue:null,isFirstChange:null, firstChange:null},widgetInfo:{currentValue: {displayCriteria: 'CODE',widgetId:'1234'}, previousValue: {displayCriteria: 'TEXT',widgetId:'1234'}, firstChange: null, isFirstChange: null }}
    const reportingW = [{ fields: 'REQUESTOR_DATE', fldMetaData: { dataType: 'DTMS', picklist: '1' } } as ReportingWidget];
    component.reportingListWidget.next(reportingW);
    component.editedMode = true;
    component.widgetId = 4378737483;
    component.widgetInfo.isEnableGlobalFilter = false;
    spyOn(component, 'getUserDetails').and.callFake(() => of([]));
    spyOn(widgetServiceSpy,'getHeaderMetaData').withArgs(component.widgetId).and.returnValue(of({} as WidgetHeader));
    spyOn(component,'getListTableMetadata');
    spyOn(component,'configData');
    component.ngOnChanges(Changes);
    expect(component.ngOnChanges).toBeTruthy();
    expect(component.hasFilterCriteria).toBeTrue();
    expect(component.isFetchingData).toBeTrue()
  }));

  // it('getListdata(), should return the data of field', async(() => {
  //   component.filterCriteria = [];
  //   component.widgetInfo.objectType = '1005';
  //   component.userDetails = {defLocs : ['1001']} as Userdetails;
  //   const res = { data: { hits: { hits: [{ sourceAsMap: { stat: 'APP', staticFields: { OBJECTID: { fId: 'OBJECTID', ls: 'OBJECTID', vc: [{ c: 'C000164628' }] }, WFID: { fId: 'WFID', ls: 'WFID', vc: [{ c: '130086693666196566' }] }, REQUESTOR_DATE: { fId: 'REQUESTOR_DATE', ls: 'Requested Date', vc: [{ c: '1584440382535' }] }, TIME_TAKEN: { fId: 'TIME_TAKEN', ls: 'Time Taken', vc: [{ c: 97089034 }] }, FORWARDENABLED: { fId: 'FORWARDENABLED', ls: 'FORWARDENABLED', vc: [{ c: 1 }] }, OVERDUE: { fId: 'OVERDUE', ls: 'OVERDUE', vc: [{ c: 'n' }] } }, id: 103048380550997539 }, id: 103048380550997539, sort: [103048380550997539], _score: null }], total: { value: 1, relation: 'eq' }, max_score: null }, took: 4, timed_out: false }, count: 1 };
  //   const pageSize = 10;
  //   const pageIndex = 0;
  //   const widgetId = 1612965351574;
  //   const criteria = [];
  //   const soringMap = null;
  //   component.isFetchingData = true;
  //   component.widgetInfo.widgetTableFields = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget] as unknown as WidgetTableModel[];
  //   component.tableColumnMetaData = [{ fields: 'REQUESTOR_DATE', fldMetaData: { picklist: '1', fieldId: 'REQUESTOR_DATE' } as MetadataModel, displayCriteria: DisplayCriteria.TEXT } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { picklist: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { picklist: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { picklist: '0' } } as ReportingWidget];
  //   component.displayedColumnsId = ['REQUESTOR_DATE', 'WFID', 'objectNumber', 'OVERDUE', 'FORWARDENABLED', 'TIME_TAKEN'];
  //   const reportingW = [{ fields: 'REQUESTOR_DATE', fldMetaData: { dataType: 'DTMS', picklist: '1' } } as ReportingWidget, { fields: 'objectNumber', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'WFID', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'TIME_TAKEN', fldMetaData: { dataType: '0' } } as ReportingWidget, { fields: 'FORWARDENABLED', fldMetaData: { dataType: '1' } } as ReportingWidget, { fields: 'OVERDUE', fldMetaData: { dataType: '0' } } as ReportingWidget];
  //   component.reportingListWidget.next(reportingW);
  //   component.widgetInfo.displayCriteria = DisplayCriteria.CODE;
  //   spyOn(widgetServiceSpy, 'getListdata').withArgs(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString()).and.returnValue(of(res));

  //   component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);

  //   expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
  //   expect(component.resultsLength).toEqual(1);
  //   expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
  //   expect(component.listData[0].WFID).toEqual('130086693666196566');
  //   expect(component.listData[0].OVERDUE).toEqual('No');
  //   expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
  //   expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
  //   expect(component.listData[0].objectNumber).toEqual(103048380550997540);

  //   component.widgetInfo.displayCriteria = DisplayCriteria.TEXT;
  //   component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);

  //   expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
  //   expect(component.resultsLength).toEqual(1);
  //   expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
  //   expect(component.listData[0].WFID).toEqual('130086693666196566');
  //   expect(component.listData[0].OVERDUE).toEqual('No');
  //   expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
  //   expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
  //   expect(component.listData[0].objectNumber).toEqual(103048380550997540);

  //   component.widgetInfo.displayCriteria = DisplayCriteria.CODE_TEXT;
  //   component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);

  //   expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
  //   expect(component.resultsLength).toEqual(1);
  //   expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
  //   expect(component.listData[0].WFID).toEqual('130086693666196566');
  //   expect(component.listData[0].OVERDUE).toEqual('No');
  //   expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
  //   expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
  //   expect(component.listData[0].objectNumber).toEqual(103048380550997540);

  //   component.getListdata(pageSize, pageIndex, widgetId, criteria, soringMap);
  //   expect(widgetServiceSpy.getListdata).toHaveBeenCalledWith(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, component.userDetails.defLocs.toString());
  //   expect(component.resultsLength).toEqual(1);
  //   expect(component.listData[0].REQUESTOR_DATE).toEqual('1584440382535');
  //   expect(component.listData[0].WFID).toEqual('130086693666196566');
  //   expect(component.listData[0].OVERDUE).toEqual('No');
  //   expect(component.listData[0].FORWARDENABLED).toEqual('Yes');
  //   expect(component.listData[0].TIME_TAKEN).toEqual('1 d 2 h 58 m 9 s');
  //   expect(component.listData[0].objectNumber).toEqual(103048380550997540);
  // }));

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

    component.tableColumnMetaData[0].fldMetaData = { picklist: '29' } as MetadataModel;
    expect(component.getFormFieldType('MATL_GROUP')).toEqual(FormControlType.HIERARCHY);
    component.tableColumnMetaData = [];
    expect(component.getFormFieldType('MATL_GROUP')).toBeFalsy();

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
    const event1: any = {
      formFieldId: 'MATL_GROUP',
      value: {
        start:3377847873,
        end:48787874877
      }
    };

    component.tableColumnMetaData[0].fldMetaData = { dataType: 'DTMS' } as MetadataModel;
    component.setFilter(event1);
    expect(component.setFilter).toBeTruthy();
    expect(component.onFilterApplied).toHaveBeenCalled();
  }));


  it('clearFilter(), should clear filter', async(() => {
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
    component.widgetId = 74874874;
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


  it('onFilterApplied()', async(() => {
    // const res = { data: { hits: { hits: [{ sourceAsMap: { stat: 'APP', staticFields: { OBJECTID: { fId: 'OBJECTID', ls: 'OBJECTID', vc: [{ c: 'C000164628' }] }, WFID: { fId: 'WFID', ls: 'WFID', vc: [{ c: '130086693666196566' }] }, REQUESTOR_DATE: { fId: 'REQUESTOR_DATE', ls: 'Requested Date', vc: [{ c: '1584440382535' }] }, TIME_TAKEN: { fId: 'TIME_TAKEN', ls: 'Time Taken', vc: [{ c: 97089034 }] }, FORWARDENABLED: { fId: 'FORWARDENABLED', ls: 'FORWARDENABLED', vc: [{ c: 1 }] }, OVERDUE: { fId: 'OVERDUE', ls: 'OVERDUE', vc: [{ c: 'n' }] } }, id: 103048380550997539 }, id: 103048380550997539, sort: [103048380550997539], _score: null }], total: { value: 1, relation: 'eq' }, max_score: null }, took: 4, timed_out: false }, count: 1 };
    // const pageSize = 10;
    // const pageIndex = 0;
    // const criteria = [];
    // const widgetId = 1612965351574;
    // const soringMap = null;
    // spyOn(widgetServiceSpy, 'getListdata').withArgs(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap).and.returnValue(of(res));
    const value = {CODE:'test',TEXT:'test'};
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    component.filterCriteria = [{fieldId:'MATL_GROUP', widgetId:47873747} as any]
    component.widgetId = 47873747;

    component.onFilterApplied('MATL_GROUP', 'number');
    expect(component.onFilterApplied).toBeTruthy();

    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ min: 10, max: 20 });

    component.onFilterApplied('MATL_GROUP','number');
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'number');
    expect(component.onFilterApplied).toBeTruthy();

    component.onFilterApplied('MATL_GROUP', 'radio', value);
    expect(component.onFilterApplied).toBeTruthy();

    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: new Date() });
    component.onFilterApplied('MATL_GROUP', 'date');
    expect(component.onFilterApplied).toBeTruthy();

    component.onFilterApplied('MATL_GROUP', 'dropdown');
    expect(component.onFilterApplied).toBeTruthy();

    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: { hours: '2', minutes: 23 }, end: { hours: 4, minutes: 32 } });
    component.onFilterApplied('MATL_GROUP', 'time');
    expect(component.onFilterApplied).toBeTruthy();

    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: new Date() });
    component.onFilterApplied('MATL_GROUP', 'dateTime');
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', '');
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'number');
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'radio', value);
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'date');
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'dropdown');
    expect(component.onFilterApplied).toBeTruthy();

    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'time');
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    component.onFilterApplied('MATL_GROUP', 'dateTime');
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end:null });
    component.onFilterApplied('MATL_GROUP', 'dateTime');
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: null, end:new Date() });
    component.onFilterApplied('MATL_GROUP', 'dateTime');
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: null, end: new Date() });
    component.onFilterApplied('MATL_GROUP', 'date');
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: null });
    component.onFilterApplied('MATL_GROUP', 'date');
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    const value2 = [];
    component.onFilterApplied('MATL_GROUP', 'multiselectDropdown',value2);
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [];
    component.filterCriteria = [];
    const value1 = [{CODE:'test',TEXT:'test'}];
    component.onFilterApplied('MATL_GROUP', 'multiselectDropdown',value1);
    expect(component.onFilterApplied).toBeTruthy();

    component.filteredList = [{fieldId:'MATL_GROUP', conditionFieldValue : 'Value'}];
    component.filterCriteria = [{fieldId:'MATL_GROUP', conditionFieldValue : 'Val'} as Criteria];
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date(), end: null });
    component.onFilterApplied('MATL_GROUP', 'multiselectDropdown',[{CODE:'M',TEXT:'Mechanics'}]);
    expect(component.onFilterApplied).toBeTruthy();

  }));


  it('ngOnInit()', async(() => {
    // component.ngOnInit();
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    spyOn(reportServiceSpy, 'sideSheetStatusChange')
      .withArgs().and.returnValue(of(true));
    spyOn(component, 'getUserDetails').and.callFake(() => of([]));
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

  it('getUsetDetails(),when date format is MM d, yy', async(() => {

    const res = { dateformat: '' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toBeFalsy();
  }));

  it('getPreSelectedRangeValue()', async ()=>{
    component.filterCriteria = [
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

    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: new Date() });
    const result1 = component.reportingListFilterForm.controls.MATL_GROUP.value.start;
    const res = component.getSelectedDateValue('MATL_GROUP');
    expect(res.start).toEqual(result1);

    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ end: new Date() });
    const result2 = component.reportingListFilterForm.controls.MATL_GROUP.value.end;
    const res2 = component.getSelectedDateValue('MATL_GROUP');
    expect(res2.end).toEqual(result2);


  })

  it('getSelectedTimeValue()', async () =>{
    component.reportingListFilterForm.addControl('MATL_GROUP', new FormControl());
    component.reportingListFilterForm.controls.MATL_GROUP.setValue({ start: { hours: '2', minutes: 23 }, end: { hours: 4, minutes: 32 } });

    const result = component.reportingListFilterForm.controls.MATL_GROUP.value;
    expect(component.getSelectedTimeValue('MATL_GROUP')).toEqual(result);
  })

  it('getPreSelectedDropdownValue()', async ()=>{
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

    fldMetaData = { dataType: '0', parentField: 'PLANT', fieldId: 'PLANT' } as MetadataModel;
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
    // spyOn(schemaDetailsService, 'getMetadataFields').withArgs(obj).and.returnValue(of(res));
    spyOn(coreService, 'getMetadataFieldsByModuleId').withArgs([obj]).and.returnValue(of(res));
    component.getMetaDataFields(obj);
    expect(coreService.getMetadataFieldsByModuleId).toHaveBeenCalled();
  }))

  it('ngOnInit(), ngOnInit method called', async(() => {
    spyOn(component, 'getUserDetails');
    const response = { isRefresh: true }
    spyOn(sharedService, 'getReportDataTableSetting').and.returnValue(of(response));
    expect(component.ngOnInit).toBeTruthy();
  }))

  it('emitEvtFilterCriteria(), should emit filterCriteria', async(()=>{
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
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for text type field',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.TEXT);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    const fieldId = '36767';
    component.appliedSelectedFilter(filterCriteria);
    expect(component.reportingListFilterForm.controls[fieldId].value).toEqual('text');
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for textarea type field',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.TEXTAREA);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    const fieldId = '36767';
    component.appliedSelectedFilter(filterCriteria);
    expect(component.reportingListFilterForm.controls[fieldId].value).toEqual('text');
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for checkbox type field',async(()=>{
    const fieldId = '36767';
    const spy = spyOn(component,'getFormFieldType').withArgs(fieldId).and.returnValue(FormControlType.CHECKBOX);
    component.reportingListFilterForm.addControl(fieldId,new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      fieldId,
      conditionFieldId:fieldId,
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    expect(component.reportingListFilterForm.controls[fieldId].value).toEqual('text');
    expect(spy).toHaveBeenCalled();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for drop down field',async(()=>{
    const fieldId = '364764';
    const spy = spyOn(component,'getFormFieldType').withArgs(fieldId).and.returnValue(FormControlType.DROP_DOWN);
    component.reportingListFilterForm.addControl(fieldId,new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      conditionFieldValueText:'TEXT',
      fieldId,
      conditionFieldId:fieldId,
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    expect(component.reportingListFilterForm.controls[fieldId].value).toEqual('text');
    expect(spy).toHaveBeenCalled();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for multiselect drop down',async(()=>{
    const fieldId = '36767';
    const spy = spyOn(component,'getFormFieldType').withArgs(fieldId).and.returnValue(FormControlType.MULTI_SELECT);
    component.reportingListFilterForm.addControl(fieldId,new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      conditionFieldValueText:'TEXT',
      fieldId,
      conditionFieldId:fieldId,
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.selectedMultiSelectData[fieldId] = [];
    component.appliedSelectedFilter(filterCriteria);
    expect(component.selectedMultiSelectData[fieldId].length).toEqual(1);
    expect(spy).toHaveBeenCalled();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for multiselect drop down',async(()=>{
    const fieldId = '36767';
    const spy = spyOn(component,'getFormFieldType').withArgs(fieldId).and.returnValue(FormControlType.MULTI_SELECT);
    component.reportingListFilterForm.addControl(fieldId,new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      conditionFieldValueText:'TEXT',
      fieldId,
      conditionFieldId:fieldId,
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.selectedMultiSelectData = {};
    component.appliedSelectedFilter(filterCriteria);
    expect(component.selectedMultiSelectData[fieldId].length).toEqual(1);
    expect(spy).toHaveBeenCalled();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for multiselect drop down',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.RADIO);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldValue : 'text',
      conditionFieldValueText:'TEXT',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    const fieldId = '36767';
    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.reportingListFilterForm.controls[fieldId].value).toEqual('text');
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for date type',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.DATE);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldStartValue : '574875847',
      conditionFieldEndValue:'48784748',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.appliedSelectedFilter).toBeTruthy();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for date time type',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.DATE_TIME);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldStartValue : '574875847',
      conditionFieldEndValue:'48784748',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    expect(spy).toHaveBeenCalled();
    expect(component.appliedSelectedFilter).toBeTruthy();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for time type',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.TIME);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldStartValue : '574875847',
      conditionFieldEndValue:'48784748',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    expect(spy).toHaveBeenCalled();
    expect(component.appliedSelectedFilter).toBeTruthy();
  }));

  it('appliedSelectedFilter(), set the applied filter in form control for number type',async(()=>{
    const spy = spyOn(component,'getFormFieldType').withArgs('36767').and.returnValue(FormControlType.NUMBER);
    component.reportingListFilterForm.addControl('36767',new FormControl());
    const filterCriteria: Criteria = {
      conditionFieldStartValue : '0',
      conditionFieldEndValue:'1',
      fieldId:'36767',
      conditionFieldId:'36767',
      widgetId:23764676737,
      widgetType : WidgetType.FILTER
    } as Criteria;
    component.appliedSelectedFilter(filterCriteria);
    expect(spy).toHaveBeenCalled();
    expect(component.appliedSelectedFilter).toBeTruthy();
  }));

  it('getSelectedFieldMetaData(), return field meta data', async()=>{
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
    const res = component.getSelectedFieldMetaData('MATL_GROUP');
    expect(res.widgetId).toEqual(1);
  });

  it('getSelectedFieldMetaData(), return field meta data', async()=>{
    component.tableColumnMetaData = [];
    const res = component.getSelectedFieldMetaData('MATL_GROUP');
    expect(res).toBeFalsy();
  });
});
