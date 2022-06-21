import { async, ComponentFixture, fakeAsync, TestBed, tick, } from '@angular/core/testing';

import { PropertyPanelComponent } from './property-panel.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbComponent } from 'src/app/_modules/shared/_components/breadcrumb/breadcrumb.component';
import { SvgIconComponent } from '@modules/shared/_components/svg-icon/svg-icon.component';
import { ReportService } from '@modules/report/_service/report.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaService } from '@services/home/schema.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AggregationOperator, BucketFilter, ChartType, DatalabelsPosition, DateSelectionType, DisplayCriteria, FilterWith, LegendPosition, OrderWith, Orientation, Report, ReportDashboardPermission, SeriesWith, TimeseriesStartDate, Widget, WidgetAdditionalProperty, WidgetTableModel, WidgetType } from '@modules/report-v2/_models/widget';
import { UserService } from '@services/user/userservice.service';
import { MetadataModel, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { of } from 'rxjs';
import { Metadata, MetadatafieldControlComponent } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ReportList } from '@modules/report/report-list/report-list.component';
import { Userdetails } from '@models/userdetails';
import { Dataset, ObjectTypeResponse } from '@models/schema/schema';
import { ElementRef, SimpleChange, SimpleChanges } from '@angular/core';
import { SlaStepSize } from '@modules/report/_models/widget';
import { WorkflowDatasetComponent } from '@modules/report/edit/container/workflow-dataset/workflow-dataset.component';
import { UdrConditionOperatorsComponent } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-condition-operators/udr-condition-operators.component';
import { MockElementRef } from '@modules/shared/_directives/resizeable.directive.spec';
import { CoreService } from '@services/core/core.service';
import { DmsService } from '@services/dms/dms.service';

