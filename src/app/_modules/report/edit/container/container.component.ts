import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Widget, WidgetType, ReportDashboardReq, WidgetTableModel, ChartType, Orientation, DatalabelsPosition, LegendPosition, BlockType, TimeseriesStartDate, Criteria, OrderWith, SeriesWith, WorkflowFieldRes, DisplayCriteria, FilterWith, BucketFilter, AggregationOperator, DateSelectionType, SlaStepSize } from '../../_models/widget';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ReportService } from '../../_service/report.service';
import { Heirarchy, MetadataModel, MetadataModeleResponse, ParentField } from 'src/app/_models/schema/schemadetailstable';
import { ActivatedRoute } from '@angular/router';
import { ObjectTypeResponse, WorkflowResponse, WorkflowPath } from 'src/app/_models/schema/schema';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { DropDownValue, ConditionalOperator } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { UserService } from '@services/user/userservice.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { Metadata } from './metadatafield-control/metadatafield-control.component';

@Component({
  selector: 'pros-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ContainerComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly OrderWith = OrderWith;

  /** when user click enable/disable widget property */
  showProperty = false;

  /** screenwidth for calculate widget size */
  screenWidth: number;

  /** Initial 200 */
  pixcel = 200;

  /** initial size of every widget */
  eachBoxSize = 0;

  /** max width of any widget */
  widgetMaxWidth = 200;

  /** max height of any widget */
  widgetMaxHeight = 1000;

  fieldDataType: string;

  /** for background-color or additinal dynamic css on main container */
  containerCss: any = {};

  /** store widget data */
  widgetList: Widget[] = [];

  /** store widget data */
  selStyleWid: Widget;

  /** Form object for widget */
  styleCtrlGrp: FormGroup;

  /** unique reportId for any report */
  reportId: string;

  /** report name for any report */
  reportName = new FormControl('', Validators.required);

  /** fields for table widget */
  chooseColumns: WidgetTableModel[] = [];

  /** Form object for Chart properties */
  chartPropCtrlGrp: FormGroup;

  /** Form object for default filter */
  defaultFilterCtrlGrp: FormGroup;

  /** store syncing reord for dataset */
  recordsCount: number;

  /** permission for report */
  collaboratorPermission = false;

  /** store operator for default filter */
  conditionalOperators: ConditionalOperator[] = this.possibleOperators;

  /** store Dropdown value for dropdown fields */
  dropValues: DropDownValue[];
  dropValuesOb: Observable<DropDownValue[]> = of([]);

  /** All the http or normal subscription will store in this array */
  subscriptions: Subscription[] = [];

  /** field, groupwith, distinct all value is selected then serieswith is disabled */
  isSerieswithDisabled = false;
  selectedOption: string;
  fld2FldArray = ['FIELD2FIELD', 'FIELD2FIELD_EQUAL', 'FIELD2FIELD_GREATETHENEQUAL', 'FIELD2FIELD_GREATETHAN', 'FIELD2FIELD_LESSTHEN', 'FIELD2FIELD_LESSTHENEQUALTO'];

  /** Store current search text for datasets */
  searchDataSetVal = '';

  /** Maximum length of report name */
  maxReportNameLength = 100;

  /** store module data set object */
  dataSets: ObjectTypeResponse[];
  dataSetOb: Observable<ObjectTypeResponse[]> = of([]);

  /** store custom data set object */
  customDataSets: ObjectTypeResponse[] = [];
  customDataSetob: Observable<ObjectTypeResponse[]> = of([]);

  /** store fields for module dataset */
  fields: BehaviorSubject<MetadataModeleResponse> = new BehaviorSubject<MetadataModeleResponse>(null);

  /** Hold only header fields.. */
  headerFls: MetadataModel[] = [];
  headerFields: Observable<MetadataModel[]> = of([]);

  /** Hold hierarchy and grid fields */
  fieldData: Metadata[] = [];
  fieldsObs: Observable<Metadata[]> = of([]);

  /** For workflow data set choose column filter ... */
  workflowFieldsObs: Observable<WorkflowFieldRes> = of(new WorkflowFieldRes());
  wfFields: BehaviorSubject<WorkflowFieldRes> = new BehaviorSubject<WorkflowFieldRes>(null);
  workflowFields: WorkflowFieldRes = new WorkflowFieldRes();

  /** store custom data set fields */
  Customfields: MetadataModel[];
  CustomfieldsObs: Observable<MetadataModel[]> = of([]);

  /** store workflow path for workflow dataset */
  workflowPath: WorkflowPath[] = [];
  workflowPathOb: Observable<WorkflowPath[]> = of([]);
  selectedWorkflowPath: WorkflowPath[] = [];

  datasetCtrl: FormControl = new FormControl('');
  fieldCtrl: FormControl = new FormControl('');
  lastSelectedWidget: Widget;

  /** stor sla steps data */
  slaSteps: SlaStepSize[] = [];
  slaStepsObs: Observable<SlaStepSize[]> = of([]);

  /** system fields for Transactional module dataset */
  systemFields = [
    {
      fieldId: 'STATUS',
      fieldDescri: 'Status',
    },
    {
      fieldId: 'USERMODIFIED',
      fieldDescri: 'User Modified',
      picklist: '1',
      dataType: 'AJAX',
    }, {
      fieldId: 'DATEMODIFIED',
      fieldDescri: 'Update Date',

      picklist: '0',
      dataType: 'DTMS',
    }, {
      fieldId: 'DATECREATED',
      fieldDescri: 'Creation Date',
      picklist: '0',
      dataType: 'DTMS',
    }
  ] as MetadataModel[];

  bucketFilter = this.possibleBucketFilter;

  slaMenu = this.possibleSLAMenu;
  timeInterval = this.possibleTimeIntervalFilter

  filterType = this.possibleFilterType;

  orderWith = this.possibleOrderWith;

  seriesWith = this.possibleseriesWith;

  seriesFormat = ['MMM-dd-yy', 'dd-MMM-yy', 'dd MMM, yy', 'MMM d, yy'];
  aggregrationOp = this.possibleAggregrationOperator;
  displayCriteria = this.possibleDisplayCriteria;

  chartType = this.possibleChartType;

  orientation = this.possibleOrientation;

  datalabelsPosition = this.possibleDataLablesPosition;

  legendPosition = this.possibleLegendPosition;

  dateSelectionType = this.possibleDateSelectionType;
  rangeDateFormatInterval = this.possibleseriesWith;

  isStepwiseSlaOption = this.possibleIsStepWiseSLA;

  rangeFields: Metadata[] = [];
  rangeFieldsObs: Observable<Metadata[]> = of([])

  rangeHeader: Observable<MetadataModel[]> = of([]);
  rangeHeaderFields: MetadataModel[] = [];

  @ViewChild('optionInput') optionInput: ElementRef;
  inValidSLA: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private toasterService: TransientService,
    private activatedRouter: ActivatedRoute,
    private elementRef: ElementRef,
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService,
    private sharedService: SharedServiceService,
    private userService: UserService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngAfterViewInit(): void {
    if (this.elementRef.nativeElement) {
      const screenWidth = document.body.offsetWidth;
      this.screenWidth = screenWidth;
      this.eachBoxSize = this.screenWidth / this.pixcel;
      console.log(`Screen width : ${screenWidth}`);

      this.containerCss = { 'background-size': `${this.eachBoxSize}px ${this.eachBoxSize}px` };
    }
  }

  ngOnInit(): void {
    this.getAllObjectType();
    this.getCustomObjectType();
    const sub = this.activatedRouter.params.subscribe(params => {
      this.reportId = params.id ? ((params.id).toLowerCase() === 'new' ? '' : params.id) : '';
      this.showProperty = false;
      if (this.reportId) {
        this.getReportConfig(this.reportId);
      } else {
        this.widgetList = [];
        this.reportName = new FormControl('', Validators.required);
        this.collaboratorPermission = true;
      }
    });
    this.subscriptions.push(sub);

    this.styleCtrlGrp = this.formBuilder.group({
      widgetName: [''],
      width: [''],
      height: [''],
      field: [''],
      aggregrationOp: [''],
      filterType: [''],
      isMultiSelect: [false],
      orderWith: [{ ...this.orderWith[1] }],
      groupById: [''],
      objectType: [''],
      imageUrl: [''],
      htmlText: [''],
      imagesno: [''],
      imageName: [''],
      dateSelectionType: [],
      startDate: [''],
      endDate: [''],
      isWorkflowdataSet: [false],
      workflowPath: [''],
      distictWith: [''],
      isCustomdataSet: [false],
      pageDefaultSize: [''],
      isFieldDistinct: [false],
      displayCriteria: [{ ...this.displayCriteria[1] }],
      isEnableGlobalFilter: [false],
      applyDistinct: [false],
      rangeBucketSize: [''],
      rangeBucketLimit: [''],
      rangeCalculationFld: [''],
      isEnableRange: [false],
      rangeDateFormatInterval: [''],
    });

    this.chartPropCtrlGrp = this.formBuilder.group({
      chartType: [{ ...this.chartType[0] }],
      orientation: [{ ...this.orientation[0] }],
      isEnableDatalabels: [false],
      datalabelsPosition: [{ ...this.datalabelsPosition[0] }],
      isEnableLegend: [false],
      legendPosition: [{ ...this.legendPosition[0] }],
      xAxisLabel: [''],
      yAxisLabel: [''],
      orderWith: [{ ...this.orderWith[3] }],
      scaleFrom: [''],
      scaleTo: [''],
      stepSize: [''],
      dataSetSize: [''],
      seriesWith: [{ ...this.seriesWith[0] }],
      seriesFormat: [''],
      blankValueAlias: [''],
      timeseriesStartDate: [{ ...this.timeInterval[1] }],
      isEnabledBarPerc: [false],
      bucketFilter: [{ ...this.bucketFilter[0] }],
      hasCustomSLA: [false],
      slaValue: [],
      slaType: [{ ...this.slaMenu[0] }],
      showTotal: [false],
      selectSLASteps: [],
      isStepWiseSla: []
    });

    this.defaultFilterCtrlGrp = this.formBuilder.group({
      filters: this.formBuilder.array([])
    });

    this.styleCtrlGrp.valueChanges.subscribe(latestVal => {
      if (this.selStyleWid) {
        const changedWidget = this.selStyleWid;
        changedWidget.height = latestVal.height;
        changedWidget.width = latestVal.width;
        changedWidget.widgetTitle = latestVal.widgetName;
        changedWidget.field = typeof latestVal.field === 'string' ? latestVal.field : latestVal.field.fieldId;
        changedWidget.aggregrationOp = latestVal.aggregrationOp?.key ? latestVal.aggregrationOp.key : null;
        changedWidget.filterType = latestVal.filterType?.key ? latestVal.filterType.key : null;
        changedWidget.isMultiSelect = latestVal.isMultiSelect;
        changedWidget.orderWith = latestVal.orderWith?.key ? latestVal.orderWith.key : this.orderWith[1].key;
        changedWidget.groupById = latestVal.groupById;
        changedWidget.objectType = latestVal.objectType;
        changedWidget.imageUrl = latestVal.imageUrl;
        changedWidget.htmlText = latestVal.htmlText;
        changedWidget.imagesno = latestVal.imagesno;
        changedWidget.imageName = latestVal.imageName;
        changedWidget.isWorkflowdataSet = latestVal.isWorkflowdataSet;
        changedWidget.distictWith = typeof latestVal.distictWith === 'string' ? latestVal.distictWith : latestVal.distictWith.fieldId;
        changedWidget.isCustomdataSet = latestVal.isCustomdataSet;
        changedWidget.pageDefaultSize = latestVal.pageDefaultSize;
        changedWidget.displayCriteria = latestVal.displayCriteria?.key ? latestVal.displayCriteria.key : this.displayCriteria[1];
        changedWidget.isFieldDistinct = latestVal.isFieldDistinct;
        changedWidget.isEnableGlobalFilter = latestVal.isEnableGlobalFilter;
        changedWidget.applyDistinct = latestVal.applyDistinct;
        changedWidget.rangeBucketSize = latestVal.rangeBucketSize;
        changedWidget.rangeBucketLimit = latestVal.rangeBucketLimit;
        changedWidget.rangeCalculationFld = latestVal.rangeCalculationFld && latestVal.rangeCalculationFld.fieldId ? latestVal.rangeCalculationFld.fieldId : null;
        changedWidget.rangeDateFormatInterval = latestVal.rangeDateFormatInterval?.key ? latestVal.rangeDateFormatInterval.key : null;
        changedWidget.isEnableRange= latestVal.isEnableRange ? true : false;

        // hold selected field control
        if (typeof latestVal.field !== 'string') {
          changedWidget.fieldCtrl = latestVal.field;
        }

        // while changing date default filter ...
        let strtDate = latestVal.startDate;
        if (latestVal.startDate) {
          try {
            strtDate = moment(latestVal.startDate, 'MM/DD/YYYY', true).toDate().getTime();
          } catch (error) {
            console.error(`Error :`, error);
          }
        }

        let endDate = latestVal.endDate;
        if (latestVal.endDate) {
          try {
            endDate = moment(latestVal.endDate, 'MM/DD/YYYY', true).toDate().getTime();
          } catch (error) {
            console.error(`Error :`, error);
          }
        }

        if (latestVal.dateSelectionType && strtDate) {
          changedWidget.dateFilterCtrl = {
            dateSelectedFor: latestVal.dateSelectionType.key,
            endDate,
            startDate: strtDate
          }
        } else if (latestVal.dateSelectionType) {
          changedWidget.dateFilterCtrl = {
            dateSelectedFor: latestVal.dateSelectionType.key,
          }
        } else {
          changedWidget.dateFilterCtrl = null;
        }
        this.preapreNewWidgetPosition(changedWidget);

        if (changedWidget.field && changedWidget.groupById && changedWidget.distictWith && !this.chartPropCtrlGrp.get('seriesWith').disabled) {
          this.chartPropCtrlGrp.get('seriesWith').setValue(this.seriesWith[4]);
          this.chartPropCtrlGrp.get('seriesWith').disable({ emitEvent: false });
        } else if (!(changedWidget.field && changedWidget.groupById && changedWidget.distictWith) && !this.chartPropCtrlGrp.get('seriesWith').enabled) {
          this.chartPropCtrlGrp.get('seriesWith').enable({ emitEvent: false })
        }
      }

      if(latestVal.workflowPath && latestVal.field === 'TIME_TAKEN' && this.selStyleWid.widgetType === 'TIMESERIES' && this.selStyleWid.isStepwiseSLA && latestVal.workflowPath.length === 1) {
        this.inValidSLA = false;
        this.getWorkflowSteps(this.selStyleWid.workflowPath[0]);
      }
    });

    // detect value change on chart properties
    this.chartPropCtrlGrp.valueChanges.subscribe(latestProp => {
      if (latestProp) {
        this.selStyleWid.chartProperties = latestProp;
        if ((latestProp.isStepWiseSla && latestProp.isStepWiseSla.key) || this.selStyleWid.isStepwiseSLA) {
          if (latestProp.isStepWiseSla || this.selStyleWid.isStepwiseSLA) {
            if (this.selStyleWid.workflowPath && this.selStyleWid.workflowPath.length !== 1) {
              this.inValidSLA = true;
              this.optionInput.nativeElement.focus();
            }
            else {
              this.inValidSLA = false;
              if(this.selStyleWid.workflowPath.length === 1) {
                this.getWorkflowSteps(this.selStyleWid.workflowPath[0]);
              }
            }
          }
        }
        if (latestProp.isCustomSla) {
          this.selStyleWid.chartProperties.seriesWith = latestProp.slaType && typeof (latestProp.slaType) === 'object' ? latestProp.slaType.key : this.slaMenu[0].key;
          this.selStyleWid.chartProperties.slaValue = latestProp.slaValue? latestProp.slaValue : '';
        }
        else {
          if (this.chartPropCtrlGrp.get('seriesWith').disabled) {
            this.selStyleWid.chartProperties.seriesWith = this.seriesWith[4].key;
          } else
            this.selStyleWid.chartProperties.seriesWith = latestProp.seriesWith?.key ? latestProp.seriesWith.key : this.seriesWith[0].key;
        }
        if (this.selStyleWid.widgetType === 'TIMESERIES' && this.selStyleWid.field === 'TIME_TAKEN') {
          this.selStyleWid.chartProperties.bucketFilter = latestProp.bucketFilter?.key ? latestProp.bucketFilter?.key : BucketFilter.WITHIN_1_DAY;
        } else {
          this.selStyleWid.chartProperties.bucketFilter = null;
        }
        this.selStyleWid.chartProperties.timeseriesStartDate = latestProp.timeseriesStartDate?.key ? latestProp.timeseriesStartDate.key : this.timeInterval[1].key;
        this.selStyleWid.chartProperties.chartType = latestProp.chartType?.key ? latestProp.chartType.key : this.chartType[0].key;
        this.selStyleWid.chartProperties.datalabelsPosition = latestProp.datalabelsPosition?.key ? latestProp.datalabelsPosition.key : this.datalabelsPosition[0].key;
        this.selStyleWid.chartProperties.legendPosition = latestProp.legendPosition?.key ? latestProp.legendPosition.key : this.legendPosition[0].key;
        this.selStyleWid.chartProperties.orderWith = latestProp.orderWith?.key ? latestProp.orderWith.key : this.orderWith[3].key;
        this.selStyleWid.chartProperties.orientation = latestProp.orientation?.key ? latestProp.orientation.key : this.orientation[0].key;
        this.selStyleWid.isStepwiseSLA = latestProp.isStepWiseSla?.key ? latestProp.isStepWiseSla.key : false;
        this.selStyleWid.workflowPathSteps = latestProp.selectSLASteps ? latestProp.selectSLASteps.map(item => item.stepId ? item.stepId : item) : []
        this.preapreNewWidgetPosition(this.selStyleWid);
      }
    });
    // detect value change on default filters
    this.defaultFilterCtrlGrp.valueChanges.subscribe(latestProp => {
      if (latestProp && latestProp.hasOwnProperty('filters')) {
        this.selStyleWid.defaultFilters = latestProp.filters;
        this.preapreNewWidgetPosition(this.selStyleWid);
      }
    });

    const styleSub = this.styleCtrlGrp.get('objectType').valueChanges.subscribe(fillData => {
      if (fillData && typeof fillData === 'string') {
        if ((fillData !== this.styleCtrlGrp.value.objectType || (fillData === this.styleCtrlGrp.value.objectType && (this.selStyleWid.isWorkflowdataSet !== this.lastSelectedWidget.isWorkflowdataSet || this.selStyleWid.isCustomdataSet !== this.lastSelectedWidget?.isCustomdataSet))) && !this.selStyleWid.isWorkflowdataSet && !this.selStyleWid.isCustomdataSet) {
          this.getAllFields(fillData);
          this.getRecordCount(fillData);
          this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
          this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
        }
        if ((fillData !== this.styleCtrlGrp.value.objectType || (fillData === this.styleCtrlGrp.value.objectType && this.selStyleWid.isWorkflowdataSet !== this.lastSelectedWidget.isWorkflowdataSet)) && this.selStyleWid.isWorkflowdataSet && !this.selStyleWid.isCustomdataSet) {
          this.getWorkFlowFields(fillData.split(','));
          this.getRecordCount(fillData, true);
          this.getWorkFlowPathDetails(fillData.split(','));
          this.styleCtrlGrp.get('isWorkflowdataSet').setValue(true);
          this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
        }
        if ((fillData !== this.styleCtrlGrp.value.objectType || (fillData === this.styleCtrlGrp.value.objectType && this.selStyleWid.isCustomdataSet !== this.lastSelectedWidget.isCustomdataSet)) && this.selStyleWid.isCustomdataSet && !this.selStyleWid.isWorkflowdataSet) {
          this.getCustomFields(fillData);
          this.getRecordCount(fillData, false, true);
          this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
          this.styleCtrlGrp.get('isCustomdataSet').setValue(true);
        }
      } else {
        console.log(fillData);
      }
    });
    this.subscriptions.push(styleSub);

    const fldSub = this.fields.subscribe(flds => {
      if (flds) {
        const headerArray: MetadataModel[] = [];
        for (const obj in flds.headers) {
          if (flds.headers.hasOwnProperty(obj)) {
            headerArray.push(flds.headers[obj]);
          }
        }
        this.headerFls = headerArray;
        this.headerFields = of(headerArray);

        if (!this.selStyleWid?.isWorkflowdataSet && !this.selStyleWid?.isCustomdataSet) {
          const gridFields = this.mapGridFields(flds);
          const hierarchyFields = this.mapHierarchyFields(flds);
          this.fieldData = [...gridFields, ...hierarchyFields];
          this.fieldsObs = of(this.fieldData);
        }
        this.rangeHeaderFields = headerArray.filter(head => head.dataType === 'DATS' || head.dataType === 'DTMS');
        const rangeGrid = [];
        this.fieldData.forEach(item => {
          const field = {... item};
          field.childs = item.childs.filter(head => head.fldCtrl.dataType === 'DATS' || head.fldCtrl.dataType === 'DTMS')
          if (field.childs.length) {
            rangeGrid.push(field);
          }
        });

        this.rangeHeader = of(this.rangeHeaderFields);
        this.rangeFields = [...rangeGrid];
        this.rangeFieldsObs = of(this.rangeFields)

        if (typeof (this.styleCtrlGrp.get('rangeCalculationFld').value) === 'string') {
          const conditionFieldValue = this.styleCtrlGrp.get('rangeCalculationFld').value;
          let selectedFieldValue: any = this.rangeHeaderFields.find(item => item.fieldId === conditionFieldValue);
          if (!selectedFieldValue) {
            this.rangeFields.some(item => {
              selectedFieldValue = item.childs.find(val => val.fieldId === conditionFieldValue);
              if (selectedFieldValue) {
                return true;
              }
            })
          }
          if (selectedFieldValue)
            this.styleCtrlGrp.get('rangeCalculationFld').setValue(selectedFieldValue);
        }
      }
    });

    const wfldSub = this.wfFields.subscribe(flds => {
      if (flds) {
        this.workflowFields = flds;
        this.workflowFieldsObs = of(flds);
      }
    })
    this.fieldCtrl.valueChanges.pipe(debounceTime(500)).subscribe(res => {
      if (this.styleCtrlGrp.get('isWorkflowdataSet').value === false && this.styleCtrlGrp.get('isCustomdataSet').value === false) {
        this.searchChooseColumn(res);
      }
      if (this.styleCtrlGrp.get('isWorkflowdataSet').value === true && this.styleCtrlGrp.get('isCustomdataSet').value === false) {
        this.searchChooseColumnWorkflow(res);
      }
      if (this.styleCtrlGrp.get('isWorkflowdataSet').value === false && this.styleCtrlGrp.get('isCustomdataSet').value === true) {
        this.searchCustomChooseColumn(res);
      }
    })

    this.styleCtrlGrp.get('rangeCalculationFld').valueChanges.pipe(debounceTime(500)).subscribe(res => {
      if (res) {
        if (typeof (res) === 'string') {
          this.searchRangeColumn(res);
        }
        else {
          if (this.styleCtrlGrp.get('aggregrationOp').value === AggregationOperator.GROUPBY) {
            this.styleCtrlGrp.reset();
          }
          this.searchRangeColumn(res.fieldDescri);
          this.rangeOptions();
        }
      } else {
        this.searchRangeColumn('');
        this.rangeOptions();
      }
    });

    const rangeSub = this.styleCtrlGrp.get('isEnableRange').valueChanges.subscribe(res => {
      this.rangeOptions()
    })
    this.subscriptions.push(rangeSub);

    const filteredSlaSub = this.chartPropCtrlGrp.get('selectSLASteps').valueChanges.pipe(debounceTime(500)).subscribe(res => {
      if (res) {
        const filteredSlaSteps = this.slaSteps.filter(steps => steps.desc.includes(res));
        this.slaStepsObs = of(filteredSlaSteps);
      } else {
        this.slaStepsObs = of(this.slaSteps);
      }
    })
    this.subscriptions.push(fldSub);
    this.subscriptions.push(wfldSub);
    this.subscriptions.push(filteredSlaSub);
  }

  /**
   * Search data sets ..
   * @param value searchable text
   */
  searchDataSet(value: string) {
    this.searchDataSetVal = value;
    if (value) {
      this.dataSetOb = of(this.dataSets.filter(fil => fil.objectdesc.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1));
      this.customDataSetob = of(this.customDataSets.filter(fil => fil.objectdesc.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1));
    } else {
      this.dataSetOb = of(this.dataSets);
      this.customDataSetob = of(this.customDataSets);
    }
  }

  getReportConfig(reportId: string) {
    const userSub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      const reportConfig = this.reportService.getReportConfi(reportId, user.currentRoleId).subscribe(res => {
        this.widgetList = res.widgets;
        this.reportId = res.reportId;
        this.reportName.setValue(res.reportName);
        this.collaboratorPermission = res.permission ? res.permission.isAdmin : false;
      }, error => console.error(`Error: ${error}`));
      this.subscriptions.push(reportConfig);
    });
    this.subscriptions.push(userSub);
  }

  getdropDownValues(fieldId: string, queryString: string) {
    const dropDown = this.schemaService.dropDownValues(fieldId, queryString).subscribe(res => {
      this.dropValues = res;
      this.dropValuesOb = of(res);
    }, error => console.error(`Error: ${error}`));
    this.subscriptions.push(dropDown)
  }

  getAllFields(objNum: string) {
    const allfldSub = this.schemaDetailsService.getMetadataFields(objNum).subscribe(response => {
      this.fields.next(response);
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(allfldSub);
  }

  getWorkFlowFields(objectType: string[]) {
    const workflowFields = this.schemaDetailsService.getWorkflowFields(objectType).subscribe(response => {
      this.wfFields.next(response);
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(workflowFields);
  }

  getAllObjectType() {
    const objSub = this.schemaService.getAllObjectType().subscribe(res => {
      this.dataSets = res;
      this.dataSetOb = of(res);
    }, error => console.error(`Error: ${error}`));
    this.subscriptions.push(objSub);
  }

  getCustomObjectType() {
    const CustomSub = this.reportService.getCustomData().subscribe(res => {
      this.customDataSets = res;
      this.customDataSetob = of(res);
    }, error => console.error(`Error: ${error}`));
    this.subscriptions.push(CustomSub);
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    const movedX = event.distance.x;
    const movedY = event.distance.y;
    console.log(event.item.element.nativeElement);
    console.log(`Moved x: ${movedX} , and moved y : ${movedY}`);

    // drop added widget
    let dropableWidget = new Widget();
    dropableWidget = this.widgetList.filter(wid => (String(wid.widgetId) === event.item.element.nativeElement.id))[0];

    const boxX = Math.round(((dropableWidget.x * this.eachBoxSize) + movedX) / this.eachBoxSize);
    const boxY = Math.round(((dropableWidget.y * this.eachBoxSize) + movedY) / this.eachBoxSize);
    if ((boxX >= 0 && (boxX * this.eachBoxSize) <= this.screenWidth) && (boxY >= 0)) {
      if (boxX + dropableWidget.width <= 200) {
        dropableWidget.x = boxX;
        dropableWidget.y = boxY;
      }
      this.preapreNewWidgetPosition(dropableWidget);
    }
  }

  preapreNewWidgetPosition(dropableWidget: Widget) {
    const oldWidget = this.widgetList.filter(wid => wid.widgetId === dropableWidget.widgetId)[0];
    if (oldWidget) {
      this.widgetList.splice(this.widgetList.indexOf(oldWidget), 1);
      oldWidget.x = dropableWidget.x;
      oldWidget.y = dropableWidget.y;
      this.widgetList.push(oldWidget);
    } else {
      dropableWidget.defaultFilters = [];
      this.widgetList.push(dropableWidget);
    }
    // update variable for dom control
    if (dropableWidget.chartProperties) {
      delete dropableWidget.chartProperties.slaType;
    }
    this.selStyleWid = dropableWidget;
  }

  delete(data: Widget) {
    if (data) {
      const oldWidget = this.widgetList.filter(wid => wid.widgetId === data.widgetId)[0];
      this.widgetList.splice(this.widgetList.indexOf(oldWidget), 1);
      this.selStyleWid = new Widget();
      this.showProperty = false;
      if (oldWidget.widgetTableFields === this.chooseColumns) {
        this.chooseColumns = [];
      }
    }
  }

  showStyle(data: Widget) {
    if (data) {
      this.removeError('fieldCtrl');
      this.removeError('datasetCtrl');
      this.lastSelectedWidget = this.selStyleWid ? this.selStyleWid : {} as Widget;
      this.selStyleWid = data;
      if (this.styleCtrlGrp) {
        // convert miliis to date
        let startDate;
        if (data.dateFilterCtrl && data.dateFilterCtrl.startDate) {
          try {
            startDate = moment.unix(Number(data.dateFilterCtrl.startDate) / 1000).format('MM/DD/YYYY');
          } catch (error) { console.error(`Error : ${error}`); startDate = data.dateFilterCtrl.startDate }
        }
        let endDate;
        if (data.dateFilterCtrl && data.dateFilterCtrl.endDate) {
          try {
            endDate = moment.unix(Number(data.dateFilterCtrl.endDate) / 1000).format('MM/DD/YYYY');
          } catch (error) { console.error(`Error : ${error}`); endDate = data.dateFilterCtrl.endDate }
        }

        const selectedFilterType = this.filterType.find(type => type.key === data.filterType);
        const selectedOrderWith = this.orderWith.find(item => item.key === data.orderWith);
        const selectedAggregrateOp = this.aggregrationOp.find(op => op.key === data.aggregrationOp);
        const selectedDisplayCriteria = this.displayCriteria.find(display => display.key === data.displayCriteria);
        const selectedRangeDateFormat = this.seriesWith.find(type => type.key === data.rangeDateFormatInterval);
        let selectedDateSelectionType = null;
        if (data.dateFilterCtrl?.dateSelectedFor) {
          selectedDateSelectionType = this.dateSelectionType.find(item => item.key === data.dateFilterCtrl?.dateSelectedFor)
        }
        if (data.workflowPath && this.workflowPath) {
          this.selectedWorkflowPath = [];
          data.workflowPath.forEach(value => {
            const filteredValue = this.workflowPath.find((item: any) => item.pathname === value);
            if (filteredValue)
              this.selectedWorkflowPath.push(filteredValue);
          })
          console.log('data.workfow=====,',data.workflowPath,this.selectedWorkflowPath)
        }

        this.styleCtrlGrp.setValue({
          widgetName: data.widgetTitle ? data.widgetTitle : '',
          isCustomdataSet: data.isCustomdataSet ? data.isCustomdataSet : false,
          isWorkflowdataSet: data.isWorkflowdataSet ? data.isWorkflowdataSet : false,
          height: data.height ? data.height : '',
          width: data.width ? data.width : '',
          field: data.field ? data.field : '',
          aggregrationOp: data.aggregrationOp ? selectedAggregrateOp : '',
          filterType: data.filterType ? selectedFilterType : '',
          isMultiSelect: data.isMultiSelect ? data.isMultiSelect : false,
          orderWith: data.orderWith ? selectedOrderWith : this.orderWith[1],
          groupById: data.groupById ? data.groupById : '',
          imageUrl: data.imageUrl ? data.imageUrl : '',
          htmlText: data.htmlText ? data.htmlText : '',
          imagesno: data.imagesno ? data.imagesno : '',
          imageName: data.imageName ? data.imageName : '',
          dateSelectionType: selectedDateSelectionType,
          startDate: startDate ? moment(startDate) : '',
          endDate: endDate ? moment(endDate) : '',
          workflowPath: data.workflowPath ? data.workflowPath : [],
          distictWith: data.distictWith ? data.distictWith : '',
          pageDefaultSize: data.pageDefaultSize ? data.pageDefaultSize : '',
          displayCriteria: data.displayCriteria ? selectedDisplayCriteria : { ...this.displayCriteria[1] },
          objectType: data.objectType ? data.objectType : '',
          isFieldDistinct: data.isFieldDistinct ? data.isFieldDistinct : false,
          isEnableGlobalFilter: data.isEnableGlobalFilter ? data.isEnableGlobalFilter : false,
          applyDistinct: data.applyDistinct ? data.applyDistinct : false,
          rangeBucketLimit: data.rangeBucketLimit ? data.rangeBucketLimit : null,
          rangeBucketSize: data.rangeBucketSize ? data.rangeBucketSize : null,
          rangeCalculationFld: data.rangeCalculationFld ? data.rangeCalculationFld : '',
          rangeDateFormatInterval: data.rangeDateFormatInterval ? selectedRangeDateFormat : null,
          isEnableRange: data.isEnableRange ? true : false,
        });

        // set value to properties frm ctrl
        if (data.chartProperties) {
          console.log(data)
          const selectedTimeInterval = this.timeInterval.find(item => item.key === data.chartProperties.timeseriesStartDate);
          const selectedSeries = this.seriesWith.find(item => item.key === data.chartProperties.seriesWith);
          const selectedChartType = this.chartType.find(type => type.key === data.chartProperties.chartType);
          const selectedOrientation = this.orientation.find(orint => orint.key === data.chartProperties.orientation);
          const selectedDataLabelPosition = this.datalabelsPosition.find(data1 => data1.key === data.chartProperties.datalabelsPosition);
          const selectedLegendPosition = this.legendPosition.find(legend => legend.key === data.chartProperties.legendPosition);
          const selectedOrderWithValues = this.orderWith.find(order => order.key === data.chartProperties.orderWith);
          const selectedBucketFilter = this.bucketFilter.find(bucket => bucket.key === data.chartProperties.bucketFilter);
          const selectStepWiseSla = this.possibleIsStepWiseSLA.find(step => step.key === data.isStepwiseSLA);
          const selectSLASteps = data.workflowPathSteps ? data.workflowPathSteps : [];
          this.chartPropCtrlGrp.patchValue(data.chartProperties);
          this.chartPropCtrlGrp.patchValue({
            bucketFilter: selectedBucketFilter ? selectedBucketFilter : this.bucketFilter[0],
            timeseriesStartDate: selectedTimeInterval ? selectedTimeInterval : null,
            seriesWith: selectedSeries ? selectedSeries : null,
            chartType: selectedChartType ? selectedChartType : null,
            orientation: selectedOrientation ? selectedOrientation : null,
            datalabelsPosition: selectedDataLabelPosition ? selectedDataLabelPosition : null,
            legendPosition: selectedLegendPosition ? selectedLegendPosition : null,
            orderWith: selectedOrderWithValues ? selectedOrderWithValues : null,
            isStepWiseSla: selectStepWiseSla ? selectStepWiseSla : this.possibleIsStepWiseSLA.find(step => step.key === false),
            selectSLASteps
          })
          if (data.chartProperties.hasCustomSLA) {
            const slaType = this.slaMenu.find(item => item.key === data.chartProperties.seriesWith);
            this.chartPropCtrlGrp.patchValue({
              slaType,
            })
          }
          // this.chartPropCtrlGrp.controls.isStepwiseSla.setValue(selectStepWiseSla);
        } else if (data.widgetType === WidgetType.BAR_CHART || data.widgetType === WidgetType.STACKED_BAR_CHART) {
          this.chartPropCtrlGrp.setValue({
            chartType: this.chartType[0], orientation: this.orientation[0], isEnableDatalabels: false,
            datalabelsPosition: this.datalabelsPosition[0], isEnableLegend: false, legendPosition: this.legendPosition[0], xAxisLabel: '', yAxisLabel: '',
            orderWith: this.orderWith[3], scaleFrom: '', scaleTo: '', stepSize: '', dataSetSize: '', seriesWith: this.seriesWith[0], seriesFormat: '', blankValueAlias: '', timeseriesStartDate: this.timeInterval[1],
            isEnabledBarPerc: false, bucketFilter: null, showTotal: false
          });
        }
        // add default filters
        if (data.defaultFilters) {
          const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
          const defFill: Criteria[] = [];
          data.defaultFilters.forEach(each => defFill.push(each));
          frmArray.clear();
          defFill.forEach(dat => {
            frmArray.push(this.formBuilder.group({
              conditionFieldId: [dat.conditionFieldId],
              conditionFieldValue: [dat.conditionFieldValue],
              blockType: [BlockType.COND],
              conditionFieldEndValue: [dat.conditionFieldEndValue],
              conditionOperator: [dat.conditionOperator, Validators.required],
              udrid: [data.widgetId ? data.widgetId : ''],
              showRangeFld: false
            }));
          });
        }
      }
      this.showProperty = true;
      this.chooseColumns = data.widgetTableFields ? data.widgetTableFields : [];

      this.datasetCtrl.setValue('');
      // make while edit widget ..
      if (!data.isWorkflowdataSet && !data.isCustomdataSet && data.objectType) {
        const hasObj = this.dataSets.filter(fil => fil.objectid === data.objectType)[0];
        if (hasObj) {
          this.datasetCtrl.setValue(hasObj);
        }
      } else if (!data.isWorkflowdataSet && data.isCustomdataSet && data.objectType) {
        const hasObj = this.customDataSets.filter(fil => fil.objectid === data.objectType)[0];
        if (hasObj) {
          this.datasetCtrl.setValue(hasObj);
        }
      }
    }
  }

  toggleSelection(field: MetadataModel) {
    const selectedField = this.chooseColumns.filter(fill => fill.fields === field.fieldId);
    if (selectedField && selectedField.length) {
      this.chooseColumns.splice(this.chooseColumns.indexOf(selectedField[0]), 1);
    } else {
      this.chooseColumns.push({ fieldDesc: field.fieldDescri, fieldOrder: this.chooseColumns.length, fields: field.fieldId, widgetId: this.selStyleWid.widgetId });
    }
    const dropableWidget = this.selStyleWid;
    dropableWidget.widgetTableFields = this.chooseColumns;
    this.preapreNewWidgetPosition(dropableWidget);
  }

  isSelected(field: MetadataModel): boolean {
    const selectedField = this.chooseColumns.filter(fill => fill.fields === field.fieldId);
    if (selectedField && selectedField.length) {
      return true;
    }
    return false;
  }
  optionClicked(event: any, field: MetadataModel) {
    this.toggleSelection(field);
  }

  fileChange(event: any) {
    if (event && event.target) {
      const file = event.target.files[0] as File;
      const fileName = file.name.toLocaleLowerCase();
      if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        const uploadUpdateFile = this.schemaService.uploadUpdateFileData(event.target.files[0] as File, this.styleCtrlGrp.get('imagesno').value).subscribe(res => {
          this.styleCtrlGrp.get('imageName').setValue(event.target.files[0] ? event.target.files[0].name : '');
          this.styleCtrlGrp.get('imagesno').setValue(res);
        }, error => console.error(`Error : ${error}`));
        this.subscriptions.push(uploadUpdateFile);
      } else {
        this.toasterService.open(`Only image type file supported`, `Close`, { duration: 2000 });
      }

    }
  }
  uploadFileChange() {
    document.getElementById('uploadFileCtrl').click();
  }

  removeUploadedImage() {
    if (this.styleCtrlGrp) {
      this.styleCtrlGrp.get('imageName').setValue('');
      this.styleCtrlGrp.get('imagesno').setValue('');
    }
  }


  /**
   * Use to add more default filters
   * Now blockType and conditionalOperator is static
   */
  addMoreDefaultFilter() {
    const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
    frmArray.push(this.formBuilder.group({
      conditionFieldId: [''],
      conditionFieldValue: [''],
      blockType: [BlockType.COND],
      conditionOperator: ['', Validators.required],
      conditionFieldEndValue: [''],
      udrid: [this.selStyleWid.widgetId ? this.selStyleWid.widgetId : ''],
      showRangeFld: false
    }));
  }

  /**
   * Remove specific filter from filters
   * @param idx index of array element that use for remove from FormArray
   */
  removeFilter(idx: number) {
    const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
    frmArray.removeAt(idx);
  }

  /**
   * Update field on formGroup while selection change
   * @param fieldData option of selection change
   */
  onFieldChange(fieldData: MatAutocompleteSelectedEvent) {
    if (fieldData && fieldData.option.value) {
      this.styleCtrlGrp.get('field').setValue(fieldData.option.value.fldCtrl ? fieldData.option.value.fldCtrl : fieldData.option.value);
    } else {
      this.styleCtrlGrp.get('field').setValue('');
    }
    console.log(fieldData);
    if (fieldData && fieldData.option && fieldData.option.value.fldCtrl && fieldData.option.value.fldCtrl.dataType) {
      this.fieldDataType = fieldData.option.value.fldCtrl.dataType;
    }

    if (this.selStyleWid.widgetType !== 'TIMESERIES' && this.selStyleWid.field !== 'TIME_TAKEN') {
      this.chartPropCtrlGrp.get('isEnabledBarPerc').setValue(false);
      this.selStyleWid.chartProperties.bucketFilter = null;
    }
    if (this.styleCtrlGrp.get('isEnableRange').value) {
      this.rangeOptions();
    }
  }

  /**
   * To check the Field Datatype
   */
  get checkFieldDataType(): boolean {
    return ['NUMC', 'DEC'].indexOf(this.fieldDataType) >= 0 ? true : false;
  }

  /**
   * Update field on formGroup while selection change
   * @param fieldData option of selection change
   */
  onGroupByChange(fieldData: MatAutocompleteSelectedEvent) {
    if (fieldData && fieldData.option.value) {
      this.styleCtrlGrp.get('groupById').setValue(fieldData.option.value.fieldId);
    } else {
      this.styleCtrlGrp.get('groupById').setValue('');
    }
    console.log(fieldData);
  }

  /**
   * Use for update default filter array
   * @param fieldData selected data or on change dropdown data
   * @param index row index
   */
  onDefaultFilterChange(fieldData: MatAutocompleteSelectedEvent, index: number) {
    const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
    if (fieldData && fieldData.option.value) {
      frmArray.at(index).get('conditionFieldId').setValue(fieldData.option.value.fieldId);
    } else {
      frmArray.at(index).get('conditionFieldId').setValue('');
    }
  }

  /**
   * Use for update default filter conditionFieldEndValue
   * @param fieldData selected data or on change dropdown data
   * @param index row index
   */
  onDefaultFilterEndValChange(fieldData: MatAutocompleteSelectedEvent, index: number) {
    const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
    if (fieldData && fieldData.option.value) {
      frmArray.at(index).get('conditionFieldEndValue').setValue(fieldData.option.value.fieldId);
    } else {
      frmArray.at(index).get('conditionFieldEndValue').setValue('');
    }
  }

  /**
   * Use for update default filter array
   * @param operator selected opertaor or on change dropdown data
   * @param index row index
   */
  operatorSelectionChng(operator: string, index: number) {
    const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
    if (operator) {
      frmArray.at(index).get('conditionOperator').setValue(operator);
    } else {
      frmArray.at(index).get('conditionOperator').setValue('');
    }
  }


  /**
   * Should call api and get the actual records count
   * @param objectType selected object type
   */
  getRecordCount(objectType: string, isWorkflowDataset?: boolean, isCustomdataSet?: boolean) {
    const userSub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      const docCountSub = this.reportService.getDocCount(objectType, user.plantCode, isWorkflowDataset, isCustomdataSet).subscribe(res => {
        this.recordsCount = res;
      }, error => {
        this.recordsCount = null;
        console.error(`Error: ${error}`);
      });
      this.subscriptions.push(docCountSub);
    });
    this.subscriptions.push(userSub);
  }

  /**
   * Should call api and get the actual workflow path
   * @param objectType selected object type
   */

  getWorkFlowPathDetails(objectType: string[]) {
    const workflowPath = this.schemaService.getWorkFlowPath(objectType).subscribe(res => {
      this.workflowPath = res;
      this.workflowPathOb = of(res);
      this.selectedWorkflowPath = [];
      if (this.selStyleWid.workflowPath) {
        this.selStyleWid.workflowPath.forEach(value => {
          const filteredValue = this.workflowPath.find((item: any) => item.pathname === value);
          if (filteredValue)
            this.selectedWorkflowPath.push(filteredValue);
        })
      }
    }, error => console.error(`Error: ${error}`));
    this.subscriptions.push(workflowPath);
  }

  createUpdateReport() {
    this.reportName.markAsTouched()
    if (this.reportName.value === undefined || this.reportName.value.trim() === '') {
      this.reportName.markAllAsTouched()
      this.toasterService.open(`Report name can't be empty`, 'Close', { duration: 2000 });
      return false;
    }

    console.log(this.widgetList);
    if (this.widgetList.length <= 0) {
      this.toasterService.open(`Please configure at least one widget`, 'Close', { duration: 2000 });
      return false;
    }

    for (const widget of this.widgetList) {
      if (widget.widgetType === WidgetType.TABLE_LIST) {
        const setDatesetError = () => {
          this.datasetCtrl.setErrors(Validators.required);
          this.datasetCtrl.markAsTouched({ onlySelf: true });
        };
        const setColumnsError = () => {
          this.fieldCtrl.setErrors(Validators.required);
          this.fieldCtrl.markAsTouched({ onlySelf: true });
        };

        if (!widget.objectType && (!widget.widgetTableFields || widget.widgetTableFields.length === 0)) {
          this.toasterService.open(`Highlighted fields can’t be empty`, 'Close', { duration: 2000 });
          this.showStyle(widget);
          this.ref.detectChanges(); // This is needed if the right sidebar is close
          setDatesetError();
          setColumnsError();
          return false;
        }

        if (!widget.objectType) {
          this.toasterService.open(`Highlighted fields can’t be empty`, 'Close', { duration: 2000 });
          this.showStyle(widget);
          this.ref.detectChanges(); // This is needed if the right sidebar is close
          setDatesetError();
          return false;
        }

        if (!widget.widgetTableFields || widget.widgetTableFields.length === 0) {
          this.toasterService.open(`Highlighted fields can’t be empty`, 'Close', { duration: 2000 });
          this.showStyle(widget);
          this.ref.detectChanges(); // This is needed if the right sidebar is close
          setColumnsError();
          return false;
        }
      }

      if (widget.widgetType === WidgetType.TIMESERIES && widget.field === 'TIME_TAKEN' && widget.isStepwiseSLA && widget.workflowPath.length !== 1) {
        this.toasterService.open(`Please select only workflow path for stepwise sLA reporting`, 'Close', { duration: 2000 });
        return false;
      }
    }

    const request: ReportDashboardReq = new ReportDashboardReq();
    request.reportId = this.reportId;
    request.reportName = this.reportName.value;
    request.widgetReqList = this.widgetList;

    const userSub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      const createUpdateSub = this.reportService.createUpdateReport(request, user.plantCode).subscribe(res => {
        this.reportId = res;
        this.sharedService.setReportListData();
        this.toasterService.open(`Successfully saved change(s)`, 'Close', { duration: 3000 });
      }, errro => {
        this.toasterService.open(`Something went wrong`, 'Close', { duration: 5000 });
      });
      this.subscriptions.push(createUpdateSub);
    });
    this.subscriptions.push(userSub);
  }

  /**
   * Remove Validators.required error form FormControl
   */
  removeError(value: 'fieldCtrl' | 'datasetCtrl') {
    switch (value) {
      case 'fieldCtrl':
        // this.fieldCtrl = new FormControl('');
        this.fieldCtrl.setErrors(null);
        this.fieldCtrl.setValue('');
        this.fieldCtrl.updateValueAndValidity();
        break;
      case 'datasetCtrl':
        this.datasetCtrl = new FormControl(this.datasetCtrl.value);
        break;
      default:
        break;
    }
  }

  /**
   * Reopen when user scroll on the outside of the autoComplete box
   */
  openAutoComplete(autoComplete: MatAutocompleteTrigger) {
    if (!autoComplete.panelOpen) {
      autoComplete.openPanel();
    }
  }

  get possibleOperators(): ConditionalOperator[] {
    // get generic operators
    const genericOp: ConditionalOperator = new ConditionalOperator();
    genericOp.desc = 'Common Operator';
    genericOp.childs = [];
    genericOp.childs.push({ code: 'EQUAL', value: $localize`:@@equal:Equal` });
    genericOp.childs.push({ code: 'NOT_EQUAL', value: $localize`:@@not_equal:Not Equal` });
    genericOp.childs.push({ code: 'STARTS_WITH', value: $localize`:@@starts_with:Starts With` });
    genericOp.childs.push({ code: 'ENDS_WITH', value: $localize`:@@ends_with:Ends With` });
    genericOp.childs.push({ code: 'CONTAINS', value: $localize`:@@contains:Contains` });
    genericOp.childs.push({ code: 'EMPTY', value: $localize`:@@empty:Empty` });
    genericOp.childs.push({ code: 'NOT_EMPTY', value: $localize`:@@not_empty:Not Empty` });

    // for numeric number field
    const onlyNum: ConditionalOperator = new ConditionalOperator();
    onlyNum.desc = 'Numeric Operators';
    onlyNum.childs = [];
    // onlyNum.childs.push('RANGE');
    onlyNum.childs.push({ code: 'LESS_THAN', value: $localize`:@@less_than:Less Than` });
    onlyNum.childs.push({ code: 'LESS_THAN_EQUAL', value: $localize`:@@less_than_equal_to:Less Than Equal To` });
    onlyNum.childs.push({ code: 'GREATER_THAN', value: $localize`:@@greater_than:Greater Than` });
    onlyNum.childs.push({ code: 'GREATER_THAN_EQUAL', value: $localize`:@@Greater_than_equal_to:Greater Than Equal To` });

    // for special operators
    const specialOpe: ConditionalOperator = new ConditionalOperator();
    specialOpe.desc = 'Special Operators';
    specialOpe.childs = [];
    specialOpe.childs.push({ code: 'REGEX', value: $localize`:@@regex:Regex` });
    specialOpe.childs.push({ code: 'FIELD2FIELD', value: $localize`:@@field_to_field:Field To Field` });
    specialOpe.childs.push({ code: 'LOCATION', value: $localize`:@@location:Location` });
    specialOpe.childs.push({ code: 'FIELD2FIELD_EQUAL', value: $localize`:@@field_to_field_equal:Field To Field Equal` });
    specialOpe.childs.push({ code: 'FIELD2FIELD_GREATETHENEQUAL', value: $localize`:@@Field_to_field_greater_than_equal:Field To Field Greater Than Equal` });
    specialOpe.childs.push({ code: 'FIELD2FIELD_GREATETHAN', value: $localize`:@@field_to_field_greater_than:Field To Field Greater Than` });
    specialOpe.childs.push({ code: 'FIELD2FIELD_LESSTHEN', value: $localize`:@@field_to_field_less_than:Field To Field Less Than` });
    specialOpe.childs.push({ code: 'FIELD2FIELD_LESSTHENEQUALTO', value: $localize`:@@field_to_field_less_than_equal:Field To Field Less Than Equal` });
    return [genericOp, onlyNum, specialOpe];
  }

  get frmArray() {
    return this.defaultFilterCtrlGrp.controls.filters as FormArray;
  }

  /**
   * After select workflow data ..
   * @param selected selected workflow data is here
   */
  afterWfSelect(selected: WorkflowResponse[]) {
    if (selected.length) {
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(true);
      this.dataSetOb = of(this.dataSets);
      this.customDataSetob = of(this.customDataSets);
    } else {
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
    }
    this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
    const objId = selected.map(map => map.objectid);
    this.getWorkFlowFields(objId);
    this.getRecordCount(objId.toString(), true);
    this.getWorkFlowPathDetails(objId);
    this.selStyleWid.objectType = objId.toString();
    this.styleCtrlGrp.get('objectType').setValue(objId.toString());
    this.datasetCtrl.setValue('');
  }

  /**
   * Get description...
   * @param data get current module
   */
  displayWithDataSet(data: ObjectTypeResponse): string {
    return data ? data.objectdesc : '';
  }

  afterDataSetSelect(obj: ObjectTypeResponse) {
    if (obj.objectid) {
      this.dataSetOb = of(this.dataSets);
      this.customDataSetob = of(this.customDataSets);
      this.styleCtrlGrp.get('objectType').setValue(obj.objectid);
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
      this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
      this.searchDataSetVal = '';
      this.chooseColumns = [];
    }
  }

  get isWorkflowRefresh(): boolean {
    return (this.selStyleWid ? this.selStyleWid.isWorkflowdataSet : false);
  }

  /**
   * Update field on formGroup while selection change
   * @param fieldData option of selection change
   */
  onDistictWithChange(fieldData: MatAutocompleteSelectedEvent) {
    if (fieldData && fieldData.option.value) {
      this.styleCtrlGrp.get('distictWith').setValue(fieldData.option.value.fldCtrl ? fieldData.option.value.fldCtrl : fieldData.option.value);
    } else {
      this.styleCtrlGrp.get('distictWith').setValue('');
    }
    console.log(fieldData);
  }

  /**
   * Should return field descriptions
   * @param obj curret render object
   */
  chooseColumnDisWith(obj: MetadataModel): string {
    return obj ? obj.fieldDescri : null;
  }

  /**
   * Search choose columns ...
   * @param val searchable text for choose columns ..
   */
  searchChooseColumn(val: string) {
    const listData = JSON.parse(JSON.stringify(this.fieldData));
    this.fieldsObs = of([]);
    if (val && val.trim() !== '') {
      this.headerFields = of(this.headerFls.filter(fil => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1));
      this.fieldsObs = val ? this.filtered(listData, val) : listData;
    } else {
      this.headerFields = of(this.headerFls);
      this.fieldsObs = of(this.fieldData);
    }
  }

  filtered(array, text) {
    const getChildren = (result, object) => {
      const re = new RegExp(text, 'gi');
      if (object.fieldDescri.match(re)) {
        result.push(object);
        return result;
      }
      if (Array.isArray(object.childs)) {
        const children = object.childs.reduce(getChildren, []);
        if (children.length) result.push({ ...object, childs: children });
      }
      return result;
    };
    return of(array.reduce(getChildren, []));
  }

  /**
   * Search choose columns ...
   * @param val searchable text for choose columns ..
   */
  searchCustomChooseColumn(val: string) {
    if (val && val.trim() !== '') {
      this.CustomfieldsObs = of(this.Customfields.filter(fil => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1));
    } else {
      this.CustomfieldsObs = of(this.Customfields);
    }
  }

  /**
   * Choose column searchable fields...
   * @param val searchable string for choose column
   */
  searchChooseColumnWorkflow(val: string) {
    if (val && val.trim() !== '') {
      const sysFld = this.workflowFields.static.filter(fil => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1);
      const dynFld = this.workflowFields.dynamic.filter(fil => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1);
      this.workflowFieldsObs = of({ dynamic: dynFld, static: sysFld });
    } else {
      this.workflowFieldsObs = of(this.workflowFields);
    }
  }

  /**
   * function to control width of widget entered by user..
   * @param value width entered by user..
   */
  widthCount(value: number) {
    const marginCount = this.selStyleWid.x;
    if (marginCount + Number(value) > 200) {
      const width = 200 - marginCount;
      return this.styleCtrlGrp.get('width').setValue(width);
    }
  }

  /**
   * function to control height of widget entered by user..
   * @param value height entered by user..
   */
  heightCount(value: number) {
    if (value > 1000) {
      return this.styleCtrlGrp.get('height').setValue(1000);
    }
  }

  /**
   * function to add widget on dashboard
   * @param event mouseEvent value is visible
   * @param id widget type choose by user
   */
  addWidget(event: MouseEvent, id) {
    const movedX = event.movementX;
    const movedY = event.movementY;

    // console.log(`Moved x: ${movedX} , and moved y : ${movedY}`);

    // drop added widget
    const dropableWidget = new Widget();
    const widgetType = id;
    dropableWidget.x = 0;
    dropableWidget.y = 0;
    dropableWidget.height = 24;
    dropableWidget.width = 30;

    // set default height to table
    if (widgetType === 'TABLE_LIST') {
      dropableWidget.height = Math.floor(500 / this.eachBoxSize);
      dropableWidget.width = Math.floor(500 / this.eachBoxSize);
    }
    dropableWidget.widgetId = String(new Date().getTime());
    dropableWidget.widgetType = widgetType as WidgetType;

    const boxX = Math.round(((dropableWidget.x * this.eachBoxSize) + movedX) / this.eachBoxSize);
    const boxY = Math.round(((dropableWidget.y * this.eachBoxSize) + movedY) / this.eachBoxSize);
    if ((boxX >= 0 && (boxX * this.eachBoxSize) <= this.screenWidth) && (boxY >= 0)) {
      if (this.widgetList.length > 0) {
        const lastWidget = this.widgetList[this.widgetList.length - 1];
        dropableWidget.x = boxX + lastWidget.x + 11;
        dropableWidget.y = boxY + lastWidget.y + 11;
        if (dropableWidget.x + dropableWidget.width > 200) {
          dropableWidget.x = boxX;
          dropableWidget.y = boxY;
        }
      } else {
        dropableWidget.x = boxX;
        dropableWidget.y = boxY;
      }

      // add chart properties on widget list
      if ((dropableWidget.widgetType === WidgetType.BAR_CHART || dropableWidget.widgetType === WidgetType.STACKED_BAR_CHART)) {
        dropableWidget.chartProperties = {
          chartType: ChartType.BAR, orientation: Orientation.VERTICAL, isEnableDatalabels: false,
          datalabelsPosition: DatalabelsPosition.center, isEnableLegend: false, legendPosition: LegendPosition.top,
          xAxisLabel: '', yAxisLabel: '', orderWith: OrderWith.ROW_DESC, scaleFrom: null, scaleTo: null, stepSize: null,
          dataSetSize: null, seriesWith: SeriesWith.day, seriesFormat: null, blankValueAlias: null, timeseriesStartDate: TimeseriesStartDate.D7, isEnabledBarPerc: false,
          bucketFilter: null, hasCustomSLA: false, showTotal: false
        };
      }
      this.isSerieswithDisabled = false;
      this.preapreNewWidgetPosition(dropableWidget);
      this.showStyle(dropableWidget);
    }
  }

  /**
   * After select cuatom data ..
   * @param selected selected custom data is here
   */
  afterCustomSelect(obj: ObjectTypeResponse) {
    if (obj.objectid) {
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
      this.styleCtrlGrp.get('isCustomdataSet').setValue(true);
      this.styleCtrlGrp.get('objectType').setValue(obj.objectid);
      this.searchDataSetVal = '';
      this.chooseColumns = [];
      this.getRecordCount(obj.objectid, false, true);
    }
  }

  getCustomFields(objNum: string) {
    const CustomfldSub = this.reportService.getCustomDatasetFields(objNum).subscribe(response => {
      this.Customfields = response;
      this.CustomfieldsObs = of(response);
      console.log(this.Customfields);
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(CustomfldSub);
  }

  get isCustomRefresh(): boolean {
    return (this.selStyleWid ? this.selStyleWid.isCustomdataSet : false);
  }

  /**
   * Update field on formGroup while selection change
   * @param fieldData option of selection change
   */
  onCustomFieldChange(fieldData: MatAutocompleteSelectedEvent) {
    if (fieldData && fieldData.option.value) {
      this.styleCtrlGrp.get('field').setValue(fieldData.option.value ? fieldData.option.value : '');
    } else {
      this.styleCtrlGrp.get('field').setValue('');
    }
  }

  get isSriesWithVisibile(): boolean {
    if (this.styleCtrlGrp.get('field').value && this.styleCtrlGrp.get('groupById').value && this.styleCtrlGrp.get('distictWith').value) {
      this.selectedOption = 'year';
      this.isSerieswithDisabled = true;
      return false;
    }
    else {
      this.isSerieswithDisabled = false;
      return true;
    }

  }
  checkNumLength(value: number) {
    if (value > 1000) {
      return this.styleCtrlGrp.get('pageDefaultSize').setValue(1000);
    } else if (value < 1) {
      return this.styleCtrlGrp.get('pageDefaultSize').setValue('');
    }
  }

  checkEnabledBarPerc() {
    if (this.chartPropCtrlGrp.get('chartType').value === 'PIE') {
      this.chartPropCtrlGrp.get('isEnabledBarPerc').setValue(false);
    }
  }

  displayProperties(opt) {
    return opt ? opt.value : null;
  }

  getValue(value, control) {
    const searchText = control && control.value ? (typeof control.value === 'string' ? control.value : control.value.value) : '';
    return searchText ? value.filter(item => item.value.toLowerCase().includes(searchText.toLowerCase())) : value;
  }

  getSeriesValue(value, control) {
    const searchText = control.value;
    return searchText ? value.filter(item => item.toLowerCase().includes(searchText.toLowerCase())) : value;
  }

  displayWithWorkflowDesc() {
    const workflowPath = this.selectedWorkflowPath.map((item: any) => item.workflowdesc);
    return workflowPath.join(',');
  }

  selectedWorkFlow(value) {
    const index = this.selectedWorkflowPath.findIndex((item: any) => item.pathname === value.pathname)
    if (index > -1) {
      this.selectedWorkflowPath.splice(index, 1);
      this.selStyleWid.workflowPath.splice(index, 1)
    } else {
      this.selectedWorkflowPath.push(value);
      if (!this.selStyleWid.workflowPath) {
        this.selStyleWid.workflowPath = [];
      }
      this.selStyleWid.workflowPath.push(value.pathname);
    }
    if (this.selStyleWid.isStepwiseSLA && this.selectedWorkflowPath.length === 1) {
      this.inValidSLA = false;
      this.getWorkflowSteps(this.selectedWorkflowPath[0].pathname)

    }
    else if (this.selStyleWid.isStepwiseSLA && this.selStyleWid.workflowPath.length !== 1) {
      this.inValidSLA = true;
    }
  }

  isCheckedWorkflow(value) {
    const index = this.selectedWorkflowPath.findIndex((item: any) => item.pathname === value.pathname);
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }


  /**
   * return the possible bucket filter values for drop down values
   */
  get possibleBucketFilter() {
    const bucketFilter = [
      { key: BucketFilter.WITHIN_1_DAY, value: $localize`:@@withinSLA:Within time limit` },
      { key: BucketFilter.MORE_THEN_1_DAY, value: $localize`:@@exceedsSLA:Exceeds time limit` }
    ];
    return bucketFilter;
  }

  /**
   * return the possible time interval values for drop down values
   */
  get possibleTimeIntervalFilter() {
    const timeInterval = [
      { key: SeriesWith.millisecond, value: $localize`:@@today:Today` },
      { key: TimeseriesStartDate.D7, value: TimeseriesStartDate.D7 },
      { key: TimeseriesStartDate.D10, value: TimeseriesStartDate.D10 },
      { key: TimeseriesStartDate.D20, value: TimeseriesStartDate.D20 },
      { key: TimeseriesStartDate.D30, value: TimeseriesStartDate.D30 },
    ]
    return timeInterval;
  }

  /**
   * return the possible filter type values for drop down value
   */
  get possibleFilterType() {
    const filterType = [
      { key: FilterWith.DROPDOWN_VALS, value: $localize`:@@dropdownValue: Dropdown value` },
      { key: FilterWith.HORIZONTAL_VALS, value: $localize`:@@horizontalValue:Horizontal value` },
      { key: FilterWith.VERTICAL_VALS, value: $localize`:@@verticalValue:Vertical value` }
    ];
    return filterType
  }

  /**
   * return the possible orderWith drop down values
   */
  get possibleOrderWith() {
    const orderWith = [
      { key: OrderWith.ASC, value: $localize`:@@ascending :Ascending` },
      { key: OrderWith.DESC, value: $localize`:@@descending:Descending` },
      { key: OrderWith.ROW_ASC, value: $localize`:@@rowAscending:Row ascending` },
      { key: OrderWith.ROW_DESC, value: $localize`:@@rowDescending : Row descending` },
      { key: OrderWith.COL_ASC, value: $localize`:@@columnAscending : Column Ascending` },
      { key: OrderWith.COL_DESC, value: $localize`:@@columnDescending:Column Descending` }
    ];
    return orderWith;
  }

  /**
   * return the possible series With drop Down values
   */
  get possibleseriesWith() {
    const seriesWith = [
      { key: SeriesWith.day, value: $localize`:@@day:Day` },
      { key: SeriesWith.week, value: $localize`:@@week:Week` },
      { key: SeriesWith.month, value: $localize`:@@month:Month` },
      { key: SeriesWith.quarter, value: $localize`:@@quarter:Quarter` },
      { key: SeriesWith.year, value: $localize`:@@year:Year` }
    ]
    return seriesWith;
  }

  /**
   *  return the possible aggregration operator values for drop down
   */
  get possibleAggregrationOperator() {
    const aggregrationOp = [
      { key: AggregationOperator.GROUPBY, value: $localize`:@@groupBy:Group by` },
      { key: AggregationOperator.COUNT, value: $localize`:@@count:Count` },
      { key: AggregationOperator.SUM, value: $localize`:@@sum:Sum` }
    ];
    return aggregrationOp
  }


  /**
   *  return the possible aggregration operator values for drop down
   */
  get possibleDisplayCriteria() {
    const displayCriteria = [
      { key: DisplayCriteria.CODE, value: $localize`:@@code:Code` },
      { key: DisplayCriteria.TEXT, value: $localize`:@@text:Text` },
      { key: DisplayCriteria.CODE_TEXT, value: $localize`:@@codeAndText:Code & Text` }
    ];
    return displayCriteria
  }

  /**
   *  return the possible chart type values for drop down
   */
  get possibleChartType() {
    const chartType = [
      { key: ChartType.BAR, value: $localize`:@@bar:Bar` },
      { key: ChartType.PIE, value: $localize`:@@pie:Pie` },
      { key: ChartType.LINE, value: $localize`:@@line: Line` }
    ];
    return chartType;
  }

  /**
   *  return the possible orientation values for drop down
   */
  get possibleOrientation() {
    const orientation = [
      { key: Orientation.VERTICAL, value: $localize`:@@vertical:Vertical` },
      { key: Orientation.HORIZONTAL, value: $localize`:@@horizontal:Horizontal` }
    ];
    return orientation;
  }

  /**
   *  return the possible data label position values for drop down
   */
  get possibleDataLablesPosition() {
    const datalabelsPosition = [
      { key: DatalabelsPosition.center, value: $localize`:@@center:Center` },
      { key: DatalabelsPosition.start, value: $localize`:@@start:Start` },
      { key: DatalabelsPosition.end, value: $localize`:@@end:End` }
    ];
    return datalabelsPosition;
  }

  /**
   *  return the possible legend values for drop down
   */
  get possibleLegendPosition() {
    const legendPosition = [
      { key: LegendPosition.top, value: $localize`:@@top:Top` },
      { key: LegendPosition.left, value: $localize`:@@left:Left` },
      { key: LegendPosition.bottom, value: $localize`:@@bottom:Bottom` },
      { key: LegendPosition.right, value: $localize`:@@right:Right` }
    ];
    return legendPosition;
  }

  /**
   *  return the possible legend values for drop down
   */
  get possibleDateSelectionType() {
    const dateSelectionType = [
      { key: DateSelectionType.TODAY, value: $localize`:@@today:Today` },
      { key: DateSelectionType.DAY_7, value: $localize`:@@7Days:7 days` },
      { key: DateSelectionType.DAY_10, value: $localize`:@@10Days : 10 days` },
      { key: DateSelectionType.DAY_20, value: $localize`:@@20Days:20 days` },
      { key: DateSelectionType.DAY_30, value: $localize`:@@30Days:30 days` },
      { key: DateSelectionType.CUSTOM, value: $localize`:@@customDate:Custom date` },
    ]
    return dateSelectionType;
  }

  /**
   *  return the possible sla menu values for drop down
   */
  get possibleSLAMenu() {
    const possibleSlaMenu = [
      { key: SeriesWith.hour, value: $localize`:@@hour:Hour` },
      { key: SeriesWith.day, value: $localize`:@@day:Day` }
    ]
    return possibleSlaMenu;
  }

  /**
   *  return the possible stepwise sla menu values for drop down
   */
  get possibleIsStepWiseSLA() {
    const possibleStepWiseSla = [
      { key: true, value: $localize`:@@yes:Yes` },
      { key: false, value: $localize`:@@no:No` }
    ]
    return possibleStepWiseSla;
  }

  /**
   *
   * @param response holds the field meta data
   * @returns formated data for map hierarchy
   */
  public mapHierarchyFields(response: MetadataModeleResponse): Metadata[] {
    const metadata: Metadata[] = [];
    if (response && response.hierarchy) {
      response.hierarchy.forEach(hierarchy => {
        const hierarchyChilds: Metadata[] = [];
        if (response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld => {
            const hierarchyDesc = response.hierarchy.find((x) => { return x.heirarchyId === hierarchy.heirarchyId });
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
            hierarchyChilds.push({
              fieldId: fldCtrl.fieldId,
              fieldDescri: fldCtrl.fieldDescri,
              isGroup: false,
              fldCtrl,
              childs: [],
              fieldType: this.getHierarchyParentField(hierarchyDesc)
            });
          });
        }

        metadata.push({
          fieldId: hierarchy.heirarchyId,
          fieldDescri: hierarchy.heirarchyText,
          isGroup: true,
          childs: hierarchyChilds
        });
      });
      return metadata;
    }
  }

  /**
   *
   * @param hierarchy hierarchy data
   * @returns the parent field for respective child field
   */
  getHierarchyParentField(hierarchy: Heirarchy): ParentField {
    const parentField: ParentField = {
      fieldId: hierarchy?.fieldId,
      fieldDescri: hierarchy?.heirarchyText,
    }
    return parentField;
  }

  /**
   *
   * @param response complete response of metadata field
   * @returns transformed meta data for grid fields
   */
  mapGridFields(response) {
    const metaData: Metadata[] = []
    Object.keys(response.grids).forEach(grid => {
      const gridChilds: Metadata[] = [];
      if (response.gridFields && response.gridFields.hasOwnProperty(grid)) {
        Object.keys(response.gridFields[grid]).forEach(fld => {
          const gridDesc = this.getGridParentField(response.grids[grid]);
          const fldCtrl = response.gridFields[grid][fld];
          gridChilds.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            fldCtrl,
            childs: [],
            fieldType: gridDesc
          });
        });
      }
      metaData.push({
        fieldId: grid,
        fieldDescri: response.grids[grid].fieldDescri,
        isGroup: true,
        childs: gridChilds
      });
    })
    return metaData;
  }

  /**
   *
   * @param grid grid data
   * @returns parent field for respective child field
   */
  getGridParentField(grid: MetadataModel) {
    const parentField: ParentField = {
      fieldId: grid?.fieldId,
      fieldDescri: grid?.fieldDescri,
    }
    return parentField;
  }

  /**
   * Search choose columns ...
   * @param val searchable text for choose columns ..
   */
  searchRangeColumn(val: string) {
    const listData = JSON.parse(JSON.stringify(this.rangeFields));
    this.rangeFieldsObs = of([]);
    if (val && val.trim() !== '') {
      this.rangeHeader = of(this.rangeHeaderFields.filter(fil => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1));
      this.rangeFieldsObs = val ? this.filtered(listData, val) : listData;
    } else {
      this.rangeHeader = of(this.rangeHeaderFields);
      this.rangeFieldsObs = of(this.fieldData);
    }
  }

  // rangeOptions() {
  //   const rangeSelectionFieldType = this.styleCtrlGrp.get('rangeCalculationFld').value;
  //   if ((this.selStyleWid.widgetType !== WidgetType.COUNT && !this.styleCtrlGrp.get('isEnableRange').value)) {
  //     return [AggregationOperator.GROUPBY];
  //   }
  //   else if (this.selStyleWid.widgetType === WidgetType.COUNT && this.checkFieldDataType) {
  //     return [AggregationOperator.COUNT, AggregationOperator.SUM];
  //   }
  //   else if (this.selStyleWid.widgetType === WidgetType.COUNT && !this.checkFieldDataType) {
  //     return [AggregationOperator.COUNT];
  //   }
  //   else if (this.styleCtrlGrp.get('isEnableRange').value && this.selStyleWid.widgetType !== WidgetType.COUNT) {
  //     if (rangeSelectionFieldType.dataType && (rangeSelectionFieldType.dataType === 'DATS' || rangeSelectionFieldType.dataType === 'DTMS') && (this.fieldDataType === 'DATS' || this.fieldDataType === 'DTMS')) {
  //       return [AggregationOperator.GROUPBY, AggregationOperator.COUNT];
  //     }
  //     else if (this.checkFieldDataType && rangeSelectionFieldType === '') {
  //       return [AggregationOperator.GROUPBY, AggregationOperator.COUNT];
  //     } else {
  //       return [AggregationOperator.GROUPBY, AggregationOperator.COUNT, AggregationOperator.SUM];
  //     }
  //   }
  // }

  getpreSelectedFieldDataType(fieldData) {
    if (fieldData)
      this.fieldDataType = fieldData.fldCtrl.dataType;
  }

  getWorkflowSteps(workflowId) {
    this.reportService.getSlaSteps(workflowId).subscribe(res => {
      this.slaSteps = res;
      this.slaStepsObs = of(this.slaSteps);
      if(this.chartPropCtrlGrp.get('selectSLASteps').value) {
        const selectedSteps = this.chartPropCtrlGrp.get('selectSLASteps').value;
        if (selectedSteps.length && typeof (selectedSteps[0]) === 'string') {
          const selectedValues = selectedSteps.map(item => {
            const selectedValue = this.slaSteps.find(el => el.stepId === item);
            return selectedValue;
          })
          this.chartPropCtrlGrp.controls.selectSLASteps.patchValue(selectedValues);
        }
      }
    })
  }

  isCheckedSla(option) {
    const index = this.selStyleWid.workflowPathSteps.findIndex(steps => steps === option.stepId);
    if (index > -1) {
      return true;
    } else return false
  }

  rangeOptions() {
    const rangeSelectionFieldType = this.styleCtrlGrp.get('rangeCalculationFld').value;
    let dropDownValue = []
    if ((this.selStyleWid.widgetType !== WidgetType.COUNT && !this.styleCtrlGrp.get('isEnableRange').value)) {
      dropDownValue = this.possibleAggregrationOperator
    }
    else if (this.selStyleWid.widgetType === WidgetType.COUNT && this.checkFieldDataType) {
      dropDownValue = this.possibleAggregrationOperator.filter(op => op.key !== AggregationOperator.GROUPBY)
    }
    else if (this.selStyleWid.widgetType === WidgetType.COUNT && !this.checkFieldDataType) {
      dropDownValue = this.possibleAggregrationOperator.filter(op => op.key !== AggregationOperator.GROUPBY && op.key !== AggregationOperator.SUM)
    }
    else if (this.styleCtrlGrp.get('isEnableRange').value && this.selStyleWid.widgetType !== WidgetType.COUNT) {
      if (rangeSelectionFieldType.dataType && (rangeSelectionFieldType.dataType === 'DATS' || rangeSelectionFieldType.dataType === 'DTMS') && (this.fieldDataType === 'DATS' || this.fieldDataType === 'DTMS')) {
        dropDownValue = this.possibleAggregrationOperator.filter(op => op.key === AggregationOperator.COUNT)
      }
      else if (this.checkFieldDataType && rangeSelectionFieldType === '') {
        dropDownValue = this.possibleAggregrationOperator.filter(op => op.key === AggregationOperator.COUNT)
      } else if (this.checkFieldDataType && rangeSelectionFieldType) {
        dropDownValue = this.possibleAggregrationOperator.filter(op => op.key === AggregationOperator.SUM ||  op.key === AggregationOperator.COUNT);
      } else if (!this.checkFieldDataType && rangeSelectionFieldType) {
        dropDownValue = dropDownValue = this.possibleAggregrationOperator.filter(op => op.key === AggregationOperator.COUNT);
      } else {
        dropDownValue = [...this.possibleAggregrationOperator];
      }
    }
    this.aggregrationOp = [...dropDownValue];
    if(this.styleCtrlGrp.get('aggregrationOp') && this.styleCtrlGrp.get('aggregrationOp').value) {
      const isAggregrationOpExist = this.aggregrationOp.find(item=>item.key === this.styleCtrlGrp.get('aggregrationOp').value.key);
      if(!isAggregrationOpExist) {
        this.styleCtrlGrp.get('aggregrationOp').reset();
      }
    }
  }
  stepSelection(field: SlaStepSize) {
    const selectedStep = this.selStyleWid.workflowPathSteps.filter(step => step === field.stepId);
    if(selectedStep && selectedStep.length) {
      this.selStyleWid.workflowPathSteps.splice(this.selStyleWid.workflowPathSteps.indexOf(selectedStep[0]), 1);
    } else {
      this.selStyleWid.workflowPathSteps.push(field.stepId);
      this.chartPropCtrlGrp.get('selectSLASteps').setValue(this.selStyleWid.workflowPathSteps);
    }
  }
}

