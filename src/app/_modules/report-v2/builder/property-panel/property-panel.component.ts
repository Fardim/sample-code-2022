import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ViewChild,
  LOCALE_ID,
  Inject,
} from '@angular/core';
import {
  Widget,
  WidgetType,
  WidgetTableModel,
  ChartType,
  Orientation,
  DatalabelsPosition,
  LegendPosition,
  BlockType,
  TimeseriesStartDate,
  Criteria,
  OrderWith,
  SeriesWith,
  DisplayCriteria,
  FilterWith,
  BucketFilter,
  AggregationOperator,
  DateSelectionType,
  Report,
  ReportDashboardReq,
  TimeTaken,
  WorkflowFieldRes
} from '../../_models/widget';
import { Observable, of, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ReportService } from '../../_service/report.service';
import { Heirarchy, MetadataModel, MetadataModeleResponse, ParentField } from 'src/app/_models/schema/schemadetailstable';
import { ActivatedRoute } from '@angular/router';
import { Dataset, ObjectTypeResponse, WorkflowPath, WorkflowResponse } from 'src/app/_models/schema/schema';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import * as moment from 'moment';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import {
  DropDownValue,
  ConditionalOperator,
  CoreSchemaBrInfo,
} from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { UserService } from '@services/user/userservice.service';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { isEqual } from 'lodash';
import { SlaStepSize } from '@modules/report/_models/widget';
import { cloneDeep } from 'lodash';
import { CoreService } from '@services/core/core.service';
import { WidgetService } from '@services/widgets/widget.service';
import { debounce } from 'lodash';
import { DmsService } from '@services/dms/dms.service';
import { ProcessService } from '@services/process/process.service';

@Component({
  selector: 'pros-property-panel',
  templateUrl: './property-panel.component.html',
  styleUrls: ['./property-panel.component.scss'],
})
export class PropertyPanelComponent implements OnInit, OnChanges, OnDestroy {
  readonly OrderWith = OrderWith;

  /** store widget data */
  @Input() report: Report;
  styleSub: Subscription;
  chartPropSub: Subscription;
  defaultFilterSub: Subscription;
  selectedBrIds = [];

  /** store widget data */
  public get widgetList(): Widget[] {
    return this.report.widgets;
  }

  @Input() showReportSettings: boolean;

  /** store widget data */
  @Input() widgetInfo: Widget;
  /** store widget data */
  selStyleWid: Widget;

  /** store module data set object */
  @Input() dataSets: Dataset[];

  /** store custom data set object */
  @Input() customDataSets: ObjectTypeResponse[] = [];

  /** store DIW data set object */
  @Input() diwDataSets: ObjectTypeResponse[] = [];

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  @Output() saveDraft: EventEmitter<ReportDashboardReq> = new EventEmitter();

  fieldDataType: string;

  /** Form object for widget */
  styleCtrlGrp: FormGroup;

  /** Form object for widget */
  reportCtrlGrp: FormGroup;

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
  fld2FldArray = [
    'FIELD2FIELD',
    'FIELD2FIELD_EQUAL',
    'FIELD2FIELD_GREATETHENEQUAL',
    'FIELD2FIELD_GREATETHAN',
    'FIELD2FIELD_LESSTHEN',
    'FIELD2FIELD_LESSTHENEQUALTO',
  ];

  /** Store current search text for datasets */
  searchDataSetVal = '';

  /** Maximum length of report name */
  maxReportNameLength = 100;

  /** store module data set object */
  dataSetOb: Observable<Dataset[]> = of([]);

  /** store custom data set object */
  customDataSetob: Observable<ObjectTypeResponse[]> = of([]);

  /** store DIW data set object */
  DIWDatasetOb: Observable<ObjectTypeResponse[]> = of([]);

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

  selectedBusinessRules = [];

  // to store selected workflow dataset count
  workFlowDatasetCount = 0;

