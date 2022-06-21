import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerComponent } from './container.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Widget, WidgetTableModel, ReportDashboardPermission, BucketFilter, SeriesWith, TimeseriesStartDate, FilterWith, OrderWith, AggregationOperator, DisplayCriteria, ChartType, Orientation, DatalabelsPosition, LegendPosition, DateSelectionType, WidgetType, SlaStepSize } from '../../_models/widget';
import { MetadataModel, MetadataModeleResponse } from 'src/app/_models/schema/schemadetailstable';
import { BreadcrumbComponent } from 'src/app/_modules/shared/_components/breadcrumb/breadcrumb.component';
import { SvgIconComponent } from '@modules/shared/_components/svg-icon/svg-icon.component';
import { ReportService } from '@modules/report/_service/report.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Metadata, MetadatafieldControlComponent } from './metadatafield-control/metadatafield-control.component';
import { ReportList } from '@modules/report/report-list/report-list.component';
import { of } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaService } from '@services/home/schema.service';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ObjectTypeResponse, WorkflowResponse } from '@models/schema/schema';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
import { TransientService } from 'mdo-ui-library';
import { DynamicWidgetComponent } from './dynamic-widget/dynamic-widget.component';
import { WorkflowDatasetComponent } from './workflow-dataset/workflow-dataset.component';
import { UdrConditionOperatorsComponent } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-condition-operators/udr-condition-operators.component';