describe('PropertyPanelComponent', () => {
  let component: PropertyPanelComponent;
  let fixture: ComponentFixture<PropertyPanelComponent>;
  let reportService: ReportService;
  let schemaDetailsService: SchemaDetailsService;
  let coreService : CoreService;
  let schemaService: SchemaService;
  let userService: UserService;
  let dmsService: DmsService;
  let elRef: ElementRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyPanelComponent, BreadcrumbComponent, SvgIconComponent, MetadatafieldControlComponent, WorkflowDatasetComponent, UdrConditionOperatorsComponent],
      imports: [AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        ReportService,
        SchemaDetailsService,
        CoreService,
        SchemaService,
        { provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }
      ]
    })
      .compileComponents();

      elRef = TestBed.inject(ElementRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyPanelComponent);
    component = fixture.componentInstance;

    reportService = fixture.debugElement.injector.get(ReportService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    coreService = fixture.debugElement.injector.get(CoreService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    userService = fixture.debugElement.injector.get(UserService);
    dmsService = fixture.debugElement.injector.get(DmsService);

    component.report = new Report();
    component.report.reportId = 111;
    component.widgetInfo = {
      x: 10, y: 20, rows: 1, cols: 1, widgetId: '12345', widgetType: WidgetType.BAR_CHART,
      widgetTitle: 'Table', field: 'Table', aggregrationOp: AggregationOperator.COUNT,
      filterType: FilterWith.DROPDOWN_VALS, isMultiSelect: false, orderWith: OrderWith.ASC,
      groupById: '1234', widgetTableFields: null, htmlText: null, imagesno: null, imageName: null,
      imageUrl: null, objectType: null, chartProperties: {
        chartType: ChartType.BAR, orientation: Orientation.VERTICAL,
        isEnableDatalabels: false, datalabelsPosition: DatalabelsPosition.center,
        isEnableLegend: true, legendPosition: LegendPosition.top,
        xAxisLabel: 'x', yAxisLabel: 'y', orderWith: OrderWith.ASC,
        scaleFrom: 1, scaleTo: 100, stepSize: 10, dataSetSize: 100,
        seriesWith: SeriesWith.day, seriesFormat: null, blankValueAlias: null,
        timeseriesStartDate: TimeseriesStartDate.D7, isEnabledBarPerc: false,
        bucketFilter: BucketFilter.WITHIN_1_DAY, hasCustomSLA: true,
        showTotal: true, slaType: null, slaValue: '9'
      },
      defaultFilters: null, fieldCtrl: null, groupByIdCtrl: null, dateFilterCtrl: null, isWorkflowdataSet: false,
      workflowPath: [], distictWith: null, isCustomdataSet: true, pageDefaultSize: 100, isFieldDistinct: false, displayCriteria: DisplayCriteria.CODE,
      isEnableGlobalFilter: false, applyDistinct: false, rangeBucketSize: null, rangeBucketLimit: null, rangeCalculationFld: null, isEnableRange: false, rangeDateFormatInterval: null
    } as Widget;
    component.report.widgets = [component.widgetInfo];
    component.selStyleWid = {
      x: 10, y: 20, rows: 1, cols: 1, widgetId: '12345', widgetType: WidgetType.BAR_CHART,
      widgetTitle: 'Table', field: 'Table', aggregrationOp: AggregationOperator.COUNT,
      filterType: FilterWith.DROPDOWN_VALS, isMultiSelect: false, orderWith: OrderWith.ASC,
      groupById: '1234', widgetTableFields: null, htmlText: null, imagesno: null, imageName: null,
      imageUrl: null, objectType: null, chartProperties: {
        chartType: ChartType.BAR, orientation: Orientation.VERTICAL,
        isEnableDatalabels: false, datalabelsPosition: DatalabelsPosition.center,
        isEnableLegend: true, legendPosition: LegendPosition.top,
        xAxisLabel: 'x', yAxisLabel: 'y', orderWith: OrderWith.ASC,
        scaleFrom: 1, scaleTo: 100, stepSize: 10, dataSetSize: 100,
        seriesWith: SeriesWith.day, seriesFormat: null, blankValueAlias: null,
        timeseriesStartDate: TimeseriesStartDate.D7, isEnabledBarPerc: false,
        bucketFilter: BucketFilter.WITHIN_1_DAY, hasCustomSLA: true,
        showTotal: true, slaType: null, slaValue: '9'
      },
      defaultFilters: null, fieldCtrl: null, groupByIdCtrl: null, dateFilterCtrl: null, isWorkflowdataSet: false,
      workflowPath: [], distictWith: null, isCustomdataSet: true, pageDefaultSize: 100, isFieldDistinct: false, displayCriteria: DisplayCriteria.CODE,
      isEnableGlobalFilter: false, applyDistinct: false, rangeBucketSize: null, rangeBucketLimit: null, rangeCalculationFld: null, isEnableRange: false, rangeDateFormatInterval: null
    } as Widget;
    component.showReportSettings = false;
    component.dataSets = [{ moduleDesc: 'Category Attribute', moduleId: '10' } as Dataset, { moduleDesc: 'Additional', moduleId: '11' } as Dataset];
    component.customDataSets = [{ objectdesc: 'Module permission', objectid: 'Module_Permission' }, { objectdesc: 'Number of logins', objectid: 'numberoflogin' }];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setWidgetProp(), should set prop', async(() => {
    component.bucketFilter = [
      { key: BucketFilter.WITHIN_1_DAY, value: $localize`:@@withinSLA:Within time limit` },
      { key: BucketFilter.MORE_THEN_1_DAY, value: $localize`:@@exceedsSLA:Exceeds time limit` }
    ];

    component.timeInterval = [
      { key: SeriesWith.millisecond, value: $localize`:@@today:Today` },
      { key: TimeseriesStartDate.D7, value: TimeseriesStartDate.D7 },
      { key: TimeseriesStartDate.D10, value: TimeseriesStartDate.D10 },
      { key: TimeseriesStartDate.D20, value: TimeseriesStartDate.D20 },
      { key: TimeseriesStartDate.D30, value: TimeseriesStartDate.D30 },
    ];

    component.filterType = [
      { key: FilterWith.DROPDOWN_VALS, value: $localize`:@@dropdownValue: Dropdown value` },
      { key: FilterWith.HORIZONTAL_VALS, value: $localize`:@@horizontalValue:Horizontal value` },
      { key: FilterWith.VERTICAL_VALS, value: $localize`:@@verticalValue:Vertical value` }
    ];

    component.orderWith = [
      { key: OrderWith.ASC, value: $localize`:@@ascending :Ascending` },
      { key: OrderWith.DESC, value: $localize`:@@descending:Descending` },
      { key: OrderWith.ROW_ASC, value: $localize`:@@rowAscending:Row ascending` },
      { key: OrderWith.ROW_DESC, value: $localize`:@@rowDescending : Row descending` },
      { key: OrderWith.COL_ASC, value: $localize`:@@columnAscending : Column Ascending` },
      { key: OrderWith.COL_DESC, value: $localize`:@@columnDescending:Column Descending` }
    ];

    component.seriesWith = [
      { key: SeriesWith.day, value: $localize`:@@day:Day` },
      { key: SeriesWith.week, value: $localize`:@@week:Week` },
      { key: SeriesWith.month, value: $localize`:@@month:Month` },
      { key: SeriesWith.quarter, value: $localize`:@@quarter:Quarter` },
      { key: SeriesWith.year, value: $localize`:@@year:Year` }
    ];

    component.aggregrationOp = [
      { key: AggregationOperator.GROUPBY, value: $localize`:@@groupBy:Group by` },
      { key: AggregationOperator.COUNT, value: $localize`:@@count:Count` },
      { key: AggregationOperator.SUM, value: $localize`:@@sum:Sum` }
    ];

    component.displayCriteria = [
      { key: DisplayCriteria.CODE, value: $localize`:@@code:Code` },
      { key: DisplayCriteria.TEXT, value: $localize`:@@text:Text` },
      { key: DisplayCriteria.CODE_TEXT, value: $localize`:@@codeAndText:Code & Text` }
    ];

    component.chartType = [
      { key: ChartType.BAR, value: $localize`:@@bar:Bar` },
      { key: ChartType.PIE, value: $localize`:@@pie:Pie` },
      { key: ChartType.LINE, value: $localize`:@@line: Line` }
    ];

    component.orientation = [
      { key: Orientation.VERTICAL, value: $localize`:@@vertical:Vertical` },
      { key: Orientation.HORIZONTAL, value: $localize`:@@horizontal:Horizontal` }
    ];

    component.datalabelsPosition = [
      { key: DatalabelsPosition.center, value: $localize`:@@center:Center` },
      { key: DatalabelsPosition.start, value: $localize`:@@start:Start` },
      { key: DatalabelsPosition.end, value: $localize`:@@end:End` }
    ];

    component.legendPosition = [
      { key: LegendPosition.top, value: $localize`:@@top:Top` },
      { key: LegendPosition.left, value: $localize`:@@left:Left` },
      { key: LegendPosition.bottom, value: $localize`:@@bottom:Bottom` },
      { key: LegendPosition.right, value: $localize`:@@right:Right` }
    ];

    component.dateSelectionType = [
      { key: DateSelectionType.TODAY, value: $localize`:@@today:Today` },
      { key: DateSelectionType.DAY_7, value: $localize`:@@7Days:7 days` },
      { key: DateSelectionType.DAY_10, value: $localize`:@@10Days : 10 days` },
      { key: DateSelectionType.DAY_20, value: $localize`:@@20Days:20 days` },
      { key: DateSelectionType.DAY_30, value: $localize`:@@30Days:30 days` },
      { key: DateSelectionType.CUSTOM, value: $localize`:@@customDate:Custom date` },
    ];

    component.slaMenu = [
      { key: SeriesWith.hour, value: $localize`:@@hour:Hour` },
      { key: SeriesWith.day, value: $localize`:@@day:Day` }
    ];

    const data: Widget = {
      x: 1, y: 1, cols: 1, rows: 0, widgetId: '12345', widgetType: WidgetType.BAR_CHART,
      widgetTitle: 'Table', field: 'Table', aggregrationOp: AggregationOperator.COUNT,
      filterType: FilterWith.DROPDOWN_VALS, isMultiSelect: false, orderWith: OrderWith.ASC,
      groupById: '1234', widgetTableFields: null, htmlText: null, imagesno: null, imageName: null,
      imageUrl: null, objectType: '10', chartProperties: {
        chartType: ChartType.BAR, orientation: Orientation.VERTICAL,
        isEnableDatalabels: false, datalabelsPosition: DatalabelsPosition.center,
        isEnableLegend: true, legendPosition: LegendPosition.top,
        xAxisLabel: 'x', yAxisLabel: 'y', orderWith: OrderWith.ASC,
        scaleFrom: 1, scaleTo: 100, stepSize: 10, dataSetSize: 100,
        seriesWith: SeriesWith.day, seriesFormat: null, blankValueAlias: null,
        timeseriesStartDate: TimeseriesStartDate.D7, isEnabledBarPerc: false,
        bucketFilter: BucketFilter.WITHIN_1_DAY, hasCustomSLA: true,
        showTotal: true, slaType: null, slaValue: '9'
      },
      isStepwiseSLA: false,
      isDIWDataset : false,
      workflowPathSteps: null,
      defaultFilters: null, fieldCtrl: null, groupByIdCtrl: null, dateFilterCtrl: null, isWorkflowdataSet: false,
      workflowPath: [], distictWith: null, isCustomdataSet: false, pageDefaultSize: 100, isFieldDistinct: false, displayCriteria: DisplayCriteria.CODE,
      isEnableGlobalFilter: false, applyDistinct: false, rangeBucketSize: null, rangeBucketLimit: null, rangeCalculationFld: null, isEnableRange: false, rangeDateFormatInterval: null,
      widgetAdditionalProperties: {} as WidgetAdditionalProperty, measureFld:null,
    }
    component.styleCtrlGrp = new FormGroup({});
    component.ngOnInit();
    component.setWidgetProp(data);
    expect(component.selStyleWid).toBeTruthy();
    expect(component.styleCtrlGrp.value.widgetName).toEqual(component.selStyleWid.widgetTitle);
    expect(component.datasetCtrl.value).toEqual(component.dataSets[0]);

    data.objectType = 'Module_Permission';
    data.isCustomdataSet = true;
    component.setWidgetProp(data);
    expect(component.datasetCtrl.value).toEqual(component.customDataSets[0]);

    data.objectType = '1005,1008';
    data.isWorkflowdataSet = true;
    data.isCustomdataSet = false;
    component.setWidgetProp(data);
    expect(component.datasetCtrl.value).toEqual('');
  }));

  it('isSelected(), check the field is selcted or not', async(() => {
    const isSelectedObj = { fieldId: 'Matl_TYPE' } as MetadataModel;
    component.chooseColumns = [{ fields: 'Matl_TYPE' } as WidgetTableModel];
    expect(component.isSelected(isSelectedObj)).toEqual(true, 'If the fld is exit on choose column then return true');
    component.chooseColumns = [];
    expect(component.isSelected(isSelectedObj)).toEqual(false, 'If the fld is not exit on choose column then return false');

  }));

  it('preapreForDraftSave(), should not save reprt', async(() => {
    component.preapreForDraftSave(component.selStyleWid);
    expect(component.selStyleWid).toEqual(component.widgetInfo);
  }));

  // it('preapreForDraftSave(), should save reprt', async(() => {
  //   spyOn(component.saveDraft, 'emit');
  //   component.selStyleWid.widgetTitle = 'test';
  //   component.selStyleWid.chartProperties.chartType = ChartType.PIE;
  //   expect(component.selStyleWid).not.toEqual(component.widgetInfo);
  //   component.preapreForDraftSave(component.selStyleWid);
  //   expect(component.selStyleWid).toEqual(component.widgetInfo);
  //   fixture.detectChanges();
  //   expect(component.saveDraft.emit).toHaveBeenCalled();
  // }));

  // it('ngOnInit(), check all pre require', fakeAsync(() => {
  //   component.ngOnInit();
  //   expect(component.subscriptions.length).toEqual(7, 'Size should be 8');

  //   component.showReportSettings = true;
  //   component.report.reportName = 'test';
  //   component.ngOnInit();
  //   expect(component.reportCtrlGrp.value.reportName).toEqual(component.report.reportName);

  //   component.reportCtrlGrp.setValue({ reportName: 'newvalue', reportDesciption: '' });
  //   tick(1000);
  //   fixture.detectChanges();
  //   expect(component.report.reportName).toBe('newvalue');
  // }));

  it('ngOnChanges(), check change of widgetInfo', async(() => {
    component.widgetInfo.widgetId = '435';
    const changes: SimpleChanges = {
      widgetInfo: new SimpleChange(component.selStyleWid, component.widgetInfo, false)
    };
    spyOn(component, 'unsubscribeProp');
    spyOn(component, 'setWidgetProp');
    spyOn(component, 'initValueChanges');
    component.ngOnChanges(changes);
    expect(component.selStyleWid).toEqual(component.widgetInfo);
    expect(component.unsubscribeProp).toHaveBeenCalled();
    expect(component.setWidgetProp).toHaveBeenCalled();
    expect(component.initValueChanges).toHaveBeenCalled();
  }));

  // it('initValueChanges(), check all valueChanges', async(() => {
  //   component.initWidgetProperty();
  //   component.initValueChanges();
  //   expect(component.styleSub).not.toBeUndefined();
  //   expect(component.chartPropSub).not.toBeUndefined();
  //   expect(component.defaultFilterSub).not.toBeUndefined();

  //   spyOn(component.saveQueue, 'next');
  //   component.styleCtrlGrp.setValue({
  //     widgetName: 'Bar',
  //     field: 'MATL_TYPE',
  //     aggregrationOp: '',
  //     filterType: '',
  //     isMultiSelect: false,
  //     orderWith: {
  //       key: 'desc',
  //       value: 'Descending'
  //     },
  //     groupById: null,
  //     objectType: '1005',
  //     imageUrl: null,
  //     htmlText: null,
  //     imagesno: null,
  //     imageName: null,
  //     dateSelectionType: null,
  //     date: '',
  //     // startDate: '',
  //     // endDate: '',
  //     isWorkflowdataSet: false,
  //     workflowPath: [],
  //     distictWith: '',
  //     isCustomdataSet: false,
  //     pageDefaultSize: '',
  //     isFieldDistinct: false,
  //     displayCriteria: null,
  //     isEnableGlobalFilter: false,
  //     applyDistinct: false,
  //     rangeBucketSize: null,
  //     rangeBucketLimit: null,
  //     rangeCalculationFld: '',
  //     isEnableRange: false,
  //     rangeDateFormatInterval: '',
  //     measureFld:null,
  //     brs:'',
  //     datasetType : ''
  //   });
  //   fixture.detectChanges();
  //   expect(component.saveQueue.next).toHaveBeenCalled();

  //   component.selStyleWid.widgetType = WidgetType.TIMESERIES;
  //   component.selStyleWid.field = 'TIME_TAKEN';
  //   component.chartPropCtrlGrp.setValue({
  //     chartType: { key: 'BAR', value: 'Bar' },
  //     orientation: {
  //       key: 'VERTICAL',
  //       value: 'Vertical'
  //     },
  //     isEnableDatalabels: false,
  //     datalabelsPosition: {
  //       key: 'center',
  //       value: 'Center'
  //     },
  //     isEnableLegend: false,
  //     legendPosition: {
  //       key: 'top',
  //       value: 'Top'
  //     },
  //     xAxisLabel: '',
  //     yAxisLabel: '',
  //     orderWith: {
  //       key: 'ROW_DESC',
  //       value: ' Row descending'
  //     },
  //     scaleFrom: null,
  //     scaleTo: null,
  //     stepSize: null,
  //     dataSetSize: null,
  //     seriesWith: {
  //       key: 'month',
  //       value: 'Month'
  //     },
  //     seriesFormat: 'MMM-dd-yy',
  //     blankValueAlias: null,
  //     timeseriesStartDate: {
  //       key: '10',
  //       value: '10'
  //     },
  //     isEnabledBarPerc: false,
  //     bucketFilter: {
  //       key: 'within_1_day',
  //       value: 'Within time limit'
  //     },
  //     hasCustomSLA: false,
  //     slaValue: null,
  //     slaType: { key: 'hour', value: 'Hour' },
  //     showTotal: true,
  //     selectSLASteps: [],
  //     isStepWiseSla: null,
  //     benchMarkValue : null,
  //     isEnableBenchMark: false
  //   });
  //   fixture.detectChanges();
  //   expect(component.saveQueue.next).toHaveBeenCalled();

  //   component.defaultFilterCtrlGrp.controls.filters.patchValue([{
  //     blockDesc: null,
  //     conditionFieldStartValue: null,
  //     conditionValueFieldId: null,
  //     id: null,
  //     objectType: null,
  //     plantCode: null,
  //     conditionFieldId: 'USERMODIFIED',
  //     conditionFieldValue: '',
  //     blockType: 'COND',
  //     conditionFieldEndValue: 'USERMODIFIED',
  //     conditionOperator: 'FIELD2FIELD_EQUAL',
  //     udrid: 1629858969242,
  //     showRangeFld: true
  //   }]);
  //   fixture.detectChanges();
  //   expect(component.saveQueue.next).toHaveBeenCalled();
  //   expect(component.selStyleWid.defaultFilters).toEqual(component.defaultFilterCtrlGrp.value.filters);

  // }));

  // it('initWidgetProperty(), check all pre require', async(() => {
  //   component.showReportSettings = false;
  //   component.dataSets = [{ moduleDesc: 'Category Attribute', moduleId: '10' } as Dataset, { moduleDesc: 'Additional', moduleId: '11' } as Dataset];
  //   component.customDataSets = [{ objectdesc: 'Module permission', objectid: 'Module_Permission' }, { objectdesc: 'Number of logins', objectid: 'numberoflogin' }];
  //   component.selStyleWid = null;
  //   spyOn(component, 'setWidgetProp');
  //   component.initWidgetProperty();
  //   component.dataSetOb.subscribe(res => expect(res).toEqual(component.dataSets));
  //   component.customDataSetob.subscribe(res => expect(res).toEqual(component.customDataSets));
  //   expect(component.selStyleWid).toEqual(component.widgetInfo);
  //   expect(component.setWidgetProp).toHaveBeenCalledWith(component.selStyleWid);

  //   spyOn(component.styleSub, 'unsubscribe');
  //   spyOn(component.chartPropSub, 'unsubscribe');
  //   spyOn(component.defaultFilterSub, 'unsubscribe');
  //   component.unsubscribeProp();
  //   expect(component.styleSub.unsubscribe).toHaveBeenCalled();
  //   expect(component.chartPropSub.unsubscribe).toHaveBeenCalled();
  //   expect(component.defaultFilterSub.unsubscribe).toHaveBeenCalled();
  // }));

  it('closePanel(), should call emit', async(() => {
    spyOn(component.close, 'emit');
    component.closePanel();
    expect(component.close.emit).toHaveBeenCalled();
  }));

  it('ngOnDestroy(), should unsubscribe from all observable', async(() => {
    const sub = of({}).subscribe()
    component.subscriptions.push(sub)
    spyOn(component.subscriptions[0], 'unsubscribe');
    spyOn(component, 'unsubscribeProp');
    component.ngOnDestroy();
    expect(component.subscriptions[0].unsubscribe).toHaveBeenCalled();
    expect(component.unsubscribeProp).toHaveBeenCalled();
  }));

  it(`addMoreDefaultFilter(), should add controles to formArray`, async(() => {
    // initialize form array
    component.defaultFilterCtrlGrp = new FormGroup({ filters: new FormArray([]) });
    const selStyleWid = new Widget();
    selStyleWid.widgetId = '274774721';
    component.selStyleWid = selStyleWid;
    // call actual method
    component.addMoreDefaultFilter();
    const frmArray = component.defaultFilterCtrlGrp.controls.filters as FormArray;
    expect(frmArray.length).toEqual(1, `Check length of defaultFilterCtrlGrp should be 1`);
  }));

  it('removeFilter(), should remove item from array', async(() => {
    // initialize form array
    component.defaultFilterCtrlGrp = new FormGroup({ filters: new FormArray([new FormGroup({})]) });

    // call actual method
    component.removeFilter(0);
    const frmArray = component.defaultFilterCtrlGrp.controls.filters as FormArray;
    expect(frmArray.length).toEqual(0, `After remove from array list  length should be 0`);
  }));

  it('onDefaultFilterChange(), while change value on defould filter', async(() => {
    // mock data
    const metaData = { fieldId: 'MATL_DESC', fieldDescri: 'Desc' } as Metadata;
    const option = { option: { value: metaData } } as MatAutocompleteSelectedEvent;
    const index = 0;

    // call actual method
    component.defaultFilterCtrlGrp = new FormGroup({
      filters: new FormArray([new FormGroup({
        conditionFieldId: new FormControl('')
      })])
    });
    component.onDefaultFilterChange(option, index);

    const frmArray = component.defaultFilterCtrlGrp.controls.filters as FormArray;
    expect(frmArray.length).toEqual(1, 'length should be 1');
    expect(frmArray.at(index).get('conditionFieldId').value).toEqual(metaData.fieldId, `Field id should equals ${metaData.fieldId}`);
  }));

  it('onGroupByChange(), while change value on group by id', async(() => {
    // mock data
    const metaData = { fieldId: 'MATL_DESC', fieldDescri: 'Desc' } as Metadata;
    const option = { option: { value: metaData } } as MatAutocompleteSelectedEvent;
    spyOn(reportService, 'getReportConfi').withArgs('', '').and.returnValue(of());
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([]));
    // call actual method
    component.ngOnInit();
    component.onGroupByChange(option);
    expect(component.styleCtrlGrp.get('groupById').value.fieldId).toEqual(metaData.fieldId, 'Group by id should equals ${metaData.fieldId}');
  }));

  it('onFieldChange(), while change value on field id', async(() => {
    // mock data
    const metaData = { fieldId: 'MATL_DESC', fieldDescri: 'Desc' } as Metadata;
    const option = { option: { value: metaData } } as MatAutocompleteSelectedEvent;
    const reportList: ReportList = new ReportList();
    reportList.permission = new ReportDashboardPermission();
    const user: Userdetails = new Userdetails()
    spyOn(userService, 'getUserDetails').and.returnValue(of(user));

    spyOn(reportService, 'getReportConfi').withArgs('', '').and.returnValue(of());
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([]));
    // call actual method
    component.ngOnInit();
    component.onFieldChange(option);
    expect(component.styleCtrlGrp.get('field').value).toEqual(metaData, 'Field id should equals ${metaData.fieldId}');
    const option1 = { option: { value: {fldCtrl : metaData} } } as MatAutocompleteSelectedEvent;
    component.onFieldChange(option1);
    expect(component.styleCtrlGrp.get('field').value).toEqual(metaData, 'Field id should equals ${metaData.fieldId}');
  }));

  it('getAllFields(), get all fields', async(() => {

    spyOn(coreService, 'getMetadataFieldsByModuleId').withArgs(['1005'],'').and.returnValue(of({} as MetadataModeleResponse));
    component.getAllFields('1005');

    expect(coreService.getMetadataFieldsByModuleId).toHaveBeenCalledWith(['1005'],'');

  }));

  it('onDefaultFilterEndValChange(), while change value on default filter', async(() => {
    // mock data
    const metaData = { fieldId: 'MATL_DESC', fieldDescri: 'Desc' } as Metadata;
    const option = { option: { value: metaData } } as MatAutocompleteSelectedEvent;
    const index = 0;

    // call actual method
    component.defaultFilterCtrlGrp = new FormGroup({
      filters: new FormArray([new FormGroup({
        conditionFieldEndValue: new FormControl('')
      })])
    });
    component.onDefaultFilterEndValChange(option, index);

    const frmArray = component.defaultFilterCtrlGrp.controls.filters as FormArray;
    expect(frmArray.length).toEqual(1, 'length should be 1');
    expect(frmArray.at(index).get('conditionFieldEndValue').value).toEqual(metaData.fieldId, `Field id should equals ${metaData.fieldId}`);
  }));

  // it('searchDataSet(), should search data set', async (done) => {
  //   component.dataSets = [{ moduleDesc: 'Category Attribute', moduleId: '10' } as Dataset , { moduleDesc: 'Additional', moduleId: '10' } as Dataset];
  //   component.customDataSets = [{ objectdesc: 'Module permission', objectid: 'Module_Permission' }, { objectdesc: 'Number of logins', objectid: 'numberoflogin' }];
  //   component.dataSets = [];
  //   component.searchDataSet('');
  //   expect(component.searchDataSet).toBeTruthy();

  //   component.searchDataSet('text');
  //   expect(component.searchDataSet).toBeTruthy();
  //   done();
  // });

  it('searchCustomChooseColumn(), should search custom choose column', async () => {
    // component.Customfields = [{fieldDescri: "User"},{fieldDescri: "Not"}];
    component.Customfields = [];
    component.searchCustomChooseColumn('');
    expect(component.searchCustomChooseColumn).toBeTruthy();

    component.searchCustomChooseColumn('text');
    expect(component.searchCustomChooseColumn).toBeTruthy();
  });

  it('searchChooseColumnWorkflow(),should search work flow choose column', async () => {
    // component.workflowFields = { static: [{fieldDescri: "Lot. Size"},{fieldDescri: "size"}], dynamic: [{fieldDescri:"SAP Number"},{fieldDescri: Additional}]};
    component.workflowFields = { static: [], dynamic: [], hierarchy: [] };
    component.searchChooseColumnWorkflow('');
    expect(component.searchChooseColumnWorkflow).toBeTruthy();

    component.searchChooseColumnWorkflow('');
    expect(component.searchChooseColumnWorkflow).toBeTruthy();

    component.searchChooseColumnWorkflow('test');
    expect(component.searchChooseColumnWorkflow).toBeTruthy();
  });

  it('operatorSelectionChng()', async () => {
    component.defaultFilterCtrlGrp = new FormGroup({
      filters: new FormArray([new FormGroup({
        conditionOperator: new FormControl('')
      })])
    });
    const frmArray = component.defaultFilterCtrlGrp.controls.filters as FormArray;
    component.operatorSelectionChng('Equal', 0);
    expect(frmArray.at(0).get('conditionOperator').value).toEqual('Equal');
  });

  it('removeUploadedImage(), should remove image', async () => {
    component.ngOnInit();
    component.removeUploadedImage();
    expect(component.styleCtrlGrp.get('imageName').value).toEqual('');
    expect(component.styleCtrlGrp.get('imagesno').value).toEqual('');
  });

  it('toggleSelection()', async () => {
    const field = { fieldId: 'Matl_TYPE' } as MetadataModel;
    component.chooseColumns = [{ fields: 'Matl_TYPE' } as WidgetTableModel];
    component.toggleSelection(field);
    expect(component.chooseColumns.length).toEqual(0);

    component.chooseColumns = [];
    component.toggleSelection(field);
    expect(component.chooseColumns.length).toEqual(1);
  });

  it('mapGridFields(), should return grid data', async () => {
    const response = {
      gridFields: { MPS_CALL: { MPS_GRD: { fieldDescri: 'Completion Date for Call Object' } } },
      grids: { MPS_CALL: { fieldDescri: 'Completion Date for Call Object' } },
      hierarchy: {},
      hierarchyFields: {}
    };
    component.mapGridFields(response);
    expect(component.mapGridFields).toBeTruthy();
  });

  it('mapHierarchyFields(), should return hierarchy data', async () => {
    const response = {
      gridFields: { MPS_CALL: { MPS_GRD: { fieldDescri: 'Completion Date for Call Object' } } },
      grids: { MPS_CALL: { fieldDescri: 'Completion Date for Call Object' } },
      hierarchy: [{ fieldId: 'PLANT', heirarchyId: '1', heirarchyText: 'Plant Data', objectType: '1005', objnr: 1 }],
      hierarchyFields: { 1: { ABC_ID: { fieldDescri: 'Not Available' } } },
      headers: {}
    } as MetadataModeleResponse;
    component.mapHierarchyFields(response);
    expect(component.mapHierarchyFields).toBeTruthy();
  });

  it('selectedWorkFlow(), should manage selected work flow data', async () => {
    component.chartPropCtrlGrp = new FormGroup({
      isStepWiseSla: new FormControl(false)
    });
    component.selectedWorkflowPath = [{ objectType: '6847371048', wfpath: 'WF52' }];
    const value = { objecttype: '6847371048', pathname: 'WF52' }
    component.selStyleWid.workflowPath = [];
    component.selectedWorkFlow(value);
    expect(component.selectedWorkflowPath.length).toEqual(2);

    component.selStyleWid.isStepwiseSLA = true;
    component.selectedWorkFlow(value);
    expect(component.selectedWorkflowPath.length).toEqual(1);

    component.selStyleWid.isStepwiseSLA = true;
    component.selectedWorkFlow(value);
    expect(component.inValidSLA).toBeTrue();

    component.selStyleWid.isStepwiseSLA = true;
    component.selStyleWid.workflowPath = [];
    component.selStyleWid.widgetType = WidgetType.TIMESERIES;
    component.selStyleWid.field = 'TIME_TAKEN';
    spyOn(component,'getWorkflowSteps');
    component.selectedWorkFlow(value);
    expect(component.inValidSLA).toBeTrue();
  });

  it('isCheckedWorkflow(), is checked work flow', async () => {
    component.selectedWorkflowPath = [{ objectType: '6847371048', wfpath: 'WF52' }];
    const value = { objecttype: '6847371048', pathname: 'WF52' }
    expect(component.isCheckedWorkflow(value)).toEqual(false);
  });

  it('displayWithWorkflowDesc()', async () => {
    component.selectedWorkflowPath = [{ objectType: '6847371048', wfpath: 'WF52' }];
    component.displayWithWorkflowDesc();
    expect(component.displayWithWorkflowDesc).toBeTruthy();
  });

  it('getSeriesValue(), should return series value', async () => {
    const control = { value: 'BAR' };
    const value = ['BAR'];
    expect(component.getSeriesValue(value, control)).toEqual(value);

    const control1 = { };
    const value1 = ['BAR'];
    expect(component.getSeriesValue(value1, control1)).toEqual(value1);
  });

  it('displayProperties(), should return display properties', async () => {
    const opt = { value: 1 };
    expect(component.displayProperties(opt)).toEqual(1);
  });

  it('getValue()', async () => {
    const control = { value: 'BAR' };
    const value = [{ value: 'BAR' }];
    expect(component.getValue(value, control)).toEqual(value);
  });

  it('checkNumLength()', async () => {
    component.ngOnInit();
    component.checkNumLength(1001);
    expect(component.styleCtrlGrp.get('pageDefaultSize').value).toEqual(1000);
    component.checkNumLength(0);
    expect(component.styleCtrlGrp.get('pageDefaultSize').value).toEqual('');
  });

  it('onCustomFieldChange()', async () => {
    const field = { option: { value: 'ABC' } } as MatAutocompleteSelectedEvent;
    component.ngOnInit();
    component.onCustomFieldChange(field);
    expect(component.styleCtrlGrp.get('field').value).toEqual('ABC');

    const fieldNew = { option: { } } as MatAutocompleteSelectedEvent;
    component.ngOnInit();
    component.onCustomFieldChange(fieldNew);
    expect(component.styleCtrlGrp.get('field').value).toEqual('');
  });

  it('afterCustomSelect()', async () => {
    const obj = { objectid: '1' } as ObjectTypeResponse;
    component.ngOnInit();
    component.afterCustomSelect(obj);
    expect(component.styleCtrlGrp.get('isWorkflowdataSet').value).toEqual(false);
    expect(component.styleCtrlGrp.get('isCustomdataSet').value).toEqual(true);
  });

  it('afterDIWDatasetSelect()', async () => {
    const obj = { schemaId: '1' } as ObjectTypeResponse;
    component.ngOnInit();
    component.afterDIWDatasetSelect(obj);
    expect(component.styleCtrlGrp.get('isWorkflowdataSet').value).toEqual(false);
    expect(component.styleCtrlGrp.get('isCustomdataSet').value).toEqual(false);
    expect(component.isDIWDatasetSelected).toBe(true);
  });

  it('filtered()', async () => {
    const array = [{
      fieldDescri: 'Basic data text', fieldId: 'BSCDTA',
      childs: [
        { fieldDescri: 'Additional Comments', fieldId: 'BASIC_ADD' },
        { fieldDescri: 'Description', fieldId: 'BTDDESC' }
      ]
    }
    ];
    component.filtered(array, 'add');
    expect(component.filtered).toBeTruthy();
  });

  it('removeError()', async () => {
    component.removeError('fieldCtrl');
    expect(component.removeError).toBeTruthy();

    component.removeError('datasetCtrl');
    expect(component.removeError).toBeTruthy();

    component.removeError(null);
    expect(component.removeError).toBeTruthy();
  });

  it('getWorkFlowPathDetail()', async () => {
    spyOn(schemaService, 'getWorkFlowPath').withArgs([]).and.returnValue(of([]));
    component.getWorkFlowPathDetails([]);
    expect(component.getWorkFlowPathDetails).toBeTruthy();
  });

  it('searchChooseColumn()', async () => {
    component.fieldData = [{
      fieldDescri: 'Basic data text', fieldId: 'BSCDTA',
      childs: [
        { fieldDescri: 'Additional Comments', fieldId: 'BASIC_ADD', childs: [], isGroup: false },
        { fieldDescri: 'Description', fieldId: 'BTDDESC', childs: [], isGroup: false } as Metadata
      ], isGroup: false
    }
    ];

    component.searchChooseColumn('text');
    expect(component.searchChooseColumn).toBeTruthy();

    component.searchChooseColumn('');
    expect(component.searchChooseColumn).toBeTruthy();
  });

  it('chooseColumnDisWith()', async () => {
    const obj = {
      ajax: '0', backEnd: 0, criteriaDisplay: '', criteriaField: '0', dataType: 'CHAR', datemodified: 1566910806451,
      defaultDate: '0', defaultDisplay: 'true', defaultValue: '', dependency: '0', descField: 'false',
      eventService: '0', fieldDescri: 'Lot. Size', fieldId: 'LOTSIZEKEY', flag: '0', gridDisplay: '0',
      intUse: '0', intUseService: '', isCheckList: 'false', isCompBased: '1', isCompleteness: '', isShoppingCartField: null,
      keys: '0', languageIndependent: '0', locType: '', mandatory: '0', maxChar: '2', numberSettingCriteria: '0', objecttype: '1005',
      outputLen: '', parentField: null, permission: '0', pickService: '', pickTable: 'DISLS', picklist: '1',
      plantCode: '0', refField: 'false', reference: '0', repField: null, searchEngin: '0', strucId: '0002', systemId: 'SAP',
      tableName: null, tableType: '0', textAreaLength: '', textAreaWidth: '', userid: 'Admin',
      validationService: '', workFlowField: '1', workflowCriteria: '0', isShoppingCartRefField: false
    } as MetadataModel;
    expect(component.chooseColumnDisWith(obj)).toEqual(obj.fieldDescri);
  });

  it('chooseColumnDisWith()', async () => {
    const obj = null;
    expect(component.chooseColumnDisWith(obj)).toEqual(null);
  });

  it('onDistictWithChange()', async () => {
    const field = { option: { value: 'ABC' } } as MatAutocompleteSelectedEvent;
    component.ngOnInit();
    component.onDistictWithChange(field);
    expect(component.styleCtrlGrp.get('distictWith').value).toEqual('ABC');

    const field1 = { option: { value: {fldCtrl : 'ABC' }} } as MatAutocompleteSelectedEvent
    component.onDistictWithChange(field1);
    expect(component.styleCtrlGrp.get('distictWith').value).toEqual('ABC');
  });

  it('afterDataSetSelect()', async () => {
    const obj = { moduleId: '1' } as Dataset;
    component.ngOnInit();
    component.afterDataSetSelect(obj);
    expect(component.styleCtrlGrp.get('isWorkflowdataSet').value).toEqual(false);
    expect(component.styleCtrlGrp.get('isCustomdataSet').value).toEqual(false);
  });

  it('displayWithDataSet()', async () => {
    const obj = { objectid: '1', objectdesc: 'BAR' } as ObjectTypeResponse;
    expect(component.displayWithDataSet(obj)).toEqual('BAR');
  });

  it('getCustomFields()', async () => {
    spyOn(reportService, 'getCustomDatasetFields').withArgs('').and.returnValue(of([]));
    component.getCustomFields('');
    expect(component.getCustomFields).toBeTruthy();
  });

  it('checkEnabledBarPerc(), check isEnableBarPerc', async () => {
    component.ngOnInit();
    component.chartPropCtrlGrp.get('chartType').setValue('PIE');
    component.checkEnabledBarPerc();
    expect(component.chartPropCtrlGrp.get('isEnabledBarPerc').value).toEqual(false);
  });

  it('fileChange(), should change file', async () => {
    const event = { target: { files: [{ name: 'First.jpg' }] } }
    component.ngOnInit();

    spyOn(schemaService, 'uploadUpdateFileData')
      .withArgs(event.target.files[0] as File, component.styleCtrlGrp.get('imagesno').value)
      .and.returnValue(of('1234'));
    spyOn(dmsService,'uploadFileWithSNo').and.returnValue(of('1234'))

    component.fileChange(event);
    expect(component.styleCtrlGrp.get('imageName').value).toEqual('First.jpg');
  });

  it('optionClicked(), select checkbox on option click', async () => {
    const field = { fieldId: 'Matl_TYPE' } as MetadataModel;
    component.optionClicked({}, field);
    expect(component.optionClicked).toBeTruthy();
  });

  it('searchRangeColumn()', async () => {
    component.rangeFields = [{
      fieldDescri: 'Basic data text', fieldId: 'BSCDTA',
      childs: [
        { fieldDescri: 'Additional Comments', fieldId: 'BASIC_ADD', childs: [], isGroup: false },
        { fieldDescri: 'Description', fieldId: 'BTDDESC', childs: [], isGroup: false } as Metadata
      ], isGroup: false
    }
    ];

    component.searchRangeColumn('text');
    expect(component.searchRangeColumn).toBeTruthy();

    component.searchRangeColumn('');
    expect(component.searchRangeColumn).toBeTruthy();
  });

  it('rangeOptions(), should return aggregrator operator type', async () => {
    component.styleCtrlGrp = new FormGroup({
      rangeCalculationFld: new FormControl(['']),
      isEnableRange: new FormControl(false),
      aggregrationOp : new FormControl('')
    });
    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(false);
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(8);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.COUNT } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(false);
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(7);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(1);

    component.fieldDataType = 'DATS';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue({ dataType: 'DATS' });
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(1);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue({ dataType: 'DATS' });
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.rangeOptions()
    expect(component.aggregrationOp.length).toEqual(2);

    component.fieldDataType = '';
    component.selStyleWid = { widgetType: WidgetType.COUNT } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(6);

    component.fieldDataType = '';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('DATS');
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.styleCtrlGrp.get('aggregrationOp').setValue({key:'SUM'})
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(1);

    component.fieldDataType = '';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.styleCtrlGrp.get('aggregrationOp').setValue({key:'SUM'})
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(8);

    component.selStyleWid = { widgetType: WidgetType.TIMESERIES,field:'TIME_TAKEN' } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(true);
    component.styleCtrlGrp.get('aggregrationOp').setValue({key:'SUM'})
    component.rangeOptions();
    expect(component.aggregrationOp.length).toEqual(3);
  });

  it('getWorkflowSteps', async(() => {
    const workflowId = 'WF36';
    const response = [{
      stepId: '01',
      desc: 'Requestor'
    },
    {
      stepId: '03',
      desc: 'Procurement'
    }]
    component.chartPropCtrlGrp = new FormGroup({ selectSlaSteps: new FormControl(['']) })
    spyOn(reportService, 'getSlaSteps').withArgs(workflowId).and.returnValue(of(response));
    component.getWorkflowSteps(workflowId);
    expect(component.getWorkflowSteps).toBeTruthy();
  }))

  it('isFieldError',async(()=>{
    component.selStyleWid = {widgetType : WidgetType.COUNT, aggregrationOp : AggregationOperator.MEDIAN, fieldCtrl:{dataType:null}} as Widget;
    expect(component.isFieldError).toBeTrue();
  }))

  it('searchMeasureColumn()', async () => {
    component.rangeFields = [{
      fieldDescri: 'Basic data text', fieldId: 'BSCDTA',
      childs: [
        { fieldDescri: 'Additional Comments', fieldId: 'BASIC_ADD', childs: [], isGroup: false },
        { fieldDescri: 'Description', fieldId: 'BTDDESC', childs: [], isGroup: false } as Metadata
      ], isGroup: false
    }
    ];

    component.searchMeasureFldColumn('text');
    expect(component.searchMeasureFldColumn).toBeTruthy();

    component.searchMeasureFldColumn('');
    expect(component.searchMeasureFldColumn).toBeTruthy();
  });

  it('stepSelection()', async () => {
    component.chartPropCtrlGrp = new FormGroup({ selectSLASteps: new FormControl([]) })
    const field = { stepId:'WF55', desc:'Initiator' } as SlaStepSize;
    component.selStyleWid.workflowPathSteps = ['WF55'];
    component.stepSelection(field);
    expect(component.selStyleWid.workflowPathSteps.length).toEqual(0);

    component.selStyleWid.workflowPathSteps = [];
    component.stepSelection(field);
    expect(component.selStyleWid.workflowPathSteps.length).toEqual(1);
  });

  it('sanitizeValue, should remove special characters', () => {
    const control: FormControl = new FormControl();
    control.setValue('testing/report');
    component.sanitizeValue(control);
    expect(control.value).toEqual('testingreport');
  });

  it('hasLimit(), should return ', () => {
    component.hasLimit();
    expect(component.hasLimit).toBeTruthy();
  });

  it('selected() select event of industry matautocomplete', () => {
    component.optionInput = elRef;
    const newValue = 'Industry 1';
    const event: MatAutocompleteSelectedEvent = {
      option: {
        value: newValue,
      },
    } as MatAutocompleteSelectedEvent;
    component.selectedOptions = [];
    component.styleCtrlGrp =  new FormGroup({
      brs: new FormControl('')
    })
    component.selected(event);
    expect(component.selectedOptions.length).toEqual(1);
  });

  it('_filter(), should filter based on key', async(() => {
    expect(component._filter('1')).toBeTruthy();
  }));

  it('getTooltip(), get tool tip', async () => {
    const obj = { moduleId: '1', moduleDesc: 'Custom dataset test/Duplicate With master' } as Dataset;
    expect(component.getTooltip(obj)).toEqual('Custom dataset test/Duplicate With master');

    const obj1 = { moduleId: '1', moduleDesc: 'Custom dataset test'} as Dataset;
    expect(component.getTooltip(obj1)).toEqual('Custom dataset test');
  });
  it('getBusinessRules(), should get business rule values', async(() => {
    component.selectedOptions = [];
    component.selectedBrIds = [];
    component.selStyleWid = {brs:'23456543'} as Widget;
    const response = [{brId: '23456543', desc: 'Missing Rule'}];
    spyOn(schemaDetailsService, 'getBusinessRulesList').withArgs('12345','', 0,0).and.returnValue(of(response));
    component.getBusinessRules('12345');
    expect(component.allBusinessRulesOptions.length).toEqual(1);
  }));

  it('searchWorkflowPath(), search work flow path', async(() => {
    component.workflowPath = [
      { objectType: '6847371048', wfpath: 'WF52', workflowdesc: 'spare part' },
      { objectType: '6847371148', wfpath: 'WF53', workflowdesc: 'Module permission' },
    ];
    component.searchWorkflowPath('spare');
    expect(component.workflowPathOb).toBeTruthy();
  }));
});