  /**
   * flag to store boolean value
   */
  @Input() isDiscard: boolean;

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
    },
    {
      fieldId: 'DATEMODIFIED',
      fieldDescri: 'Update Date',
      picklist: '0',
      dataType: 'DTMS',
    },
    {
      fieldId: 'DATECREATED',
      fieldDescri: 'Creation Date',
      picklist: '0',
      dataType: 'DTMS',
    },
  ] as MetadataModel[];

  systemFieldsObs: Observable<MetadataModel[]> = of(this.systemFields);
  bucketFilter = this.possibleBucketFilter;

  slaMenu = this.possibleSLAMenu;
  timeInterval = this.possibleTimeIntervalFilter;

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
  timeTakenOption = this.possibleTimeTaken;

  rangeFields: Metadata[] = [];
  rangeFieldsObs: Observable<Metadata[]> = of([]);

  rangeHeader: Observable<MetadataModel[]> = of([]);
  rangeHeaderFields: MetadataModel[] = [];

  rangeSystem: Observable<MetadataModel[]> = of([]);
  rangeSystemFields: MetadataModel[] = [];

  rangeHierarchy: Observable<MetadataModel[]> = of([]);
  rangeHierarchyFields: MetadataModel[] = [];

  rangeWorkFlow: Observable<MetadataModel[]> = of([]);
  rangeWorkFlowFields: MetadataModel[] = [];

  @ViewChild('optionInput') optionInput: ElementRef;
  @ViewChild('workflowPathDiv') workflowPathDiv : ElementRef;
  inValidSLA: boolean;
  measureFields: Metadata[] = [];
  measureFieldsObs: Observable<Metadata[]> = of([]);

  measureHeader: Observable<MetadataModel[]> = of([]);
  measureHeaderFields: MetadataModel[] = [];

  saveQueue: Subject<Widget> = new Subject<Widget>();
  isDIWDatasetSelected = false;
  // to add values in array of multiselect
  selectedOptions: string[] = [];
  /*** number of chips to show as selected*/
  limit = 5;

  businessRuleFormCtrl: FormControl = new FormControl('');
  /*** Reference to the input */
  @ViewChild('diwDatasetOptionInput') diwDatasetOptionInput: ElementRef<HTMLInputElement>;
  businessRuleOptions: Observable<CoreSchemaBrInfo[]>;
  allBusinessRulesOptions: CoreSchemaBrInfo[] = [];

  aggregationOpeHint = 'Aggregration operator selection is mandatory';
  reportNameTouched = false;
  widgetNameTouched = false;

  // added regex for dashboar/report name validation
  regex = /^[^*|\":<>[\]{}`\\()';?$]+$/;
  delayedCallgetAllFields = debounce((searchText: string) => {
    this.getAllFields(searchText);
    if((typeof parseInt(searchText)) ==='number') this.getRecordCount(searchText);
  }, 600);

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private toasterService: TransientService,
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService,
    private userService: UserService,
    private coreService : CoreService,
    @Inject(LOCALE_ID) public locale: string,
    private widgetService: WidgetService,
    private dmsService: DmsService,
    private processService: ProcessService,
  ) {}

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    if (this.showReportSettings) {
      this.reportCtrlGrp = this.formBuilder.group({
        reportName: [this.report.reportName || '', [Validators.required, Validators.pattern(this.regex)]],
        reportDesciption: [this.report.reportDesciption || ''],
      });
      const sub = this.reportCtrlGrp.valueChanges.pipe(debounceTime(1000), distinctUntilChanged(isEqual)).subscribe((value) => {
        this.report.reportName = value.reportName;
        this.report.reportDesciption = value.reportDesciption;
        const request: ReportDashboardReq = new ReportDashboardReq();
        request.reportId = this.report.reportId;
        request.reportName = value.reportName;
        request.reportDesciption = value.reportDesciption;
        request.widgetReqList = this.report.widgets;
        this.saveDraft.emit(request);
      });
      this.subscriptions.push(sub);
    } else {
      this.initWidgetProperty();
    }
  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value): CoreSchemaBrInfo[] {
    const filterValue = value.toLowerCase();
    return this.allBusinessRulesOptions.filter((val) => (val.desc || val.brInfo).toLowerCase().indexOf(filterValue) === 0);
  }

  initWidgetProperty() {
    this.dataSetOb = of(this.dataSets);
    // this.customDataSetob = of(this.customDataSets);
    this.DIWDatasetOb = of(this.diwDataSets);
    this.selStyleWid = JSON.parse(JSON.stringify(this.widgetInfo));

    this.styleCtrlGrp = this.formBuilder.group({
      widgetName: ['', [Validators.required, Validators.pattern(this.regex)]],
      field: [''],
      aggregrationOp: ['', Validators.required],
      filterType: [''],
      isMultiSelect: [false],
      orderWith: [null],
      groupById: [''],
      objectType: [''],
      imageUrl: [''],
      htmlText: [''],
      imagesno: [''],
      imageName: [''],
      dateSelectionType: [],
      date: [''],
      // endDate: [''],
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
      measureFld: [''],
      brs: [''],
      datasetType: [''],
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
      orderWith: [null],
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
      isStepWiseSla: [],
      timeTakenReportType: [],
      isEnableBenchMark: [false],
      benchMarkValue: ['']
    });

    this.defaultFilterCtrlGrp = this.formBuilder.group({
      filters: this.formBuilder.array([]),
    });

    const styleSub = this.styleCtrlGrp.get('objectType').valueChanges.subscribe((fillData) => {
      if (fillData && typeof fillData === 'string') {
        if (
          (fillData !== this.styleCtrlGrp.value.objectType ||
            (fillData === this.styleCtrlGrp.value.objectType &&
              (this.selStyleWid.isWorkflowdataSet !== this.lastSelectedWidget.isWorkflowdataSet ||
                this.selStyleWid.isCustomdataSet !== this.lastSelectedWidget?.isCustomdataSet))) &&
          !this.selStyleWid.isWorkflowdataSet &&
          !this.selStyleWid.isCustomdataSet &&
          !this.isDIWDatasetSelected
        ) {
          if(this.selStyleWid.widgetType !== WidgetType.DATASET_LIST) this.delayedCallgetAllFields(fillData);
          this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
          this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
        }
        if (
          (fillData !== this.styleCtrlGrp.value.objectType ||
            (fillData === this.styleCtrlGrp.value.objectType &&
              this.selStyleWid.isWorkflowdataSet !== this.lastSelectedWidget.isWorkflowdataSet)) &&
          this.selStyleWid.isWorkflowdataSet &&
          !this.selStyleWid.isCustomdataSet &&
          !this.isDIWDatasetSelected
        ) {
          this.getWorkFlowFields(fillData.split(','));
          this.getRecordCount(fillData, true);
          this.getWorkFlowPathDetails(fillData.split(','));
          this.styleCtrlGrp.get('isWorkflowdataSet').setValue(true);
          this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
        }
        if (
          (fillData !== this.styleCtrlGrp.value.objectType ||
            (fillData === this.styleCtrlGrp.value.objectType &&
              this.selStyleWid.isCustomdataSet !== this.lastSelectedWidget.isCustomdataSet)) &&
          this.selStyleWid.isCustomdataSet &&
          !this.selStyleWid.isWorkflowdataSet &&
          !this.isDIWDatasetSelected
        ) {
          this.getCustomFields(fillData);
          this.getRecordCount(fillData, false, true);
          this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
          this.styleCtrlGrp.get('isCustomdataSet').setValue(true);
        }
        if (
          (fillData !== this.styleCtrlGrp.value.objectType ||
            (fillData === this.styleCtrlGrp.value.objectType && this.selStyleWid.datasetType !== this.lastSelectedWidget.datasetType)) &&
          this.isDIWDatasetSelected &&
          !this.selStyleWid.isWorkflowdataSet &&
          !this.selStyleWid.isCustomdataSet
        ) {
          if (fillData && fillData.includes('/')) {
            const ids = fillData.split('/');
            this.selectedBrIds = [];
            this.selectedOptions = [];
            this.getRecordCount(ids[0]);
            this.getBusinessRules(ids[1]);
            this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
            this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
          }
        }
      } else {
        console.log(fillData);
      }
    });
    this.subscriptions.push(styleSub);

    const fldSub = this.fields.subscribe((flds) => {
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

        this.rangeSystemFields = this.systemFields.filter((sys) => sys.picklist === '52' || sys.picklist === '53');
        this.rangeHeaderFields = headerArray.filter((head) => head.picklist === '53' || head.picklist === '52');
        const rangeGrid = [];
        const measureFldGrid = [];
        this.fieldData.forEach((item) => {
          const field = { ...item };
          field.childs = item.childs.filter(
            (head) =>
              head.fldCtrl.picklist=== '53' ||
              head.fldCtrl.dataType === 'NUMC' ||
              head.fldCtrl.dataType === 'DEC' ||
              head.fldCtrl.picklist=== '52'
          );
          if (field.childs.length) {
            rangeGrid.push(field);
          }
          field.childs = item.childs.filter((head) => head.fldCtrl.dataType === 'NUMC' || head.fldCtrl.dataType === 'DEC');
          if (field.childs.length) {
            measureFldGrid.push(field);
          }
        });

        this.rangeSystem = of(this.rangeSystemFields);
        this.rangeHeader = of(this.rangeHeaderFields);
        this.rangeFields = [...rangeGrid];
        this.rangeFieldsObs = of(this.rangeFields);
        this.rangeHierarchyFields = [];
        this.rangeHierarchy = of([]);

        if (typeof this.styleCtrlGrp.get('rangeCalculationFld').value === 'string') {
          const conditionFieldValue = this.styleCtrlGrp.get('rangeCalculationFld').value;
          let selectedFieldValue: any = this.rangeSystemFields.find((item) => item.fieldId === conditionFieldValue);
          if (!selectedFieldValue) selectedFieldValue = this.rangeHeaderFields.find((item) => item.fieldId === conditionFieldValue);
          if (!selectedFieldValue) {
            this.rangeFields.some((item) => {
              selectedFieldValue = item.childs.find((val) => val.fieldId === conditionFieldValue);
              if (selectedFieldValue) {
                return true;
              }
            });
          }
          if (selectedFieldValue) this.styleCtrlGrp.get('rangeCalculationFld').setValue(selectedFieldValue);
        }
        this.measureHeaderFields = headerArray.filter((head) => head.dataType === 'NUMC' || head.dataType === 'DEC');
        this.measureHeader = of(this.measureHeaderFields);

        this.measureFields = measureFldGrid;
        this.measureFieldsObs = of(this.measureFields);

        if (typeof this.styleCtrlGrp.get('measureFld').value === 'string') {
          const measureFieldValue = this.styleCtrlGrp.get('measureFld').value;
          let selectedFieldValue: any = this.measureHeaderFields.find((item) => item.fieldId === measureFieldValue);
          if (!selectedFieldValue) {
            this.rangeFields.some((item) => {
              selectedFieldValue = item.childs.find((val) => val.fieldId === measureFieldValue);
              if (selectedFieldValue) {
                return true;
              }
            });
          }
          if (selectedFieldValue) this.styleCtrlGrp.get('measureFld').setValue(selectedFieldValue);
        }
      }
    });
    this.subscriptions.push(fldSub);

    const wfldSub = this.wfFields.subscribe((flds) => {
      if (flds) {
        this.workflowFields = flds;
        this.workflowFieldsObs = of(flds);
        this.rangeSystemFields = this.workflowFields.static.filter((sys) => sys.picklist=== '53' || sys.picklist === '52');
        this.rangeHeaderFields = this.workflowFields.dynamic.filter((sys) => sys.picklist === '53' || sys.picklist === '52');
        this.rangeHeader = of(this.rangeHeaderFields);
        this.rangeSystem = of(this.rangeSystemFields);
        this.rangeHierarchyFields = this.workflowFields.hierarchy.filter((fld) => fld.picklist=== '53' || fld.picklist=== '52');
        this.rangeHierarchy = of(this.rangeHierarchyFields);
        this.rangeFields = [];
        this.rangeFieldsObs = of([]);
      }
    });
    this.subscriptions.push(wfldSub);
    this.fieldCtrl.valueChanges.pipe(debounceTime(500)).subscribe((res) => {
      if (this.styleCtrlGrp.get('isWorkflowdataSet').value === false && this.styleCtrlGrp.get('isCustomdataSet').value === false) {
        this.searchChooseColumn(res);
      }
      if (this.styleCtrlGrp.get('isWorkflowdataSet').value === true && this.styleCtrlGrp.get('isCustomdataSet').value === false) {
        this.searchChooseColumnWorkflow(res);
      }
      if (this.styleCtrlGrp.get('isWorkflowdataSet').value === false && this.styleCtrlGrp.get('isCustomdataSet').value === true) {
        this.searchCustomChooseColumn(res);
      }
    });

    const styleCtrlGrpSlaSub = this.styleCtrlGrp
      .get('rangeCalculationFld')
      .valueChanges.pipe(debounceTime(500))
      .subscribe((res) => {
        if (res) {
          if (typeof res === 'string') {
            this.searchRangeColumn(res);
          } else {
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
    this.subscriptions.push(styleCtrlGrpSlaSub);

    const styleCtrlGrpMeasureSub = this.styleCtrlGrp
      .get('measureFld')
      .valueChanges.pipe(debounceTime(500))
      .subscribe((res) => {
        if (res) {
          if (typeof res === 'string') {
            this.searchMeasureFldColumn(res);
          } else {
            this.searchMeasureFldColumn(res.fieldDescri);
          }
        } else {
          this.searchMeasureFldColumn('');
        }
      });
    this.subscriptions.push(styleCtrlGrpMeasureSub);

    // const filteredSlaSub = this.chartPropCtrlGrp.get('selectSLASteps').valueChanges.pipe(debounceTime(500)).subscribe(res => {
    //   if (res) {
    //     const filteredSlaSteps = this.slaSteps.filter(steps => steps.desc.includes(res));
    //     this.slaStepsObs = of(filteredSlaSteps);
    //   } else {
    //     this.slaStepsObs = of(this.slaSteps);
    //   }
    // })
    // this.subscriptions.push(filteredSlaSub);

    const rangeSub = this.styleCtrlGrp.get('isEnableRange').valueChanges.subscribe((res) => {
      this.rangeOptions();
    });
    this.subscriptions.push(rangeSub);

    const saveQueue = this.saveQueue.pipe(debounceTime(1000)).subscribe((widget) => {
      this.preapreForDraftSave(widget);
    });
    this.subscriptions.push(saveQueue);

    // for diw dataset multiselect dropdown
    this.businessRuleOptions = this.businessRuleFormCtrl.valueChanges.pipe(
      startWith(''),
      map((br: CoreSchemaBrInfo | null) => (br ? this._filter(br) : this.allBusinessRulesOptions.slice()))
    );

    this.chartPropCtrlGrp.get('isEnableBenchMark').valueChanges.subscribe((res) => {
      if(!res){
        this.chartPropCtrlGrp.get('benchMarkValue').setValue(null);
        if (this.selStyleWid.chartProperties) {
          this.selStyleWid.chartProperties.benchMarkValue = null;
        }
      }
    });
    this.setWidgetProp(this.selStyleWid);
    this.initValueChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.widgetInfo &&
      !changes.widgetInfo.isFirstChange() &&
      !isEqual(changes.widgetInfo.currentValue, changes.widgetInfo.previousValue)
    ) {
      if (this.isDiscard || Number(changes.widgetInfo.currentValue.widgetId) !== Number(changes.widgetInfo.previousValue.widgetId)) {
        this.unsubscribeProp();
        this.selStyleWid = JSON.parse(JSON.stringify(this.widgetInfo));
        this.setWidgetProp(this.selStyleWid);
        this.initValueChanges();
        this.getRecordCount(this.selStyleWid.objectType,this.selStyleWid.isWorkflowdataSet);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this.unsubscribeProp();
  }

  initValueChanges() {
    this.styleSub = this.styleCtrlGrp.valueChanges.pipe(distinctUntilChanged(isEqual)).subscribe((latestVal) => {
      this.widgetService.isPropertyPanelDataChanged.next(true);
      if (this.selStyleWid) {
        this.selStyleWid.widgetTitle = latestVal.widgetName;
        this.selStyleWid.field = !latestVal.field
          ? latestVal.datasetType === 'diw_dataset'
            ? '__DIW_STATUS'
            : null
          : typeof latestVal.field === 'string'
          ? latestVal.field
          : latestVal.field.fieldId;
        this.selStyleWid.aggregrationOp = latestVal.aggregrationOp?.key ? latestVal.aggregrationOp.key : null;
        this.selStyleWid.filterType = latestVal.filterType?.key ? latestVal.filterType.key : null;
        this.selStyleWid.isMultiSelect = latestVal.isMultiSelect || null;
        this.selStyleWid.orderWith = latestVal.orderWith?.key ? latestVal.orderWith.key : null;
        this.selStyleWid.groupById = !latestVal.groupById
          ? null
          : typeof latestVal.groupById === 'string'
          ? latestVal.groupById
          : latestVal.groupById.fieldId;
        this.selStyleWid.objectType = latestVal.objectType ? latestVal.objectType : null;
        this.selStyleWid.imageUrl = latestVal.imageUrl ? latestVal.imageUrl : null;
        this.selStyleWid.htmlText = latestVal.htmlText ? latestVal.htmlText : null;
        this.selStyleWid.imagesno = latestVal.imagesno ? latestVal.imagesno : null;
        this.selStyleWid.imageName = latestVal.imageName ? latestVal.imageName : null;
        this.selStyleWid.isWorkflowdataSet = latestVal.isWorkflowdataSet;
        this.selStyleWid.distictWith =
          typeof latestVal.distictWith === 'string' ? latestVal.distictWith || null : latestVal.distictWith.fieldId;
        this.selStyleWid.isCustomdataSet = latestVal.isCustomdataSet;
        this.selStyleWid.pageDefaultSize = latestVal.pageDefaultSize || null;
        this.selStyleWid.displayCriteria = latestVal.displayCriteria?.key
          ? latestVal.displayCriteria.key
          : this.selStyleWid.widgetType === WidgetType.TABLE_LIST
          ? this.displayCriteria[1].key
          : null;
        this.selStyleWid.isFieldDistinct = latestVal.isFieldDistinct || null;
        this.selStyleWid.isEnableGlobalFilter = latestVal.isEnableGlobalFilter;
        this.selStyleWid.applyDistinct = latestVal.applyDistinct;
        this.selStyleWid.rangeBucketSize = latestVal.rangeBucketSize ? latestVal.rangeBucketSize : null;
        this.selStyleWid.rangeBucketLimit = latestVal.rangeBucketLimit ? latestVal.rangeBucketLimit : null;
        this.selStyleWid.rangeCalculationFld =
          latestVal.rangeCalculationFld && latestVal.rangeCalculationFld.fieldId ? latestVal.rangeCalculationFld.fieldId : null;
        this.selStyleWid.rangeDateFormatInterval = latestVal.rangeDateFormatInterval?.key ? latestVal.rangeDateFormatInterval.key : null;
        this.selStyleWid.isEnableRange = latestVal.isEnableRange ? true : false;
        this.selStyleWid.measureFld = latestVal.measureFld ? latestVal.measureFld.fieldId : null;
        this.selStyleWid.brs = latestVal.brs ? latestVal.brs : '';
        this.selStyleWid.datasetType = latestVal.datasetType ? latestVal.datasetType : '';

        // hold selected field control
        if (typeof latestVal.field !== 'string') {
          this.selStyleWid.fieldCtrl = latestVal.field;
        }

        if (typeof latestVal.groupById !== 'string') {
          this.selStyleWid.groupByIdCtrl = latestVal.groupById;
        }

        // while changing date default filter ...
        // let strtDate = latestVal.date.start;
        // if (strtDate) {
        //   try {
        //     strtDate = moment(strtDate, 'MM/DD/YYYY', true).toDate().getTime();
        //   } catch (error) {
        //     console.error(`Error :`, error);
        //   }
        // }

        // let endDate = latestVal.startDate.end;
        // if (endDate) {
        //   try {
        //     endDate = moment(endDate, 'MM/DD/YYYY', true).toDate().getTime();
        //   } catch (error) {
        //     console.error(`Error :`, error);
        //   }
        // }

        if (latestVal.dateSelectionType && latestVal.date && latestVal.date.start) {
          this.selStyleWid.dateFilterCtrl = {
            dateSelectedFor: latestVal.dateSelectionType.key,
            endDate: moment(latestVal.date.end).valueOf().toString(),
            startDate: moment(latestVal.date.start).valueOf().toString(),
          };
        } else if (latestVal.dateSelectionType) {
          this.selStyleWid.dateFilterCtrl = {
            dateSelectedFor: latestVal.dateSelectionType.key,
            endDate: null,
            startDate: null
          };
        } else {
          this.styleCtrlGrp.get('date').setValue(null);
          this.selStyleWid.dateFilterCtrl = null;
        }
        this.saveQueue.next(this.selStyleWid);
      }
      if (
        latestVal.workflowPath &&
        latestVal.field === 'TIME_TAKEN' &&
        this.selStyleWid.widgetType === 'TIMESERIES' &&
        this.selStyleWid.isStepwiseSLA &&
        latestVal.workflowPath.length === 1 &&
        this.slaSteps.length === 0
      ) {
        this.inValidSLA = false;
        this.getWorkflowSteps(this.selStyleWid.workflowPath[0]);
      }
    });

    // detect value change on chart properties when value is changed
    this.chartPropSub = this.chartPropCtrlGrp.valueChanges.pipe(distinctUntilChanged(isEqual)).subscribe((latestProp) => {
      this.widgetService.isPropertyPanelDataChanged.next(true);
      this.inValidSLA = false;
      if (latestProp) {
        if (this.selStyleWid.widgetType === WidgetType.TIMESERIES) {
          this.selStyleWid.chartProperties.seriesWith =
          latestProp.seriesWith?.key ? latestProp.seriesWith.key : this.seriesWith[0].key;
          if (latestProp.hasCustomSLA) {
            this.selStyleWid.chartProperties.slaValue = latestProp.slaValue ? latestProp.slaValue : '';
            this.selStyleWid.chartProperties.cSlaUnit = latestProp.slaType && typeof latestProp.slaType === 'object' ? latestProp.slaType.key : this.slaMenu[0].key;
          }
          this.selStyleWid.chartProperties.timeseriesStartDate = latestProp.timeseriesStartDate?.key
            ? latestProp.timeseriesStartDate.key
            : this.timeInterval[1].key;

          if ((latestProp.isStepWiseSla && latestProp.isStepWiseSla.key) || this.selStyleWid.isStepwiseSLA) {
            if (latestProp.isStepWiseSla || this.selStyleWid.isStepwiseSLA) {
              if ((this.selStyleWid.workflowPath && this.selStyleWid.workflowPath.length !== 1) || !this.selStyleWid.workflowPath) {
                this.workflowPathDiv.nativeElement.scrollIntoView();
                this.inValidSLA = true;
                this.slaSteps = [];
                this.slaStepsObs = of([]);
              } else {
                this.inValidSLA = false;
                if (this.selStyleWid.workflowPath.length === 1 && !this.slaSteps.length) {
                  this.getWorkflowSteps(this.selStyleWid.workflowPath[0]);
                }
              }
            }
          }
        }
        if (this.selStyleWid.chartProperties) {
          if (this.selStyleWid.widgetType === WidgetType.TIMESERIES && this.selStyleWid.field === 'TIME_TAKEN') {
            this.selStyleWid.chartProperties.timeTakenReportType = latestProp.timeTakenReportType.key;
            this.selStyleWid.chartProperties.bucketFilter = latestProp.bucketFilter?.key
              ? latestProp.bucketFilter?.key
              : BucketFilter.WITHIN_1_DAY;
          } else {
            this.selStyleWid.chartProperties.bucketFilter = null;
            this.selStyleWid.chartProperties.timeTakenReportType = null;
          }
        }
        this.selStyleWid.chartProperties.chartType = latestProp.chartType?.key ? latestProp.chartType.key : this.chartType[0].key;
        this.selStyleWid.chartProperties.datalabelsPosition = latestProp.datalabelsPosition?.key
          ? latestProp.datalabelsPosition.key
          : this.datalabelsPosition[0].key;
        this.selStyleWid.chartProperties.legendPosition = latestProp.legendPosition?.key
          ? latestProp.legendPosition.key
          : this.legendPosition[0].key;
        this.selStyleWid.chartProperties.orderWith = latestProp.orderWith?.key ? latestProp.orderWith.key : null;
        this.selStyleWid.chartProperties.orientation = latestProp.orientation?.key ? latestProp.orientation.key : this.orientation[0].key;
        this.selStyleWid.chartProperties.xAxisLabel = latestProp.xAxisLabel ? latestProp.xAxisLabel : '';
        this.selStyleWid.chartProperties.yAxisLabel = latestProp.yAxisLabel ? latestProp.yAxisLabel : '';
        this.selStyleWid.chartProperties.isEnableDatalabels = latestProp.isEnableDatalabels;
        this.selStyleWid.chartProperties.isEnableLegend = latestProp.isEnableLegend;
        this.selStyleWid.chartProperties.scaleFrom = latestProp.scaleFrom;
        this.selStyleWid.chartProperties.scaleTo = latestProp.scaleTo;
        this.selStyleWid.chartProperties.stepSize = latestProp.stepSize;
        this.selStyleWid.chartProperties.dataSetSize = latestProp.dataSetSize;
        this.selStyleWid.chartProperties.seriesFormat = latestProp.seriesFormat;
        this.selStyleWid.chartProperties.blankValueAlias = latestProp.blankValueAlias;
        this.selStyleWid.chartProperties.isEnabledBarPerc = latestProp.isEnabledBarPerc;
        this.selStyleWid.chartProperties.showTotal = latestProp.showTotal;
        this.selStyleWid.isStepwiseSLA = latestProp.isStepWiseSla?.key ? latestProp.isStepWiseSla.key : false;
        // this.selStyleWid.workflowPathSteps = latestProp.selectSLASteps && Array.isArray(latestProp.selectSLASteps) ? latestProp.selectSLASteps.map(item => item && item.stepId ? item.stepId : item) : [];
        this.selStyleWid.chartProperties.hasCustomSLA = latestProp.hasCustomSLA;
        this.selStyleWid.chartProperties.isEnableBenchMark = latestProp.isEnableBenchMark ? latestProp.isEnableBenchMark : false;
        this.selStyleWid.chartProperties.benchMarkValue = latestProp.benchMarkValue ? latestProp.benchMarkValue : null;
        if (!this.selStyleWid.isStepwiseSLA) {
          this.selStyleWid.workflowPathSteps = [];
        }
        this.saveQueue.next(this.selStyleWid);
      }
    });
    // detect value change on default filters
    this.defaultFilterSub = this.defaultFilterCtrlGrp.valueChanges.subscribe((latestProp) => {
      this.widgetService.isPropertyPanelDataChanged.next(true);
      if (latestProp && latestProp.hasOwnProperty('filters')) {
        latestProp.filters.forEach((d) => {
          delete d.showRangeFld;
        });
        this.selStyleWid.defaultFilters = latestProp.filters;
        this.saveQueue.next(this.selStyleWid);
      }
    });
  }

  unsubscribeProp() {
    if (this.styleSub) {
      this.styleSub.unsubscribe();
      this.chartPropSub.unsubscribe();
      this.defaultFilterSub.unsubscribe();
    }
  }

  closePanel() {
    this.close.emit(true);
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
    specialOpe.childs.push({
      code: 'FIELD2FIELD_GREATETHENEQUAL',
      value: $localize`:@@Field_to_field_greater_than_equal:Field To Field Greater Than Equal`,
    });
    specialOpe.childs.push({
      code: 'FIELD2FIELD_GREATETHAN',
      value: $localize`:@@field_to_field_greater_than:Field To Field Greater Than`,
    });
    specialOpe.childs.push({ code: 'FIELD2FIELD_LESSTHEN', value: $localize`:@@field_to_field_less_than:Field To Field Less Than` });
    specialOpe.childs.push({
      code: 'FIELD2FIELD_LESSTHENEQUALTO',
      value: $localize`:@@field_to_field_less_than_equal:Field To Field Less Than Equal`,
    });
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
    this.workFlowDatasetCount = selected ? selected.length : 0;
    this.lastSelectedWidget = this.selStyleWid ? cloneDeep(this.selStyleWid) : ({} as Widget);
    if (selected.length) {
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(true);
      this.dataSetOb = of(this.dataSets);
      this.customDataSetob = of(this.customDataSets);
      this.DIWDatasetOb = of(this.diwDataSets);
    } else {
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
    }
    this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
    this.styleCtrlGrp.get('datasetType').setValue('workflow_dataset');
    const objId = selected.map((ob) => ob.objectid);
    this.getWorkFlowFields(objId);
    this.getRecordCount(objId.toString(), true);
    this.getWorkFlowPathDetails(objId);
    this.selStyleWid.objectType = objId.toString();
    this.styleCtrlGrp.get('objectType').setValue(objId.toString());
    this.datasetCtrl.setValue('');
    this.isDIWDatasetSelected = false;
    this.chooseColumns = [];
  }

  /**
   * Get description...
   * @param data get current module
   */
  displayWithDataSet(data: any): string {
    if(data && data.moduleId){
      return data ? data.moduleDesc : '';
    }
    if (data && data.schemaId) {
      return data ? data.datasetDesc + '/' + data.desc : '';
    }
    return data ? data.objectdesc : '';
  }

  afterDataSetSelect(obj: Dataset) {
    if (obj.moduleId) {
      this.lastSelectedWidget = this.selStyleWid ? cloneDeep(this.selStyleWid) : ({} as Widget);
      this.dataSetOb = of(this.dataSets);
      this.DIWDatasetOb = of(this.diwDataSets);
      // this.customDataSetob = of(this.customDataSets);
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
      this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
      this.styleCtrlGrp.get('datasetType').setValue('module_dataset');
      this.styleCtrlGrp.get('objectType').setValue(obj.moduleId);
      this.styleCtrlGrp.get('field').setValue(null);
      this.searchDataSetVal = '';
      this.isDIWDatasetSelected = false;
      this.chooseColumns = [];
      if(obj?.moduleId && this.selStyleWid.widgetType !== WidgetType.DATASET_LIST) this.getAllFields(obj.moduleId);
      this.getRecordCount(obj.moduleId);
    }
  }

  get isWorkflowRefresh(): boolean {
    return this.selStyleWid ? this.selStyleWid.isWorkflowdataSet : false;
  }

  /**
   * Update field on formGroup while selection change
   * @param fieldData option of selection change
   */
  onDistictWithChange(fieldData: MatAutocompleteSelectedEvent) {
    if (fieldData && fieldData.option.value) {
      this.styleCtrlGrp
        .get('distictWith')
        .setValue(fieldData.option.value.fldCtrl ? fieldData.option.value.fldCtrl : fieldData.option.value);
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
   * return the possible bucket filter values for drop down values
   */
  get possibleBucketFilter() {
    const bucketFilter = [
      { key: BucketFilter.WITHIN_1_DAY, value: $localize`:@@withinSLA:Within time limit` },
      { key: BucketFilter.MORE_THEN_1_DAY, value: $localize`:@@exceedsSLA:Exceeds time limit` },
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
    ];
    return timeInterval;
  }

  /**
   * return the possible filter type values for drop down value
   */
  get possibleFilterType() {
    const filterType = [
      { key: FilterWith.DROPDOWN_VALS, value: $localize`:@@dropdownValue: Dropdown value` },
      { key: FilterWith.HORIZONTAL_VALS, value: $localize`:@@horizontalValue:Horizontal value` },
      { key: FilterWith.VERTICAL_VALS, value: $localize`:@@verticalValue:Vertical value` },
    ];
    return filterType;
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
      { key: OrderWith.COL_DESC, value: $localize`:@@columnDescending:Column Descending` },
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
      { key: SeriesWith.year, value: $localize`:@@year:Year` },
    ];
    return seriesWith;
  }

  /**
   *  return the possible aggregration operator values for drop down
   */
  get possibleAggregrationOperator() {
    const aggregrationOp = [
      { key: AggregationOperator.GROUPBY, value: $localize`:@@groupBy:Group by` },
      { key: AggregationOperator.COUNT, value: $localize`:@@count:Count` },
      { key: AggregationOperator.SUM, value: $localize`:@@sum:Sum` },
      { key: AggregationOperator.MIN, value: $localize`:@@min:Minimum` },
      { key: AggregationOperator.MAX, value: $localize`:@@max:Maximum` },
      { key: AggregationOperator.MEDIAN, value: $localize`:@@median:Median` },
      { key: AggregationOperator.MODE, value: $localize`:@@mode:Mode` },
      { key: AggregationOperator.AVG, value: $localize`:@@avg:Average/Mean` },
    ];
    return aggregrationOp;
  }

  /**
   *  return the possible aggregration operator values for drop down
   */
  get possibleDisplayCriteria() {
    const displayCriteria = [
      { key: DisplayCriteria.CODE, value: $localize`:@@code:Code` },
      { key: DisplayCriteria.TEXT, value: $localize`:@@text:Text` },
      { key: DisplayCriteria.CODE_TEXT, value: $localize`:@@codeAndText:Code & Text` },
    ];
    return displayCriteria;
  }

  /**
   *  return the possible chart type values for drop down
   */
  get possibleChartType() {
    const chartType = [
      { key: ChartType.BAR, value: $localize`:@@bar:Bar` },
      { key: ChartType.PIE, value: $localize`:@@pie:Pie` },
      { key: ChartType.LINE, value: $localize`:@@line:Line` },
    ];
    return chartType;
  }

  /**
   *  return the possible orientation values for drop down
   */
  get possibleOrientation() {
    const orientation = [
      { key: Orientation.VERTICAL, value: $localize`:@@vertical:Vertical` },
      { key: Orientation.HORIZONTAL, value: $localize`:@@horizontal:Horizontal` },
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
      { key: DatalabelsPosition.end, value: $localize`:@@end:End` },
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
      { key: LegendPosition.right, value: $localize`:@@right:Right` },
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
    ];
    return dateSelectionType;
  }

  /**
   *  return the possible sla menu values for drop down
   */
  get possibleSLAMenu() {
    const possibleSlaMenu = [
      { key: SeriesWith.hour, value: $localize`:@@hour:Hour` },
      { key: SeriesWith.day, value: $localize`:@@day:Day` },
    ];
    return possibleSlaMenu;
  }

  /**
   *  return the possible stepwise sla menu values for drop down
   */
  get possibleIsStepWiseSLA() {
    const possibleStepWiseSla = [
      { key: true, value: $localize`:@@yes:Yes` },
      { key: false, value: $localize`:@@no:No` },
    ];
    return possibleStepWiseSla;
  }

  /**
   *  return the possible time taken sla menu values for drop down
   */
  get possibleTimeTaken() {
    const possibleStepWiseSla = [
      { key: TimeTaken.TIMETAKEN_REPORT, value: $localize`:@@timeSpentReport:Time spent report` },
      { key: TimeTaken.SLA_Report, value: $localize`:@@slaReport:SLA report` },
    ];
    return possibleStepWiseSla;
  }

  getAggregationOpValidation(control : AbstractControl){
    if(!control.value){
      return $localize`:@@aggregation_mandatory:Aggregation operator is mandatory`;
    }
  }

  getReportNameValidation(control: AbstractControl) {
    if (this.reportNameTouched && control.errors && control.hasError('required')) {
      return $localize`:@@report_name_mandatory:Dashboard name is mandatory and cannot be empty.`;
    } else if (this.reportNameTouched && !control.hasError('required') && control.invalid) {
      return $localize`:@@dashboard_not_have_special_char:Dashboard name Cannot contain special characters`;
    }
  }

  getWidgetNameValidation(control: AbstractControl) {
    if (this.widgetNameTouched && control.errors && control.hasError('required')) {
      return $localize`:@@widgetname_mandatory:Report name is mandatory and cannot be empty.`;
    } else if (
      this.widgetNameTouched &&
      !control.hasError('required') &&
      control.invalid &&
      this.selStyleWid.widgetType !== 'IMAGE' &&
      this.selStyleWid.widgetType !== 'HTML'
    ) {
      return $localize`:@@widget_not_contain_special_char:Report name Cannot contain special characters`;
    }
  }

  /**
   *
   * @param response holds the field meta data
   * @returns formated data for map hierarchy
   */
  public mapHierarchyFields(response: MetadataModeleResponse): Metadata[] {
    const metadata: Metadata[] = [];
    if (response && response.hierarchy) {
      response.hierarchy.forEach((hierarchy) => {
        const hierarchyChilds: Metadata[] = [];
        if (response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach((fld) => {
            const hierarchyDesc = response.hierarchy.find((x) => {
              return x.heirarchyId === hierarchy.heirarchyId;
            });
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
            hierarchyChilds.push({
              fieldId: fldCtrl.fieldId,
              fieldDescri: fldCtrl.fieldDescri,
              isGroup: false,
              fldCtrl,
              childs: [],
              fieldType: this.getHierarchyParentField(hierarchyDesc),
            });
          });
        }

        metadata.push({
          fieldId: hierarchy.heirarchyId,
          fieldDescri: hierarchy.heirarchyText,
          isGroup: true,
          childs: hierarchyChilds,
        });
      });
      return metadata;
    }
  }

  preapreForDraftSave(widget: Widget) {
    // update variable for dom control
    if (widget.chartProperties) {
      delete widget.chartProperties.slaType;
    }
    const hasChanged = !isEqual(widget, this.widgetInfo);
    if (hasChanged) {
      this.widgetInfo = JSON.parse(JSON.stringify(widget));
      console.log('preapreForDraftSave:', hasChanged);
      const request: ReportDashboardReq = new ReportDashboardReq();
      request.reportId = this.report.reportId;
      request.reportName = this.report.reportName;
      request.reportDesciption = this.report.reportDesciption;
      request.widgetReqList = [widget];
      this.saveDraft.emit(request);
    } else{
      this.widgetService.isPropertyPanelDataChanged.next(false);
    }
  }

  getAllFields(objNum: string) {
    const allfldSub = this.coreService.getMetadataFieldsByModuleId([objNum],'').subscribe(
      (response) => {
        this.fields.next(response);
      },
      (error) => {
        console.error(`Error : ${error}`);
      }
    );
    this.subscriptions.push(allfldSub);
  }

  /**
   * Search choose columns ...
   * @param val searchable text for choose columns ..
   */
  searchChooseColumn(val: string) {
    const listData = JSON.parse(JSON.stringify(this.fieldData));
    this.fieldsObs = of([]);
    if (val && val.trim() !== '') {
      const headers = this.headerFls.filter((fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1);
      this.headerFields = of(headers)
      this.fieldsObs = val ? this.filtered(listData, val) : listData;
      let fieldHeader = []
      this.fieldsObs.subscribe(res => { fieldHeader = res; });

      if(headers.length || fieldHeader.length) {
        this.systemFieldsObs = of([]);
      } else {
        this.systemFieldsObs = of(this.systemFields);
      }
    } else {
      this.headerFields = of(this.headerFls);
      this.fieldsObs = of(this.fieldData);
      this.systemFieldsObs = of(this.systemFields);
    }
  }

  getWorkFlowFields(objectType: string[]) {
    const workflowFields = this.coreService.getWorkFlowFields(objectType).subscribe(
      (response) => {
        this.wfFields.next(response);
      },
      (error) => {
        console.error(`Error : ${error}`);
      }
    );
    this.subscriptions.push(workflowFields);
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
      this.CustomfieldsObs = of(
        this.Customfields.filter((fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1)
      );
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
      const sysFld = this.workflowFields.static.filter(
        (fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1
      );
      const dynFld = this.workflowFields.dynamic.filter(
        (fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1
      );
      const hieFld = this.workflowFields.hierarchy.filter(
        (fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1
      );
      this.workflowFieldsObs = of({ dynamic: dynFld, static: sysFld, hierarchy: hieFld });
    } else {
      this.workflowFieldsObs = of(this.workflowFields);
    }
  }

  /**
   * Search choose columns ...
   * @param val searchable text for choose columns ..
   */
  searchRangeColumn(val: string) {
    const listData = JSON.parse(JSON.stringify(this.rangeFields));
    this.rangeFieldsObs = of([]);
    if (val && val.trim() !== '') {
      this.rangeHeader = of(
        this.rangeHeaderFields.filter((fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1)
      );
      this.rangeFieldsObs = val ? this.filtered(listData, val) : listData;
    } else {
      this.rangeHeader = of(this.rangeHeaderFields);
      this.rangeFieldsObs = of(this.rangeFields);
    }
  }

  /**
   * Search choose columns ...
   * @param val searchable text for choose columns ..
   */
  searchMeasureFldColumn(val: string) {
    const listData = JSON.parse(JSON.stringify(this.measureFields));
    this.rangeFieldsObs = of([]);
    if (val && val.trim() !== '') {
      this.measureHeader = of(
        this.measureHeaderFields.filter((fil) => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1)
      );
      this.measureFieldsObs = val ? this.filtered(listData, val) : listData;
    } else {
      this.measureHeader = of(this.measureHeaderFields);
      this.measureFieldsObs = of(this.measureFields);
    }
  }

  searchWorkflowPath(val) {
    const filteredWorkFlowPath = this.workflowPath.filter(
      (wf) => wf.workflowdesc.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1
    );
    this.workflowPathOb = of(filteredWorkFlowPath);
  }

  rangeOptions() {
    const rangeSelectionFieldType = this.styleCtrlGrp.get('rangeCalculationFld').value;
    let dropDownValue = [];
    if (this.selStyleWid.widgetType === WidgetType.TIMESERIES && this.selStyleWid.field === 'TIME_TAKEN') {
      dropDownValue = this.possibleAggregrationOperator.filter(
        (item) => item.key === AggregationOperator.COUNT || item.key === AggregationOperator.SUM || item.key === AggregationOperator.AVG
      );
    } else if (this.selStyleWid.widgetType !== WidgetType.COUNT && !this.styleCtrlGrp.get('isEnableRange').value) {
      dropDownValue = this.possibleAggregrationOperator;
    } else if (this.selStyleWid.widgetType === WidgetType.COUNT && this.checkFieldDataType) {
      dropDownValue = this.possibleAggregrationOperator.filter((op) => op.key !== AggregationOperator.GROUPBY);
    } else if (this.selStyleWid.widgetType === WidgetType.COUNT && !this.checkFieldDataType) {
      dropDownValue = this.possibleAggregrationOperator.filter(
        (op) => op.key !== AggregationOperator.GROUPBY && op.key !== AggregationOperator.SUM
      );
    } else if (this.styleCtrlGrp.get('isEnableRange').value && this.selStyleWid.widgetType !== WidgetType.COUNT) {
      if (
        rangeSelectionFieldType.dataType &&
        (rangeSelectionFieldType.picklist=== '53' || rangeSelectionFieldType.picklist=== '52')
      ) {
        dropDownValue = this.possibleAggregrationOperator.filter((op) => op.key === AggregationOperator.COUNT);
      } else if (this.checkFieldDataType && rangeSelectionFieldType === '') {
        dropDownValue = this.possibleAggregrationOperator.filter((op) => op.key === AggregationOperator.COUNT);
      } else if (this.checkFieldDataType && rangeSelectionFieldType) {
        dropDownValue = this.possibleAggregrationOperator.filter(
          (op) => op.key === AggregationOperator.SUM || op.key === AggregationOperator.COUNT
        );
      } else if (!this.checkFieldDataType && rangeSelectionFieldType) {
        dropDownValue = dropDownValue = this.possibleAggregrationOperator.filter((op) => op.key === AggregationOperator.COUNT);
      } else {
        dropDownValue = [...this.possibleAggregrationOperator];
      }
    }
    this.aggregrationOp = [...dropDownValue];
    if (this.styleCtrlGrp.get('aggregrationOp') && this.styleCtrlGrp.get('aggregrationOp').value) {
      const isAggregrationOpExist = this.aggregrationOp.find((item) => item.key === this.styleCtrlGrp.get('aggregrationOp').value.key);
      if (!isAggregrationOpExist) {
        this.styleCtrlGrp.get('aggregrationOp').reset();
      }
    }
  }

  /**
   * After select cuatom data ..
   * @param selected selected custom data is here
   */
  afterCustomSelect(obj: ObjectTypeResponse) {
    if (obj.objectid) {
      this.lastSelectedWidget = this.selStyleWid ? cloneDeep(this.selStyleWid) : ({} as Widget);
      this.dataSetOb = of(this.dataSets);
      this.customDataSetob = of(this.customDataSets);
      this.DIWDatasetOb = of(this.diwDataSets);
      this.isDIWDatasetSelected = false;
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
      this.styleCtrlGrp.get('isCustomdataSet').setValue(true);
      this.styleCtrlGrp.get('objectType').setValue(obj.objectid);
      this.styleCtrlGrp.get('datasetType').setValue('custom_dataset');
      this.searchDataSetVal = '';
      this.chooseColumns = [];
      this.getRecordCount(obj.objectid, false, true);
    }
  }

  /**
   * After select DIW data ..
   * @param selected selected DIW data is here
   */
  afterDIWDatasetSelect(obj: ObjectTypeResponse) {
    this.lastSelectedWidget = this.selStyleWid ? cloneDeep(this.selStyleWid) : ({} as Widget);
    if (obj.schemaId) {
      this.isDIWDatasetSelected = true;
      this.dataSetOb = of(this.dataSets);
      this.DIWDatasetOb = of(this.diwDataSets);
      this.customDataSetob = of(this.customDataSets);
      this.styleCtrlGrp.get('objectType').setValue(obj.datasetId + '/' + obj.schemaId);
      this.styleCtrlGrp.get('isWorkflowdataSet').setValue(false);
      this.styleCtrlGrp.get('isCustomdataSet').setValue(false);
      this.styleCtrlGrp.get('datasetType').setValue('diw_dataset');
      this.searchDataSetVal = '';
      this.chooseColumns = [];
      this.getBusinessRules(obj.schemaId);
      if (this.widgetInfo.widgetType === 'COUNT') {
        this.styleCtrlGrp.get('aggregrationOp').setValue(this.aggregrationOp.find((op) => op.key === AggregationOperator.COUNT));
        this.styleCtrlGrp.get('aggregrationOp').disable();
      }
      // this.getRecordCount(obj.objectid, false, false, true);
    }
  }

  getCustomFields(objNum: string) {
    const CustomfldSub = this.reportService.getCustomDatasetFields(objNum).subscribe(
      (response) => {
        this.Customfields = response;
        this.CustomfieldsObs = of(response);
        this.rangeHeaderFields = this.Customfields.filter((fld) => fld.picklist=== '52' || fld.picklist=== '53');
        this.rangeHeader = of(this.rangeHeaderFields);
        this.rangeFields = [];
        this.rangeFieldsObs = of([]);
        this.rangeHierarchyFields = [];
        this.rangeHierarchy = of([]);
        this.rangeSystemFields = [];
        this.rangeSystem = of([]);
        console.log(this.Customfields);
      },
      (error) => {
        console.error(`Error : ${error}`);
      }
    );
    this.subscriptions.push(CustomfldSub);
  }

  get isCustomRefresh(): boolean {
    return this.selStyleWid ? this.selStyleWid.isCustomdataSet : false;
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
    };
    return parentField;
  }

  /**
   *
   * @param response complete response of metadata field
   * @returns transformed meta data for grid fields
   */
  mapGridFields(response) {
    const metaData: Metadata[] = [];
    Object.keys(response.grids).forEach((grid) => {
      const gridChilds: Metadata[] = [];
      if (response.gridFields && response.gridFields.hasOwnProperty(grid)) {
        Object.keys(response.gridFields[grid]).forEach((fld) => {
          const gridDesc = this.getGridParentField(response.grids[grid]);
          const fldCtrl = response.gridFields[grid][fld];
          gridChilds.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            fldCtrl,
            childs: [],
            fieldType: gridDesc,
          });
        });
      }
      metaData.push({
        fieldId: grid,
        fieldDescri: response.grids[grid].fieldDescri,
        isGroup: true,
        childs: gridChilds,
      });
    });
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
    };
    return parentField;
  }

  toggleSelection(field: MetadataModel) {
    this.widgetService.isPropertyPanelDataChanged.next(true);
    const selectedField = this.chooseColumns.filter((fill) => fill.fields === field.fieldId);
    if (selectedField && selectedField.length) {
      this.chooseColumns.splice(this.chooseColumns.indexOf(selectedField[0]), 1);
    } else {
      this.chooseColumns.push({
        fieldDesc: field.fieldDescri,
        fieldOrder: this.chooseColumns.length,
        fields: field.fieldId,
        widgetId: this.selStyleWid.widgetId,
      });
    }
    this.selStyleWid.widgetTableFields = this.chooseColumns;
    this.saveQueue.next(this.selStyleWid);
  }

  isSelected(field: MetadataModel): boolean {
    const selectedField = this.chooseColumns.filter((fill) => fill.fields === field.fieldId);
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
        const uploadUpdateFile = this.dmsService
          .uploadFileWithSNo(event.target.files[0] as File, this.styleCtrlGrp.get('imagesno').value)
          .subscribe(
            (res) => {
              this.styleCtrlGrp.get('imageName').setValue(event.target.files[0] ? event.target.files[0].name : '');
              this.styleCtrlGrp.get('imagesno').setValue(res);
            },
            (error) => console.error(`Error : ${error}`)
          );
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
    // this.selStyleWid.defaultFilters = [];
    const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
    frmArray.push(
      this.formBuilder.group({
        conditionFieldId: [''],
        conditionFieldValue: [''],
        blockType: [BlockType.COND],
        conditionOperator: ['EQUAL', Validators.required],
        conditionFieldEndValue: [''],
        udrid: [this.selStyleWid.widgetId ? this.selStyleWid.widgetId : ''],
        showRangeFld: false,
      })
    );
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
      this.fieldDataType = fieldData.option.value.fldCtrl?.dataType;
    }

    if (this.selStyleWid.widgetType !== 'TIMESERIES' && this.selStyleWid.field !== 'TIME_TAKEN') {
      this.chartPropCtrlGrp.get('isEnabledBarPerc').setValue(false);
      if (this.selStyleWid.chartProperties) {
        this.selStyleWid.chartProperties.bucketFilter = null;
      }
    }
    this.rangeOptions();
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
      this.styleCtrlGrp.get('groupById').setValue(fieldData.option.value);
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
    const userSub = this.userService
      .getUserDetails()
      .pipe(distinctUntilChanged())
      .subscribe((user) => {
        const docCountSub = this.reportService.getDocCount(objectType, user.plantCode, isWorkflowDataset, isCustomdataSet).subscribe(
          (res) => {
            this.recordsCount = res;
          },
          (error) => {
            this.recordsCount = null;
            console.error(`Error: ${error}`);
          }
        );
        this.subscriptions.push(docCountSub);
      });
    this.subscriptions.push(userSub);
  }

  /**
   * Should call api and get the actual workflow path
   * @param objectType selected object type
   */
  getWorkFlowPathDetails(objectType: string[]) {
    const workflowPath = this.processService.getWorkFlowPath(objectType).subscribe(
      (res) => {
        this.workflowPath = res;
        this.workflowPathOb = of(res);
        this.selectedWorkflowPath = [];
        if (this.selStyleWid.workflowPath) {
          this.selStyleWid.workflowPath.forEach((value) => {
            const filteredValue = this.workflowPath.find((item: any) => item.pathname === value);
            if (filteredValue) this.selectedWorkflowPath.push(filteredValue);
          });
        }
      },
      (error) => console.error(`Error: ${error}`)
    );
    this.subscriptions.push(workflowPath);
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
    } else {
      this.isSerieswithDisabled = false;
      return true;
    }
  }

  displayProperties(opt) {
    return opt ? opt.value : null;
  }

  getValue(value, control) {
    const searchText = control && control.value ? (typeof control.value === 'string' ? control.value : control.value.value) : '';
    return searchText ? value.filter((item) => item.value.toLowerCase().includes(searchText.toLowerCase())) : value;
  }

  getSeriesValue(value, control) {
    const searchText = control.value;
    return searchText ? value.filter((item) => item.toLowerCase().includes(searchText.toLowerCase())) : value;
  }

  displayWithWorkflowDesc() {
    const workflowPath = this.selectedWorkflowPath.map((item: any) => item.workflowdesc);
    return workflowPath.join(',');
  }

  selectedWorkFlow(value) {
    this.widgetService.isPropertyPanelDataChanged.next(true);
    const index = this.selectedWorkflowPath.findIndex((item: any) => item.pathname === value.pathname);
    if (index > -1) {
      this.selectedWorkflowPath.splice(index, 1);
      this.selStyleWid.workflowPath.splice(index, 1);
    } else {
      this.selectedWorkflowPath.push(value);
      if (!this.selStyleWid.workflowPath) {
        this.selStyleWid.workflowPath = [];
      }
      this.selStyleWid.workflowPath.push(value.pathname);
    }
    if (
      this.selStyleWid.workflowPath &&
      this.selStyleWid.field === 'TIME_TAKEN' &&
      this.selStyleWid.widgetType === 'TIMESERIES' &&
      this.selStyleWid.isStepwiseSLA &&
      this.selStyleWid.workflowPath.length === 1
    ) {
      this.inValidSLA = false;
      this.getWorkflowSteps(this.selStyleWid.workflowPath[0]);
    } else {
      if ((this.selStyleWid.workflowPath.length === 0 || this.selStyleWid.workflowPath.length !== 1) && this.selStyleWid.isStepwiseSLA) {
        this.inValidSLA = true;
        this.slaStepsObs = of([]);
        this.slaSteps = [];
      } else {
        this.inValidSLA = false;
      }
    }
    this.saveQueue.next(this.selStyleWid);
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
   * Remove Validators.required error form FormControl
   */
  removeError(value: 'fieldCtrl' | 'datasetCtrl') {
    switch (value) {
      case 'fieldCtrl':
        // this.fieldCtrl = new FormControl('');
        this.fieldCtrl.setErrors(null);
        this.fieldCtrl.setValue('', { emitEvent: false });
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

  setWidgetProp(data: Widget) {
    if (data) {
      this.widgetNameTouched = false;
      this.styleCtrlGrp.controls.aggregrationOp.markAsUntouched();
      this.removeError('fieldCtrl');
      this.removeError('datasetCtrl');
      this.lastSelectedWidget = this.selStyleWid ? cloneDeep(this.selStyleWid) : ({} as Widget);
      if (this.styleCtrlGrp) {
        const selectedFilterType = this.filterType.find((type) => type.key === data.filterType);
        const selectedOrderWith = this.orderWith.find((item) => item.key === data.orderWith);
        const selectedAggregrateOp = this.possibleAggregrationOperator.find((op) => op.key === data.aggregrationOp);
        const selectedDisplayCriteria = this.displayCriteria.find((display) => display.key === data.displayCriteria);
        const selectedRangeDateFormat = this.seriesWith.find((type) => type.key === data.rangeDateFormatInterval);

        let selectedDateSelectionType = null;
        if (data.dateFilterCtrl?.dateSelectedFor) {
          selectedDateSelectionType = this.dateSelectionType.find((item) => item.key === data.dateFilterCtrl?.dateSelectedFor);
        }
        if (data.workflowPath && this.workflowPath) {
          this.selectedWorkflowPath = [];
          data.workflowPath.forEach((value) => {
            const filteredValue = this.workflowPath.find((item: any) => item.pathname === value);
            if (filteredValue) this.selectedWorkflowPath.push(filteredValue);
          });
        }
        if (data.datasetType === 'diw_dataset') {
          this.isDIWDatasetSelected = true;
        } else {
          this.isDIWDatasetSelected = false;
        }
        this.styleCtrlGrp.setValue({
          widgetName: data.widgetTitle ? data.widgetTitle : '',
          isCustomdataSet: data.isCustomdataSet ? data.isCustomdataSet : false,
          isWorkflowdataSet: data.isWorkflowdataSet ? data.isWorkflowdataSet : false,
          field: data.field ? data.field : '',
          aggregrationOp: data.aggregrationOp ? selectedAggregrateOp : '',
          filterType: data.filterType ? selectedFilterType : '',
          isMultiSelect: data.isMultiSelect ? data.isMultiSelect : false,
          orderWith: data.orderWith ? selectedOrderWith : null,
          groupById: data.groupById ? data.groupById : '',
          imageUrl: data.imageUrl ? data.imageUrl : '',
          htmlText: data.htmlText ? data.htmlText : '',
          imagesno: data.imagesno ? data.imagesno : '',
          imageName: data.imageName ? data.imageName : '',
          dateSelectionType: selectedDateSelectionType,
          // startDate: startDate ? moment(startDate) : '',
          // endDate: endDate ? moment(endDate) : '',
          date: data.dateFilterCtrl?.startDate ? { start: new Date(data.dateFilterCtrl?.startDate), end: new Date(data.dateFilterCtrl?.endDate) } : null,
          workflowPath: data.workflowPath ? data.workflowPath : [],
          distictWith: data.distictWith ? data.distictWith : '',
          pageDefaultSize: data.pageDefaultSize ? data.pageDefaultSize : '',
          displayCriteria: data.displayCriteria
            ? selectedDisplayCriteria
            : data.widgetType === WidgetType.TABLE_LIST
            ? { ...this.displayCriteria[1] }
            : '',
          objectType: data.objectType ? data.objectType : '',
          isFieldDistinct: data.isFieldDistinct ? data.isFieldDistinct : false,
          isEnableGlobalFilter: data.isEnableGlobalFilter ? data.isEnableGlobalFilter : false,
          applyDistinct: data.applyDistinct ? data.applyDistinct : false,
          rangeBucketLimit: data.rangeBucketLimit ? data.rangeBucketLimit : '',
          rangeBucketSize: data.rangeBucketSize ? data.rangeBucketSize : '',
          rangeCalculationFld: data.rangeCalculationFld ? data.rangeCalculationFld : '',
          rangeDateFormatInterval: data.rangeDateFormatInterval ? selectedRangeDateFormat : null,
          isEnableRange: data.isEnableRange ? true : false,
          measureFld: data.measureFld ? data.measureFld : '',
          brs: data.brs ? data.brs : '',
          datasetType: data.datasetType ? data.datasetType : '',
        });

        this.workFlowDatasetCount = this.styleCtrlGrp.get('objectType').value.split(',').length;
        // set value to properties frm ctrl
        if (data.chartProperties) {
          const selectedTimeInterval = this.timeInterval.find((item) => item.key === data.chartProperties.timeseriesStartDate);
          const selectedSeries = this.seriesWith.find((item) => item.key === data.chartProperties.seriesWith);
          const selectedChartType = this.chartType.find((type) => type.key === data.chartProperties.chartType);
          const selectedOrientation = this.orientation.find((orint) => orint.key === data.chartProperties.orientation);
          const selectedDataLabelPosition = this.datalabelsPosition.find((data1) => data1.key === data.chartProperties.datalabelsPosition);
          const selectedLegendPosition = this.legendPosition.find((legend) => legend.key === data.chartProperties.legendPosition);
          const selectedOrderWithValues = this.orderWith.find((order) => order.key === data.chartProperties.orderWith);
          const selectedBucketFilter = this.bucketFilter.find((bucket) => bucket.key === data.chartProperties.bucketFilter);
          const selectStepWiseSla = this.possibleIsStepWiseSLA.find((step) => step.key === data.isStepwiseSLA);
          const selectSlaSteps = data.workflowPathSteps ? data.workflowPathSteps : [];
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
            isStepWiseSla: selectStepWiseSla ? selectStepWiseSla : this.possibleIsStepWiseSLA.find((step) => step.key === false),
            selectSLASteps: selectSlaSteps ? selectSlaSteps : [],
          });
          if (this.selStyleWid.widgetType === WidgetType.TIMESERIES && this.selStyleWid.field === 'TIME_TAKEN') {
            if (data.chartProperties.timeTakenReportType) {
              const selectTimeTaken = this.possibleTimeTaken.find((step) => step.key === data.chartProperties.timeTakenReportType);
              this.chartPropCtrlGrp.patchValue({
                timeTakenReportType: selectTimeTaken
              });
            } else {
              this.chartPropCtrlGrp.patchValue({
                timeTakenReportType: this.possibleTimeTaken[0]
              });
            }
          }
          if (data.chartProperties.hasCustomSLA) {
            const slaType = this.slaMenu.find((item) => item.key === data.chartProperties.cSlaUnit);
            this.chartPropCtrlGrp.patchValue({
              slaType,
            });
          }
        } else if (
          data.widgetType === WidgetType.BAR_CHART ||
          data.widgetType === WidgetType.PIE_CHART ||
          data.widgetType === WidgetType.STACKED_BAR_CHART
        ) {
          this.chartPropCtrlGrp.setValue(
            {
              chartType: this.chartType[0],
              orientation: this.orientation[0],
              isEnableDatalabels: false,
              datalabelsPosition: this.datalabelsPosition[0],
              isEnableLegend: false,
              legendPosition: this.legendPosition[0],
              xAxisLabel: '',
              yAxisLabel: '',
              orderWith: null,
              scaleFrom: '',
              scaleTo: '',
              stepSize: '',
              dataSetSize: '',
              seriesWith: this.seriesWith[0],
              seriesFormat: '',
              blankValueAlias: '',
              timeseriesStartDate: this.timeInterval[1],
              isEnabledBarPerc: false,
              bucketFilter: null,
              showTotal: false,
              isEnableBenchMark: false,
              benchMarkValue: ''
            },
            { emitEvent: false }
          );
        }
        // add default filters
        if (data.defaultFilters) {
          const frmArray = this.defaultFilterCtrlGrp.controls.filters as FormArray;
          const defFill: Criteria[] = [];
          data.defaultFilters.forEach((each) => defFill.push(each));
          frmArray.clear();
          defFill.forEach((dat) => {
            frmArray.push(
              this.formBuilder.group({
                conditionFieldId: [dat.conditionFieldId],
                conditionFieldValue: [dat.conditionFieldValue],
                blockType: [BlockType.COND],
                conditionFieldEndValue: [dat.conditionFieldEndValue],
                conditionOperator: [dat.conditionOperator, Validators.required],
                udrid: [data.widgetId ? data.widgetId : ''],
                showRangeFld: false,
              })
            );
          });
        } else {
          this.defaultFilterCtrlGrp = this.formBuilder.group({
            filters: this.formBuilder.array([]),
          });
        }
      }
      this.chooseColumns = data.widgetTableFields ? data.widgetTableFields : [];

      this.datasetCtrl.setValue('', { emitEvent: false });
      // make while edit widget ..
      if (!data.isWorkflowdataSet && !data.isCustomdataSet && data.objectType && data.datasetType !== 'diw_dataset') {
        const hasObj = this.dataSets.filter((fil) => fil.moduleId === data.objectType)[0];
        if (hasObj) {
          this.datasetCtrl.setValue(hasObj, { emitEvent: false });
        }
      } else if (!data.isWorkflowdataSet && data.isCustomdataSet && data.objectType) {
        const hasObj = this.customDataSets.filter((fil) => fil.objectid === data.objectType)[0];
        if (hasObj) {
          this.datasetCtrl.setValue(hasObj, { emitEvent: false });
        }
      } else if (data.datasetType === 'diw_dataset' && data.objectType && data.objectType.includes('/')) {
        const id = data.objectType.split('/')[1];
        const obj = this.diwDataSets.filter((item) => item.schemaId === id)[0];
        this.datasetCtrl.setValue(obj, { emitEvent: false });
        this.selStyleWid.field = '__DIW_STATUS';
        if (this.widgetInfo.widgetType === 'COUNT') {
          this.styleCtrlGrp.get('aggregrationOp').setValue(this.aggregrationOp.find((op) => op.key === AggregationOperator.COUNT));
          this.styleCtrlGrp.get('aggregrationOp').disable();
        }
      }

      if (this.selStyleWid.workflowPath && this.selStyleWid.workflowPath.length && this.chartPropCtrlGrp.controls.isStepWiseSla.value) {
        this.getWorkflowSteps(this.selStyleWid.workflowPath[0]);
      }

      if (typeof this.styleCtrlGrp.get('rangeCalculationFld').value === 'string') {
        if (this.rangeHeaderFields) {
          const conditionFieldValue = this.styleCtrlGrp.get('rangeCalculationFld').value;
          let selectedFieldValue: any = this.rangeSystemFields.find((item) => item.fieldId === conditionFieldValue);
          if (!selectedFieldValue) selectedFieldValue = this.rangeHeaderFields.find((item) => item.fieldId === conditionFieldValue);
          if (!selectedFieldValue) {
            this.rangeFields.some((item) => {
              selectedFieldValue = item.childs.find((val) => val.fieldId === conditionFieldValue);
              if (selectedFieldValue) {
                return true;
              }
            });
          }
          if (selectedFieldValue) this.styleCtrlGrp.get('rangeCalculationFld').setValue(selectedFieldValue);
        }
      }
    }
  }

  getpreSelectedFieldDataType(fieldData) {
    if (fieldData) this.fieldDataType = fieldData.fldCtrl?.dataType;
  }

  /**
   * Search data sets ..
   * @param value searchable text
   */
  searchDataSet(value: string) {
    this.searchDataSetVal = value;
    this.styleCtrlGrp.get('objectType').setValue(this.searchDataSetVal);
    if (value) {
      this.searchModuleDataset(value);
      // this.customDataSetob = of(
      //   this.customDataSets?.filter((fil) => fil.objectdesc.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1)
      // );
      this.DIWDatasetOb = of(
        this.diwDataSets?.filter((dataSet) => dataSet.desc.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1)
      );
    } else {
      this.dataSetOb = of(this.dataSets);
      // this.customDataSetob = of(this.customDataSets);
      this.DIWDatasetOb = of(this.diwDataSets);
    }
  }

  searchModuleDataset(val){
    const objSub = this.coreService.getDataSets(val,0,20,this.locale,[]).subscribe(
      (res : any) => {
        this.dataSetOb = of(res);
      },
      (error) => console.error(`Error: ${error}`)
    );
    this.subscriptions.push(objSub);
  }

  getWorkflowSteps(workflowId) {
    this.processService.getSlaSteps(workflowId).subscribe((res) => {
      this.slaSteps = res;
      this.slaStepsObs = of(this.slaSteps);
      if (this.chartPropCtrlGrp.get('selectSLASteps').value) {
        const selectedSteps = this.chartPropCtrlGrp.get('selectSLASteps').value;
        if (Array.isArray(selectedSteps) && selectedSteps.length && typeof selectedSteps[0] === 'string') {
          const selectedValues = selectedSteps.map((item) => {
            const selectedValue = this.slaSteps.find((el) => el.stepId === item);
            return selectedValue;
          });
          this.chartPropCtrlGrp.controls.selectSLASteps.patchValue(selectedValues);
          this.selStyleWid.workflowPathSteps = selectedSteps;
        }
      }
    });
  }

  isCheckedSla(option) {
    const index = this.selStyleWid.workflowPathSteps.findIndex((steps) => steps === option.stepId);
    if (index > -1) {
      return true;
    } else return false;
  }

  get isFieldError() {
    if (
      this.selStyleWid.widgetType === WidgetType.COUNT &&
      this.selStyleWid.aggregrationOp &&
      this.selStyleWid.aggregrationOp !== AggregationOperator.COUNT
    ) {
      if (
        this.selStyleWid.fieldCtrl &&
        !(this.selStyleWid.fieldCtrl.dataType === 'NUMC' || this.selStyleWid.fieldCtrl.dataType === 'DEC')
      ) {
        return true;
      }
    }
  }

  stepSelection(field: SlaStepSize) {
    this.chartPropCtrlGrp.get('selectSLASteps').setValue('');
    const selectedStep = this.selStyleWid.workflowPathSteps.filter((step) => step === field.stepId);
    if (selectedStep && selectedStep.length) {
      this.selStyleWid.workflowPathSteps.splice(this.selStyleWid.workflowPathSteps.indexOf(selectedStep[0]), 1);
    } else {
      this.selStyleWid.workflowPathSteps.push(field.stepId);
    }
    this.chartPropCtrlGrp.get('selectSLASteps').setValue(this.selStyleWid.workflowPathSteps);
  }

  /**
   * Sanitize Form control value
   * @param control Form control
   */
  sanitizeValue(control) {
    control.setValue(control.value.replace(/\\|\//g,'').replace(':', '').replace('*', '').replace('?', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(/'/g, ''));
  }

  /**
   * call api to get business rules according to schema id
   * @param schemaId string that holds the value schema id
   */
  getBusinessRules(schemaId: string) {
    this.subscriptions.push(
      this.schemaService.getBuisnessRulesBasedOnRun(schemaId, '').subscribe((res) => {
        this.allBusinessRulesOptions = res;
        this.businessRuleOptions = of(this.allBusinessRulesOptions);
        if (this.selStyleWid.brs?.length && !this.selectedOptions?.length) {
          const brsData = this.selStyleWid.brs.split(',');
          brsData.forEach((brsdata) => {
            this.allBusinessRulesOptions.forEach((item) => {
              if (item.brId === brsdata) {
                this.selectedOptions.push(item.desc || item.brInfo);
                this.selectedBrIds.push(item.brId);
              }
            });
          });
        }
      })
    );
  }

  /**
   * Remove selected option from selected dataset options
   * @param id selected id
   */
  remove(id): void {
    const index = this.selectedOptions.indexOf(id);
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    }
    this.businessRuleOptions.forEach((item) => {
      const ruleIndex = item.findIndex((filt) => (filt.desc || filt.brInfo) === id);
      if (ruleIndex > -1) {
        this.selectedBrIds.splice(ruleIndex, 1);
        this.styleCtrlGrp.get('brs').setValue(this.selectedBrIds.join());
      }
    });
  }

  /**
   * to check if limit is extended
   * @returns boolean
   */
  hasLimit(): boolean {
    return this.selectedOptions.length > this.limit;
  }

  /*** method to add item to selected items for multisleect
   * @param event mat autocomplete event
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    // this.selectedOptions.push(event.option.value);
    const selectIndex = this.selectedOptions.findIndex((item) => item === (event.option.value.desc || event.option.value.brInfo));
    if (selectIndex === -1) {
      this.selectedOptions.push(event.option.value.desc || event.option.value.brInfo);
    }
    const index = this.selectedBrIds.findIndex((item) => item === event.option.value.brId);
    if (index === -1) {
      this.selectedBrIds.push(event.option.value.brId);
      this.styleCtrlGrp.get('brs').setValue(this.selectedBrIds.join());
    }

    // @ts-ignore
    this.diwDatasetOptionInput = '';
    this.businessRuleFormCtrl.setValue(null)
  }

  /**
   * method returns the tooltip string
   * @param data get current module
   */
  getTooltip(data: Dataset): string {
      const toolData = data ? data.moduleDesc : '';
      return toolData;
  }

  /**
   * check whether default day is selected as custom or not
   * @returns default date selected type
   */
  returnDefaultDate(){
    if(this.styleCtrlGrp){
      const date = this.styleCtrlGrp.get('dateSelectionType').value;
      if (date && date.key === 'CUSTOM') {
        return true;
      }
    } else {
      return false;
    }
  }
}