describe('ContainerComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;
  let reportService: ReportService;
  let schemaDetailsService: SchemaDetailsService;
  let schemaService: SchemaService;
  let userService: UserService;
  let toasterService: TransientService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerComponent, BreadcrumbComponent, SvgIconComponent, FormInputComponent, DynamicWidgetComponent, WorkflowDatasetComponent, MetadatafieldControlComponent, UdrConditionOperatorsComponent ],
      imports:[ AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientTestingModule],
      providers:[
        ReportService,
        SchemaDetailsService,
        SchemaService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerComponent);
    component = fixture.componentInstance;
    reportService = fixture.debugElement.injector.get(ReportService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    userService = fixture.debugElement.injector.get(UserService);
    toasterService = fixture.debugElement.injector.get(TransientService);

    component.selStyleWid = {
      x: 10, y: 20, height: 100, width: 200, widgetId: '12345', widgetType: WidgetType.BAR_CHART,
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
      isStepwiseSLA: false,
      workflowPathSteps: null,
      defaultFilters: null, fieldCtrl: null, groupByIdCtrl: null, dateFilterCtrl: null, isWorkflowdataSet: false,
      workflowPath: [], distictWith: null, isCustomdataSet: true, pageDefaultSize: 100, isFieldDistinct: false, displayCriteria: DisplayCriteria.CODE,
      isEnableGlobalFilter: false, applyDistinct: false, rangeBucketSize: null, rangeBucketLimit: null, rangeCalculationFld: null, isEnableRange: false, rangeDateFormatInterval: null,measureFld:null
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('showStyle(), show style', async(() => {
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
      x: 10, y: 20, height: 100, width: 200, widgetId: '12345', widgetType: WidgetType.BAR_CHART,
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
        bucketFilter: BucketFilter.WITHIN_1_DAY, hasCustomSLA: false,
        showTotal: true, slaType: null, slaValue: '9'
      },
      isStepwiseSLA: false,
      workflowPathSteps: null,
      defaultFilters: null, fieldCtrl: null, groupByIdCtrl: null, dateFilterCtrl: null, isWorkflowdataSet: false,
      workflowPath: [], distictWith: null, isCustomdataSet: true, pageDefaultSize: 100, isFieldDistinct: false, displayCriteria: DisplayCriteria.CODE,
      isEnableGlobalFilter: false, applyDistinct: false, rangeBucketSize: null, rangeBucketLimit: null, rangeCalculationFld: null, isEnableRange: false, rangeDateFormatInterval: null, measureFld:null
    }
    component.styleCtrlGrp = new FormGroup({});
    component.ngOnInit();
    component.showStyle(data);
    expect(component.showStyle).toBeTruthy();
  }));

  it('isSelected(), check the field is selcted or not', async(() => {
    const isSelectedObj = { fieldId: 'Matl_TYPE' } as MetadataModel;
    component.chooseColumns = [{ fields: 'Matl_TYPE' } as WidgetTableModel];
    expect(component.isSelected(isSelectedObj)).toEqual(true, 'If the fld is exit on choose column then return true');
    component.chooseColumns = [];
    expect(component.isSelected(isSelectedObj)).toEqual(false, 'If the fld is not exit on choose column then return false');

  }));

  it('ngAfterViewInit(), test ngAfterViewInit ', async(() => {
    component.ngAfterViewInit();
    expect(component.screenWidth).toEqual(document.body.offsetWidth, 'Screen width should equal to container width');
    const expectedBoxSize = component.screenWidth / 200;
    expect(expectedBoxSize).toEqual(component.eachBoxSize, 'Check box size');
  }));

  it('preapreNewWidgetPosition(), prepare widget ', async(() => {
    const widget = new Widget();
    widget.widgetId = '7254875287';
    component.widgetList = [];
    component.preapreNewWidgetPosition(widget);
    expect(component.widgetList.length).toEqual(1, 'After push to widgetlist size should be 1');
    widget.x = 10;
    component.preapreNewWidgetPosition(widget);
    expect(component.widgetList[0].x).toEqual(10, 'After update postion x');
  }));

  it('delete(), on widget delete', async(() => {
    const widget = new Widget();
    widget.widgetId = '7254875287';
    component.widgetList = [widget];
    component.delete(widget);

    expect(component.selStyleWid).toEqual(new Widget(), 'style widget variable should be new object');
    expect(component.showProperty).toEqual(false, 'Style property panel is hide');
  }));
  it('ngOnInit(), check all pre require ', async(() => {
    spyOn(reportService, 'getReportConfi').withArgs('', '').and.returnValue(of());
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([]));
    // const initialFrmGrp = {widgetName: '', width: '', height: '', field: '', aggregrationOp: '', filterType: '', isMultiSelect: false, groupById: '', objectType: '', imageUrl: '', htmlText: '', imagesno: '', imageName: '', isCustomdataSet: false, isFieldDistinct: false};
    component.ngOnInit();
    expect(component.subscriptions.length).toEqual(8, 'Size should be 8');
    // expect(schemaService.getAllObjectType()).toHaveBeenCalled()
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

  it('removeFilter(), should remove item from array ', async(() => {
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
    expect(component.styleCtrlGrp.get('groupById').value).toEqual(metaData.fieldId, 'Group by id should equals ${metaData.fieldId}');
  }));

  it('onFieldChange(), while change value on field  id', async(() => {
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
  }));

  it('getReportConfig(), get report config', async(() => {
    // mock data
    const reportList: ReportList = new ReportList();
    reportList.permission = new ReportDashboardPermission();
    const user: Userdetails = new Userdetails()
    spyOn(userService, 'getUserDetails').and.returnValue(of(user));

    spyOn(reportService, 'getReportConfi').withArgs('72523857', user.currentRoleId).and.returnValue(of(reportList));

    component.getReportConfig('72523857');

    expect(reportService.getReportConfi).toHaveBeenCalledWith('72523857', user.currentRoleId);
  }));

  it('getAllFields(), get all fields', async(() => {

    spyOn(schemaDetailsService, 'getMetadataFields').withArgs('1005').and.returnValue(of({} as MetadataModeleResponse));
    component.getAllFields('1005');

    expect(schemaDetailsService.getMetadataFields).toHaveBeenCalledWith('1005');

  }));

  it('getAllObjectType(), get all object type', async(() => {
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([]));

    component.getAllObjectType();
    expect(schemaService.getAllObjectType).toHaveBeenCalledTimes(1);

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

  it('searchDataSet(), should search data set', async ()=>{
    component.dataSets = [ {objectdesc: 'Category Attribute', objectid: '10'} as ObjectTypeResponse,{objectdesc: 'Additional', objectid: '10'} as ObjectTypeResponse];
    component.customDataSets = [{objectdesc: 'Module permission', objectid: 'Module_Permission'},{objectdesc: 'Number of logins',objectid: 'numberoflogin'}];
    component.dataSets = [];
    component.searchDataSet('');
    expect(component.searchDataSet).toBeTruthy();

    component.searchDataSet('text');
    expect(component.searchDataSet).toBeTruthy();
  });

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
    component.workflowFields = { static: [], dynamic: [] };
    component.searchChooseColumnWorkflow('');
    expect(component.searchChooseColumnWorkflow).toBeTruthy();

    component.searchChooseColumnWorkflow('');
    expect(component.searchChooseColumnWorkflow).toBeTruthy();
  });

  it('widthCount(), should return width count', async () => {
    component.ngOnInit();
    component.widthCount(200);
    expect(component.styleCtrlGrp.get('width').value).toEqual(190);
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
    spyOn(component, 'preapreNewWidgetPosition');
    const field = { fieldId: 'Matl_TYPE' } as MetadataModel;
    component.chooseColumns = [{ fields: 'Matl_TYPE' } as WidgetTableModel];
    component.toggleSelection(field);
    expect(component.chooseColumns.length).toEqual(0);

    component.chooseColumns = [];
    component.toggleSelection(field);
    expect(component.chooseColumns.length).toEqual(1);

    component.selStyleWid.widgetTableFields = component.chooseColumns;

    expect(component.preapreNewWidgetPosition).toHaveBeenCalledWith(component.selStyleWid);
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
    component.selectedWorkflowPath = [{ objectType: '6847371048', wfpath: 'WF52' }];
    const value = { objecttype: '6847371048', pathname: 'WF52' }
    component.selStyleWid.workflowPath = [];
    component.selectedWorkFlow(value);
    expect(component.selectedWorkflowPath.length).toEqual(2);
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
  });

  it('afterCustomSelect()', async () => {
    const obj = { objectid: '1' } as ObjectTypeResponse;
    component.ngOnInit();
    component.afterCustomSelect(obj);
    expect(component.styleCtrlGrp.get('isWorkflowdataSet').value).toEqual(false);
    expect(component.styleCtrlGrp.get('isCustomdataSet').value).toEqual(true);
  });

  it('addWidget()', async () => {
    component.eachBoxSize = 0;
    const event = { movementX: 10, movementY: 20 } as MouseEvent;
    component.addWidget(event, 'TABLE_LIST');
    expect(component.addWidget).toBeTruthy();
  });

  it('heightCount()', async () => {
    component.ngOnInit();
    component.heightCount(1200);
    expect(component.styleCtrlGrp.get('height').value).toEqual(1000);
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

  it('onDistictWithChange()', async () => {
    const field = { option: { value: 'ABC' } } as MatAutocompleteSelectedEvent;
    component.ngOnInit();
    component.onDistictWithChange(field);
    expect(component.styleCtrlGrp.get('distictWith').value).toEqual('ABC');
  });

  it('afterDataSetSelect()', async () => {
    const obj = { objectid: '1' } as ObjectTypeResponse;
    component.ngOnInit();
    component.afterDataSetSelect(obj);
    expect(component.styleCtrlGrp.get('isWorkflowdataSet').value).toEqual(false);
    expect(component.styleCtrlGrp.get('isCustomdataSet').value).toEqual(false);
  });

  it('displayWithDataSet()', async () => {
    const obj = { objectid: '1', objectdesc: 'BAR' } as ObjectTypeResponse;
    expect(component.displayWithDataSet(obj)).toEqual('BAR');
  });

  it('`afterWfSelect`()', async () => {
    const obj: WorkflowResponse[] = [{ objectid: '1', objectdesc: 'BAR', isSelected: true }];
    // component.ngOnInit();
    component.customDataSets = [{objectid: '1005', objectdesc: 'Material'}] as ObjectTypeResponse[];
    component.dataSets = [{objectid: '1006', objectdesc: 'Customer'}] as ObjectTypeResponse[];
    component.styleCtrlGrp = new FormGroup({ isCustomdataSet: new FormControl([false]), isWorkflowdataSet: new FormControl([false]), objectType: new FormControl([''])});
    spyOn(component,'getWorkFlowFields');
    spyOn(component,'getRecordCount');
    spyOn(component,'getWorkFlowPathDetails');
    component.afterWfSelect(obj);
    expect(component.styleCtrlGrp.get('isWorkflowdataSet').value).toEqual(true);
    expect(component.styleCtrlGrp.get('isCustomdataSet').value).toEqual(false);
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

  it('createUpdateReport(), should update report', async () => {
    component.ngOnInit();

    spyOn(toasterService, 'open');
    spyOn(component, 'showStyle');

    const widget = new Widget();
    widget.widgetId = '7254875287';
    widget.widgetType = WidgetType.TABLE_LIST;
    component.widgetList = [widget];
    component.reportName.setValue('test');
    component.createUpdateReport();

    expect(component.createUpdateReport).toBeTruthy();
    expect(component.datasetCtrl.errors).toBeTruthy();
    expect(component.datasetCtrl.touched).toBeTrue();
    expect(toasterService.open).toHaveBeenCalledWith('Highlighted fields can’t be empty', 'Close', { duration: 2000 })
    expect(component.showStyle).toHaveBeenCalledWith(widget);

    component.widgetList = [];
    component.createUpdateReport();
    expect(toasterService.open).toHaveBeenCalled();
  });

  it('fileChange(), should change file', async () => {
    const event = { target: { files: [{ name: 'First.jpg' }] } }
    component.ngOnInit();

    spyOn(schemaService, 'uploadUpdateFileData')
      .withArgs(event.target.files[0] as File, component.styleCtrlGrp.get('imagesno').value)
      .and.returnValue(of('1234'));

    component.fileChange(event);
    expect(component.styleCtrlGrp.get('imageName').value).toEqual('First.jpg');
  });

  it('optionClicked(), select checkbox on option click', async () => {
    const field = { fieldId: 'Matl_TYPE' } as MetadataModel;
    component.optionClicked({}, field);
    expect(component.optionClicked).toBeTruthy();
  });

  it('drop()', async () => {
    const widget = new Widget();
    widget.widgetId = '1627011554521';
    component.widgetList = [widget];
    const event: CdkDragDrop<string[]> = {
      previousIndex: 1, currentIndex: 2, container: {} as CdkDropList,
      previousContainer: {} as CdkDropList, isPointerOverContainer: false, distance: { x: 1, y: 2 },
      item: { element: { nativeElement: { id: '1627011554521' } } } as CdkDrag,
    } as CdkDragDrop<string[]>
    component.drop(event);
    expect(component.drop).toBeTruthy();
  });

  it('getCustomObjectType(), to get custom object', async () => {
    spyOn(reportService, 'getCustomData').and.returnValue(of([]));
    component.getCustomObjectType();
    expect(component.getCustomObjectType).toBeTruthy();
  });

  it('getdropDownValues(), dropdown values', async () => {
    spyOn(schemaService, 'dropDownValues').withArgs('BSCDATA', 'BS').and.returnValue(of([]));
    component.getdropDownValues('BSCDATA', 'BS');
    expect(component.getdropDownValues).toBeTruthy();
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
      isEnableRange: new FormControl(false)
    });
    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(false);

    expect(component.aggregrationOp.length).toEqual(3);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.COUNT } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(false);

    expect(component.aggregrationOp.length).toEqual(3);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(true);

    expect(component.aggregrationOp.length).toEqual(3);

    component.fieldDataType = 'DATS';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue({ dataType: 'DATS' });
    component.styleCtrlGrp.get('isEnableRange').setValue(true);

    expect(component.aggregrationOp.length).toEqual(3);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.BAR_CHART } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue({ dataType: 'DATS' });
    component.styleCtrlGrp.get('isEnableRange').setValue(true);

    expect(component.aggregrationOp.length).toEqual(3);

    component.fieldDataType = 'NUMC';
    component.selStyleWid = { widgetType: WidgetType.COUNT } as Widget;
    component.styleCtrlGrp.get('rangeCalculationFld').setValue('');
    component.styleCtrlGrp.get('isEnableRange').setValue(false);

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
    component.chartPropCtrlGrp = new FormGroup({ selectSLASteps: new FormControl(['']) })
    spyOn(reportService, 'getSlaSteps').withArgs(workflowId).and.returnValue(of(response));
    component.getWorkflowSteps(workflowId);
    expect(component.getWorkflowSteps).toBeTruthy();
  }))

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
});

