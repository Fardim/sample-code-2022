import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountComponent } from './count.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { Count, WidgetHeader, BlockType, AggregationOperator, ConditionOperator, WidgetType, Criteria } from '@modules/report/_models/widget';
import { SharedModule } from '@modules/shared/shared.module';
import { Userdetails } from '@models/userdetails';

describe('CountComponent', () => {
  let component: CountComponent;
  let fixture: ComponentFixture<CountComponent>;
  let WidgetServiceSpy: WidgetService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountComponent ],
      imports:[AppMaterialModuleForSpec,HttpClientTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountComponent);
    component = fixture.componentInstance;
    WidgetServiceSpy = fixture.debugElement.injector.get(WidgetService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getHeaderMetaData(), return HeaderMeatadata of the widget', async(() => {
    component.widgetId = 732864726783;
    const res = {widgetName: 'CountWidget'} as WidgetHeader;
    spyOn(WidgetServiceSpy,'getHeaderMetaData').withArgs(component.widgetId).and.returnValue(of(res));
    component.getHeaderMetaData();
    expect(WidgetServiceSpy.getHeaderMetaData).toHaveBeenCalledWith(component.widgetId);
    expect(component.widgetHeader.widgetName).toEqual(res.widgetName);
  }));

  it('getCountMetadata(), return countMeatadata of the widget', async(() => {
    component.widgetId = 732864726783;
    const res = {widgetId: 732864726783, fieldId: '372636553', aggregationOperator: 'COUNT'} as Count;
    spyOn(WidgetServiceSpy,'getCountMetadata').withArgs(component.widgetId).and.returnValue(of(res));
    component.getCountMetadata();
    expect(WidgetServiceSpy.getCountMetadata).toHaveBeenCalledWith(component.widgetId);
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails={defLocs:['abc']} as Userdetails;
    const res = {aggregations: {'value_count#COUNT': {value: 46}}};
    spyOn(WidgetServiceSpy,'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId,criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails={defLocs:['abc']} as Userdetails;
    const res = {aggregations: {'scripted_metric#COUNT': {value: 46}}};
    spyOn(WidgetServiceSpy,'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId,criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
    expect(component.count).toEqual(46);

  }));

  it('ngOnChanges(), while change rule type', async(()=>{
    // mock data
    const changes: import('@angular/core').SimpleChanges = {filterCriteria:{currentValue:true, previousValue:false,firstChange:null,isFirstChange:null}};
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.ngOnChanges(changes);
    expect(component.widgetHeader.isEnableGlobalFilter).toEqual(true);

    component.widgetHeader = { isEnableGlobalFilter: false } as WidgetHeader;
    spyOn(component,'getCountData');
    component.ngOnChanges(changes);
    expect(component.getCountData).toHaveBeenCalled();

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('clearFilter(), should clear the filter', async(()=>{
    // mock data
    const resp: Count = {
      aggregationOperator: AggregationOperator.COUNT,
      fieldId: 'STATUS',
      isFieldDistinct: false,
      widgetId: 1625747719737,
      filterCriteria:[{
            udrid: '3242342',
            conditionFieldId:'STATUS',
            conditionFieldValue:'INP',
            fieldId: 'STATUS',
            blockType: BlockType.COND,
            conditionOperator: ConditionOperator.EQUAL,
            conditionFieldStartValue: '',
            conditionFieldEndValue: '',
            widgetType: WidgetType.BAR_CHART,
      } as Criteria]
    }
    component.countWidget =  resp;
    component.filterCriteria = resp.filterCriteria;
    component.clearFilter();
    expect(component.showClearButton).toEqual(false);
  }));

  it('emitEvtFilterCriteria(), should trigger emitEvtFilterCriteria', async(()=>{
    // mock data
    const resp: Count = {
      aggregationOperator: AggregationOperator.COUNT,
      fieldId: 'STATUS',
      isFieldDistinct: false,
      widgetId: 1625747719737,
      filterCriteria:[{
            udrid: '3242342',
            conditionFieldId:'STATUS',
            conditionFieldValue:'INP',
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
    component.userDetails={defLocs:['abc']} as Userdetails;
    const res = {aggregations:{'nested#Nest_Count':{doc_count:2,'value_count#COUNT':{value:2}}}};
    spyOn(WidgetServiceSpy,'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId,criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails={defLocs:['abc']} as Userdetails;
    const res = {aggregations:{'nested#Nest_Count':{doc_count:2,'scripted_metric#COUNT':{value:2}}}};
    spyOn(WidgetServiceSpy,'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId,criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getCountData(), return count of the widget', async(() => {
    const widgetId = 732864726783;
    const criteria = [];
    component.userDetails={defLocs:['abc']} as Userdetails;
    const res = {aggregations:{'sum#COUNT':{value:2}}};
    spyOn(WidgetServiceSpy,'getWidgetData').withArgs(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(res));
    component.getCountData(widgetId,criteria);
    expect(WidgetServiceSpy.getWidgetData).toHaveBeenCalledWith(String(widgetId), criteria, '', '', '', component.userDetails.defLocs.toString());
  }));
});
