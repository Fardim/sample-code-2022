import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountComponent } from './count.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { AggregationOperator, BlockType, ConditionOperator, Criteria, Widget, WidgetType } from '../../../_models/widget';
import { SharedModule } from '@modules/shared/shared.module';
import { Userdetails } from '@models/userdetails';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaStaticThresholdRes } from '@models/schema/schemalist';
import { UserService } from '@services/user/userservice.service';
import { Count } from '../../../_models/widget';

describe('CountComponent', () => {
  let component: CountComponent;
  let fixture: ComponentFixture<CountComponent>;
  let WidgetServiceSpy: WidgetService;
  let schemaDetailService: SchemaDetailsService;
  let schemaService: SchemaService;
  let userService : UserService

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule],
      providers: [SchemaDetailsService, SchemaService,WidgetService, UserService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountComponent);
    component = fixture.componentInstance;
    WidgetServiceSpy = fixture.debugElement.injector.get(WidgetService);
    schemaDetailService = fixture.debugElement.injector.get(SchemaDetailsService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    userService = fixture.debugElement.injector.get(UserService);
    component.widgetInfo = new Widget();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getCountMetadata(), return countMeatadata of the widget', async(() => {
    component.widgetId = 732864726783;
    const res = { widgetId: 732864726783, fieldId: '372636553', aggregationOperator: 'COUNT' } as Count;
    spyOn(WidgetServiceSpy, 'getCountMetadata').withArgs(component.widgetId).and.returnValue(of(res));
    component.getCountMetadata();
    expect(WidgetServiceSpy.getCountMetadata).toHaveBeenCalledWith(component.widgetId);
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.isFetchingData = true;
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'value_count#COUNT': { value: 46 } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.isFetchingData = true;
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const nestedData = {'nested#nested_tags': { 'value_count#COUNT': { value: 46 } }}
    const res = { aggregations:  nestedData};
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.isFetchingData = true;
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'scripted_metric#COUNT': { value: 46 } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
    expect(component.count).toEqual(46);

  }));

  it('getCountData(), return count of the widget, when widget data set is diwdataset for error count', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.isFetchingData = true;
    component.widgetInfo = { datasetType: 'diw_dataset', brs: '47873878,47878', objectType: '47667/859894894' ,defaultFilters : [{conditionFieldId:'__DIW_STATUS', conditionFieldValue:'SUCCESS'}]} as Widget;
    component.filterCriteria = [{ fieldId: '__DIW_STATUS', conditionFieldValue: 'ERROR' } as Criteria, { fieldId: 'MATL' } as Criteria];
    const response : SchemaStaticThresholdRes = {
      correctedCnt: 4,
      errorCnt: 1,
      exeEndDate: '0',
      exeStrtDate: '0',
      outdatedCnt: 5,
      schemaId: 'string',
      skippedCnt: 3,
      successCnt: 2,
      thresHoldStatus: 'DANGER',
      threshold: 0,
      totalCnt: 0
    } as SchemaStaticThresholdRes
    spyOn(component, 'transformFilterData');
    spyOn(schemaService, 'getSchemaThresholdStaticsV2').and.returnValue(of(response));
    component.getCountData(widgetId,criteria);
    expect(component.count).toEqual(1);
  }));

  it('getCountData(), return count of the widget, when widget data set is diwdataset for success count', async(() => {
    const widgetId = 732864726783;
    // const criteria = [];
    component.isFetchingData = true;
    component.widgetInfo = { datasetType: 'diw_dataset', brs: '47873878,47878', objectType: '47667/859894894' ,defaultFilters : [{conditionFieldId:'__DIW_STATUS', conditionFieldValue:'SUCCESS'}]} as Widget;
    component.filterCriteria = [{ fieldId: 'MATL' } as Criteria];
    const response : SchemaStaticThresholdRes = {
      correctedCnt: 4,
      errorCnt: 1,
      exeEndDate: '0',
      exeStrtDate: '0',
      outdatedCnt: 5,
      schemaId: 'string',
      skippedCnt: 3,
      successCnt: 2,
      thresHoldStatus: 'DANGER',
      threshold: 0,
      totalCnt: 0
    } as SchemaStaticThresholdRes
    spyOn(component, 'transformFilterData');
    spyOn(schemaService, 'getSchemaThresholdStaticsV2').and.returnValue(of(response));
    component.getCountData(widgetId,[]);
    expect(component.count).toEqual(2);
  }));

  it('getCountData(), return count of the widget, when widget data set is diwdataset for correction count', async(() => {
    const widgetId = 732864726783;
    // const criteria = [];
    component.isFetchingData = true;
    component.widgetInfo = { datasetType: 'diw_dataset', brs: '47873878,47878', objectType: '47667/859894894' ,defaultFilters : [{conditionFieldId:'__DIW_STATUS', conditionFieldValue:'CORR'}]} as Widget;
    component.filterCriteria = [{ fieldId: 'MATL' } as Criteria];
    const response : SchemaStaticThresholdRes = {
      correctedCnt: 4,
      errorCnt: 1,
      exeEndDate: '0',
      exeStrtDate: '0',
      outdatedCnt: 5,
      schemaId: 'string',
      skippedCnt: 3,
      successCnt: 2,
      thresHoldStatus: 'DANGER',
      threshold: 0,
      totalCnt: 0
    } as SchemaStaticThresholdRes
    spyOn(component, 'transformFilterData');
    spyOn(schemaService, 'getSchemaThresholdStaticsV2').and.returnValue(of(response));
    component.getCountData(widgetId,[]);
    expect(component.count).toEqual(4);
  }));


  it('getCountData(), return count of the widget, when widget data set is diwdataset for outdated count', async(() => {
    const widgetId = 732864726783;
    // const criteria = [];
    component.isFetchingData = true;
    component.widgetInfo = { datasetType: 'diw_dataset', brs: '47873878,47878', objectType: '47667/859894894' ,defaultFilters : [{conditionFieldId:'__DIW_STATUS', conditionFieldValue:'OUTDATED'}]} as Widget;
    component.filterCriteria = [{ fieldId: 'MATL' } as Criteria];
    const response : SchemaStaticThresholdRes = {
      correctedCnt: 4,
      errorCnt: 1,
      exeEndDate: '0',
      exeStrtDate: '0',
      outdatedCnt: 5,
      schemaId: 'string',
      skippedCnt: 3,
      successCnt: 2,
      thresHoldStatus: 'DANGER',
      threshold: 0,
      totalCnt: 0
    } as SchemaStaticThresholdRes
    spyOn(component, 'transformFilterData');
    spyOn(schemaService, 'getSchemaThresholdStaticsV2').and.returnValue(of(response));
    component.getCountData(widgetId,[]);
    expect(component.count).toEqual(5);
  }));

  it('getCountData(), return count of the widget, when widget data set is diwdataset for skipped count', async(() => {
    const widgetId = 732864726783;
    // const criteria = [];
    component.isFetchingData = true;
    component.widgetInfo = { datasetType: 'diw_dataset', brs: '47873878,47878', objectType: '47667/859894894' ,defaultFilters : [{conditionFieldId:'__DIW_STATUS', conditionFieldValue:'SKIPPED'}]} as Widget;
    component.filterCriteria = [{ fieldId: 'MATL' } as Criteria];
    const response : SchemaStaticThresholdRes = {
      correctedCnt: 4,
      errorCnt: 1,
      exeEndDate: '0',
      exeStrtDate: '0',
      outdatedCnt: 5,
      schemaId: 'string',
      skippedCnt: 3,
      successCnt: 2,
      thresHoldStatus: 'DANGER',
      threshold: 0,
      totalCnt: 0
    } as SchemaStaticThresholdRes
    spyOn(component, 'transformFilterData');
    spyOn(schemaService, 'getSchemaThresholdStaticsV2').and.returnValue(of(response));
    component.getCountData(widgetId,[]);
    expect(component.count).toEqual(3);
  }));

  it('getCountData(), return count of the widget, when widget data set is diwdataset for default case', async(() => {
    const widgetId = 732864726783;
    // const criteria = [];
    component.isFetchingData = true;
    component.widgetInfo = { datasetType: 'diw_dataset', brs: '47873878,47878', objectType: '47667/859894894' ,defaultFilters : null} as Widget;
    component.filterCriteria = [{ fieldId: 'MATL' } as Criteria];
    const response : SchemaStaticThresholdRes = {
      correctedCnt: 4,
      errorCnt: 1,
      exeEndDate: '0',
      exeStrtDate: '0',
      outdatedCnt: 5,
      schemaId: 'string',
      skippedCnt: 3,
      successCnt: 2,
      thresHoldStatus: 'DANGER',
      threshold: 0,
      totalCnt: 0
    } as SchemaStaticThresholdRes
    spyOn(component, 'transformFilterData');
    spyOn(schemaService, 'getSchemaThresholdStaticsV2').and.returnValue(of(response));

    component.getCountData(widgetId,[]);
    expect(component.count).toEqual(0);
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    const changes: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null } };
    component.widgetInfo.isEnableGlobalFilter = true;
    component.widgetId = 732864726783;
    component.filterCriteria = [];
    component.ngOnChanges(changes);
    expect(component.widgetInfo.isEnableGlobalFilter).toEqual(true);

    const changes1: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: [], previousValue: false, firstChange: null, isFirstChange: null } };
    component.widgetInfo.isEnableGlobalFilter = true;
    component.ngOnChanges(changes1);
    expect(component.showClearButton).toEqual(false);

    component.widgetInfo.isEnableGlobalFilter = false;
    spyOn(component, 'getCountData');
    component.ngOnChanges(changes);
    expect(component.getCountData).toHaveBeenCalled();

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();

    const Changes: import('@angular/core').SimpleChanges = { widgetInfo: { currentValue: { displayCriteria: 'CODE', widgetId: '1234' }, previousValue: { displayCriteria: 'TEXT', widgetId: '1234' }, firstChange: null, isFirstChange: null } }
    component.widgetId = 732864726783;
    component.editedMode = true;
    const widgetId = 732864726783;
    const criteria = [];
    const res = { widgetId: 732864726783, fieldId: '372636553', aggregationOperator: 'COUNT' } as Count;
    spyOn(WidgetServiceSpy, 'getCountMetadata').withArgs(component.widgetId).and.returnValue(of(res));
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res1 = { aggregations: { 'nested#Nest_Count': { doc_count: 2, 'value_count#COUNT': { value: 2 } } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res1));
    component.ngOnChanges(Changes);
    expect(component.ngOnChanges).toBeTruthy();

  }));

  it('clearFilter(), should clear the filter', async(() => {
    // mock data
    const resp: Count = {
      aggregationOperator: AggregationOperator.COUNT,
      fieldId: 'STATUS',
      isFieldDistinct: false,
      widgetId: 1625747719737,
      filterCriteria: [{
        udrid: '3242342',
        conditionFieldId: 'STATUS',
        conditionFieldValue: 'INP',
        fieldId: 'STATUS',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: '',
        conditionFieldEndValue: '',
        widgetType: WidgetType.BAR_CHART,
      } as Criteria]
    }
    component.countWidget = resp;
    component.filterCriteria = resp.filterCriteria;
    component.clearFilter();
    expect(component.showClearButton).toEqual(false);
  }));

  it('emitEvtFilterCriteria(), should trigger emitEvtFilterCriteria', async(() => {
    // mock data
    const resp: Count = {
      aggregationOperator: AggregationOperator.COUNT,
      fieldId: 'STATUS',
      isFieldDistinct: false,
      widgetId: 1625747719737,
      filterCriteria: [{
        udrid: '3242342',
        conditionFieldId: 'STATUS',
        conditionFieldValue: 'INP',
        fieldId: 'STATUS',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: '',
        conditionFieldEndValue: '',
        widgetType: WidgetType.BAR_CHART,
      } as Criteria]
    }
    component.filterCriteria = [];
    component.countWidget = resp;
    const event = new MouseEvent('click');
    component.emitEvtFilterCriteria(event);
    expect(component.showClearButton).toEqual(true);
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'nested#Nest_Count': { doc_count: 2, 'value_count#COUNT': { value: 2 } } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'nested#Nest_Count': { doc_count: 2, 'scripted_metric#COUNT': { value: 2 } } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'sum#COUNT': { value: 2 } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return median count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'tdigest_percentiles#COUNT': { values: [{value:2}] } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return mode count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    const res = { aggregations: { 'sterms#COUNT': { buckets: [{doc_count:2}] } } };
    spyOn(WidgetServiceSpy, 'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId, criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('openSchemaDetailsTab()', async () => {
    component.widgetId = 732864726783;
    component.widgetInfo = { brs: '476736767,478787878', objectType: '3434/4758748' } as Widget;
    const response = { adminPermission: '' };
    component.filterCriteria = [{ conditionFieldId: 'STATUS', conditionFieldValue: 'INP', fieldId: 'STATUS' } as Criteria, { conditionFieldId: 'STATUS', conditionFieldValue: 'SYS', fieldId: 'STATUS' } as Criteria];

    spyOn(schemaDetailService, 'checkPermissionForSchemaDetails').withArgs('4758748').and.returnValue(of(response));
    component.openSchemaDetailsTab();
    expect(component.openSchemaDetailsTab).toBeTruthy();
  });

  it('ngOnInit()', async(()=>{
    component.widgetId = 437674;
    const response = { defLocs: ['abc'] } as Userdetails;
    spyOn(component,'getCountMetadata');
    spyOn(userService, 'getUserDetails').withArgs().and.returnValue(of(response));
    spyOn(component,'getCountData');
    component.ngOnInit();
    expect(component.isFetchingData).toBeTrue();

  }))
});
