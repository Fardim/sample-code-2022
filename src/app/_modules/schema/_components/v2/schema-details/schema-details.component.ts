import { Component, OnInit, AfterViewInit, ViewChild, ComponentFactoryResolver, ViewContainerRef, Input, OnChanges, SimpleChanges, OnDestroy, ElementRef, Output, EventEmitter, NgZone, Inject, LOCALE_ID } from '@angular/core';
import { MetadataModeleResponse, RequestForSchemaDetailsWithBr, SchemaCorrectionReq, FilterCriteria, FieldInputType, SchemaTableViewFldMap, SchemaTableAction, TableActionViewType, SchemaTableViewRequest, STANDARD_TABLE_ACTIONS } from '@models/schema/schemadetailstable';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaDataSource } from '../../schema-details/schema-datatable/schema-data-source';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaStaticThresholdRes, LoadDropValueReq, SchemaListDetails, SchemaVariantsModel, SchemaNavGrab, ModuleInfo } from '@models/schema/schemalist';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { AddFilterOutput, CorrectionDetailView } from '@models/schema/schema';
import { MatMenuTrigger } from '@angular/material/menu';
import { CoreSchemaBrInfo, DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MatDialog } from '@angular/material/dialog';
import { SaveVariantDialogComponent } from '../save-variant-dialog/save-variant-dialog.component';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { TableCellInputComponent } from '@modules/shared/_components/table-cell-input/table-cell-input.component';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { debounceTime, distinctUntilChanged, filter, skip, take } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { SchemaExecutionNodeType, SchemaExecutionTree } from '@models/schema/schema-execution';
import { DownloadExecutionDataComponent } from '../download-execution-data/download-execution-data.component';
import { debounce } from 'lodash';
import { MatTable } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { BadgeService, BadgeStatus } from '@services/home/schema/badge.service';
import { SchemaViewComponent } from '../_builder/schema-view/schema-view.component';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-schema-details',
  templateUrl: './schema-details.component.html',
  styleUrls: ['./schema-details.component.scss']
})
export class SchemaDetailsComponent extends SchemaViewComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  get listContainerStyle() {
    return {
      height: `calc(100% - 70px - ${this.filterContainer?.nativeElement.offsetHeight || 80}px)`
    }
  }

  get hasActiveTabData() {
    const tabNames = {
      error: 'errorCnt',
      success: 'successCnt',
      review: 'correctedCnt',
      outdated: 'outdatedCnt',
      skipped: 'skippedCnt'
    };
    return Boolean(this.dataSource.docLength() || this.activeNode?.docCount && this.statics && this.statics[tabNames[this.activeTab]]);
  }

  constructor(
    private ngZone: NgZone,
    public activatedRouter: ActivatedRoute,
    public schemaDetailService: SchemaDetailsService,
    private router: Router,
    private sharedServices: SharedServiceService,
    private schemaService: SchemaService,
    private endpointservice: EndpointsClassicService,
    private matDialog: MatDialog,
    private schemaListService: SchemalistService,
    private schemaVariantService: SchemaVariantService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private userService: UserService,
    public schemaDetailsService: SchemaDetailsService,
    private transientService: TransientService,
    private badgeService: BadgeService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(schemaDetailService)
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  get isGlobalActionsEnabled() {
    return this.selection.selected.some(row => !row.OBJECTNUMBER.isReviewed);
  }

  /**
   * Hold the active cell's position
   */
  activeCell: {
    column: string,
    rowIndex: number
  };

  /**
   * Http request status
   */
  requestStatus: BadgeStatus;

  /**
   * Module / dataset id
   */
  @Input()
  moduleId: string;

  /**
   * Schema id
   */
  @Input()
  schemaId: string;

  /**
   * Variant id if have otherwise by default is 0 for all
   */
  @Input()
  variantId = '0';

  /**
   * Variant name if have otherwise by default is entire dataset
   */
  variantName = '';
  editableFields: any = {};

  /**
   * Selected Variant total count
   */
  variantTotalCnt = 0;

  /**
   * doc count for entire dataset
   */
  totalVariantsCnt = 0;

  /**
   * Hold all metada control for header , hierarchy and grid fields ..
   */
  metadata: BehaviorSubject<MetadataModeleResponse> = new BehaviorSubject<MetadataModeleResponse>(null);

  /**
   * Store info about user selected field and order
   */
  selectedFieldsOb: Subject<boolean> = new Subject();
  /**
   * Hold meta data map , fieldId as key and metadamodel as value
   */
  metadataFldLst: any = {};

  /**
   * Current selected field based on schemaId , variantId and userId
   */
  selectedFields: SchemaTableViewFldMap[] = [];

  /**
   * Static column for actions
   */
  startColumns = ['_assigned_buckets', '_score_weightage', '_row_actions', 'OBJECTNUMBER'];

  /**
   * All display column fieldid should be here
   */
  displayedFields: BehaviorSubject<string[]> = new BehaviorSubject(this.startColumns);

  /**
   * Datasource for data table data
   */
  dataSource: SchemaDataSource;

  /**
   * Store info about active tab..
   */
  @Input()
  activeTab = 'error';

  /**
   * Executed statics of schema
   */
  statics: SchemaStaticThresholdRes;

  /**
   * Use only for fiter criteria while filtering data ...
   * why subject .. when value change then should send request for table data...
   */
  filterCriteria: BehaviorSubject<FilterCriteria[]> = new BehaviorSubject<FilterCriteria[]>(null);

  /**
   * Contains sort order here ..
   */
  sortOrder: any = {};

  /**
   * Show table loading ...
   */
  showTableLoading = false;

  /**
   * Conatins all selected rows ..
   */
  selection = new SelectionModel<any>(true, []);

  /**
   * Make table header row visiable
   */
  tableHeaderActBtn: string[] = [];

  /**
   * Hold info about for try to load value for
   * selected field id with preselcted ..
   */
  loadDopValuesFor: LoadDropValueReq;

  /**
   * Flag for re inilize filterable field ..
   */
  reInilize = true;

  /**
   * Input value for search by object number ..
   */
  preInpVal = '';

  /**
   * Outlet in which side sheet will be opened..
   */
  outlet = 'sb';

  /**
   * Store all data scopes ...  as a variants
   */
  dataScope: SchemaVariantsModel[] = [];

  /**
   * Current schema info ..
   */
  @Input() schemaInfo: SchemaListDetails;

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  @ViewChild('navscroll') navscroll: ElementRef;
  @ViewChild('listingContainer') listingContainer: ElementRef;
  @ViewChild('filterContainer') filterContainer: ElementRef;
  @ViewChild('table') table: MatTable<any>;
  @ViewChild('tableContainer') tableContainer: ElementRef;

  FIELD_TYPE = FieldInputType;

  selectFieldOptions: DropDownValue[] = [];

  /**
   * Emit event to details builder component when schema running is completed
   */
  @Output() runCompleted = new EventEmitter();

  /**
   * Hold info about current user
   */
  userDetails: Userdetails;

  /**
   * arrow mat-icon code
   */
  arrowIcon = 'chevron-left';

  /**
   * hold scroll limit reached edge
   */
  scrollLimitReached = false;
  TableActionViewType = TableActionViewType;

  tableActionsList: SchemaTableAction[] = [
    { actionText: 'Confirm', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON_TEXT, actionCode: STANDARD_TABLE_ACTIONS.APPROVE, actionIconLigature: 'check' },
    { actionText: 'Revert', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON_TEXT, actionCode: STANDARD_TABLE_ACTIONS.REJECT, actionIconLigature: 'ban' }
  ] as SchemaTableAction[];

  /**
   * To hold running value of schema
   */
  @Input()
  isInRunning: boolean;

  inlineSearchSubject: Subject<string> = new Subject();

  widthOfSchemaNav = 247;
  showChats = false;
  boxPosition: { left: number, top: number };
  public mousePosition: { x: number, y: number };
  public status: SchemaNavGrab = SchemaNavGrab.OFF;

  /**
   * All subscription should be in this variable ..
   */
  subscribers: Subscription[] = [];

  activeNode: SchemaExecutionTree = new SchemaExecutionTree();

  // holds execution tree details of schema...
  executionTreeHierarchy: SchemaExecutionTree;

  /**
   * holds file upload progress screen show/hide status
   */
  isFileUploading: boolean;

  /**
   * holds module info
   */
  moduleInfo: ModuleInfo;

  /**
   * All selected columns , header , hierrachy or grid as a key and string [] as a columns
   */
  columns: any = {};

  /**
   * Selected node id ....
   */
  nodeId = 'header';

  /**
   * Selected node type ...
   */
  nodeType = 'HEADER';

  /**
   * flag to enable/disable resizeable
   */
  grab = false;



   isRefresh = false;

  executionTreeObs: Subject<SchemaExecutionTree> = new Subject();

  currentDatascopePageNo = 0;

   /**
    * Store the all filter able buisness rule which is involved
    */
   filterableRulesOb: Observable<CoreSchemaBrInfo[]> = of([]);
   brList: CoreSchemaBrInfo[] = [];
   appliedBrList: CoreSchemaBrInfo[] = [];

  searchFrmCtrl: FormControl = new FormControl();

  delayedCall = debounce((searchText: string) => {
    this.businessRulesBasedOnLastRun(searchText);
  }, 300)

  /**
   * Skeleton Loader flags
   */
   loading = false;
   loader:any = {};
   isTableViewLoading = false;

  fieldsInUpdate = [];
  brRuleFilterDesc = '';

  /**
   * method to check if the user is admin for this schema
   * and whether the user can refine the schema
   */
  isAdmin = false;
  isEditer = false;
  isReviewer = false;
  isApprover = false;
  primaryActions;
  secondaryActions;
  view = CorrectionDetailView.details;
     setLoading(loadingObj: Partial<{
       schemaDetails: boolean;
       variantDetails: boolean;
       getDataScope: boolean;
       schemaStatics: boolean;
       getModuleInfo: boolean;
       getData: boolean;
     }> = {}) {

       Object.assign(this.loader, loadingObj);
       this.isTableViewLoading = Boolean(this.schemaInfo && this.statics);
       this.loading = Boolean(!this.schemaInfo || (!this.statics && !this.isInRunning) || Object.keys(this.loader).find(x => this.loader[x]));
    }

  ngOnDestroy(): void {
    this.subscribers.forEach(s => {
      s.unsubscribe();
    });
    this.subscribers = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    // check if any things is change then refresh again
    this.isRefresh = false;
    if (changes && changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue) {
      this.moduleId = changes.moduleId.currentValue;
      this.isRefresh = true;
     // delete this.schemaInfo;
      this.metadata.next(null);
    }

    if (changes && changes.schemaId && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
      this.showChats = false;
      this.schemaId = changes.schemaId.currentValue;
      this.isRefresh = true;
     // delete this.schemaInfo;
      this.ngOnDestroy();
      this.subscribers.push(this.sharedServices.getSchemaDetailsTableDataAPICallState().subscribe((state: string) => {
        if (state === 'true') {
          this.setLoading({
            getData: true
          });
        } else if (state === 'false') {
          this.setLoading({
            getData: false
          });
        }
      }));
      this.filterCriteria.next(null);
      this.searchFrmCtrl.setValue('');
    }

    if (changes && changes.variantId && changes.variantId.currentValue !== changes.variantId.previousValue) {
      this.variantId = changes.variantId.currentValue;
      this.isRefresh = true;
    }

    if (changes && changes.isInRunning && changes.isInRunning.currentValue !== changes.isInRunning.previousValue) {
      this.isInRunning = changes.isInRunning.currentValue;
      this.isRefresh = true;
    }

    if(changes && changes.schemaInfo) {
      this.refreshUserMode();
    }

    if (this.isRefresh) {
      this.getEntireDatasetCount();
      this.getModuleInfo(this.moduleId);
    }


    if (this.isRefresh && !this.isInRunning) {
      this.activeTab = 'error';
      this.updateEditableFields();
      this.getFldMetadata();
      this.dataSource = new SchemaDataSource(this.schemaDetailService, this.endpointservice, this.schemaId, this.sharedServices);
      this.dataSource.populateData = this.populateData.bind(this);
      this.getSchemaStatics();
      this.getSchemaTableActions();
      if (this.variantId !== '0') {
        this.getVariantDetails();
      } else {
        this.variantId = '0';
      }
      this.executionTreeObs = new Subject();
      if (this.userDetails && this.userDetails.userName) {
        this.getSchemaExecutionTree(this.userDetails.plantCode, this.userDetails.userName);
      } else {
        this.executionTreeHierarchy = new SchemaExecutionTree();
      }

      combineLatest([this.metadata, this.executionTreeObs]).pipe(
        filter(res => !!res[0] && !!res[1]),
        take(1)
      )
        .subscribe(res => {
          const params = this.activatedRouter.snapshot.queryParamMap;
          const nodeId = params.get('node') || 'header';
          const treeArray = this.getExectionArray(this.executionTreeHierarchy);
          this.activeNode = treeArray.find(n => n.nodeId === nodeId);
          this.selectedNodeChange(params);
        });

      // get the business rules based on last execution
      this.appliedBrList = [];
      this.businessRulesBasedOnLastRun('');
      this.refreshBrRuleFilterDesc();
      this.isRefresh = false;
    }

    this.manageStaticColumns();
    // this.dataSource.brMetadata.subscribe(res => {
    //   if (res) {
    //   // this.getData();
    // }
    // });

    // reset filter and sort order
    // this.filterCriteria.next(null);
    this.preInpVal = '';

    if (changes && changes.activeTab && changes.activeTab.currentValue !== changes.activeTab.previousValue) {
      this.activeTab = changes.activeTab.currentValue;
      this.manageStaticColumns();
      this.updateEditableFields();
    }
    this.setLoading();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(res => {
        if (res.direction) {
          const fldId = res.active ? res.active : '';
          const order = res.direction;
          this.sortOrder = {};
          this.sortOrder[fldId] = order;
          this.getData(this.filterCriteria.getValue(), this.sortOrder);
        }
      });
    }
    // this.setNavDivPositions();
    // this.enableResize();
  }

  /**
   * use this method to update the UI after dynamic columns are displayed
   */
  updateTableColumnSize() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => {
      if(this.table) {
        this.table.updateStickyColumnStyles();
      }
    });
    this.activeCell = null;
  }

  ngOnInit(): void {
    this.refreshActions();
    this.subscribers.push(this.displayedFields.subscribe(() => {
      this.updateEditableFields();
    }));

    const userDataSub = this.userService.getUserDetails().subscribe(res => {
      this.userDetails = res;
      this.refreshUserMode();
    }, err => console.log(`Error ${err}`));

    this.subscribers.push(
      this.sharedServices.getAfterVariantDeleted().subscribe((res) => {
        if (res) {
          this.getDataScope(this.variantId, false);
        }
      })
    );
    this.activatedRouter.queryParamMap.subscribe(ar=>{
      if (ar.get('view')) {
        const currentView = ar.get('view');
        this.view = currentView === 'statics' ? CorrectionDetailView.statics : CorrectionDetailView.details;
      }
      if(!this.isRefresh) {
        const nodeId = ar.get('node') || 'header';
        if (nodeId !== this.nodeId) {
          this.selectedNodeChange(ar);
        }
      }
      this.isRefresh = false;
      const filterCriteria = JSON.parse(unescape(ar.get('f')));
      const selectedRules = JSON.parse(unescape(ar.get('rule')));
      // if(selectedRules && selectedRules.length){
      //   this.appliedBrList = selectedRules.map(item => { return { brIdStr: item } });
      // }
      // this.filterCriteria.next(filterCriteria);
      this.modifyFilterCriteria({filters :filterCriteria, rule: selectedRules});
    });

    this.subscribers.push(this.sharedServices.getDataScope().subscribe(res => {
      if (res) {
        this.getDataScope(res); // Get Data scope..
      }
    }));

    /**
     * After choose columns get updated columns ..
     */
    this.sharedServices.getChooseColumnData().pipe(skip(1)).subscribe(result => {
      if (result && !result.editActive) {
        this.updateColumnBasedOnNodeSelection(this.nodeId, this.nodeType, true);
        this.getData(this.filterCriteria.getValue(), this.sortOrder);
        if (result.tableActionsList && result.tableActionsList.length) {
          this.tableActionsList = result.tableActionsList;
          this.refreshActions();
        }
      }
    });

    /**
     * Combine obserable for metadata and selected field by user
     * And calcute display field and order
     */
    this.selectedFieldsOb.subscribe(updateTableView => {
      if (updateTableView) {
        const schemaTableViewRequest: SchemaTableViewRequest = new SchemaTableViewRequest();
        schemaTableViewRequest.schemaId = this.schemaId;
        schemaTableViewRequest.variantId = this.variantId ? this.variantId : '0';
        schemaTableViewRequest.schemaTableViewMapping = this.selectedFields;
        const sub = this.schemaDetailsService.updateSchemaTableView(schemaTableViewRequest).subscribe(response => {
          console.log(response);
        }, error => {
          console.error('Exception while persist table view');
        });
        this.subscribers.push(sub);
      }
      this.calculateDisplayFields();
      if(updateTableView) {
        this.getSchemaStatics(false);
      }
    });

    /**
     * After filter applied should call for get data
     */
    this.filterCriteria.subscribe(res => {
      if (res !== null && !this.isInRunning) {
        this.getData(res, this.sortOrder);
        this.getSchemaExecutionTree(this.userDetails.plantCode, this.userDetails.userName);
        this.getSchemaStatics(false);
      }
    });

    /**
     * While row selection change then control the header actions..
     */
    this.selection.changed.subscribe(res => {
      if (res.source.selected.length > 0) {
        this.tableHeaderActBtn = ['review_actions_header'];
      } else {
        this.tableHeaderActBtn = [];
      }
    });

    const userDataForSchemaTree = this.userService.getUserDetails().pipe(
      filter(details => !!details && !!details.userName),
      distinctUntilChanged(),
      take(1)
    ).subscribe(res => {
      this.getSchemaExecutionTree(res.plantCode, res.userName);
    }, err => console.log(`Error ${err}`));

    this.subscribers.push(userDataForSchemaTree);
    this.subscribers.push(userDataSub);

    /**
     * inline search changes
     */
    this.inlineSearchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(value => this.inlineSearch(value));


    this.searchFrmCtrl.valueChanges.subscribe(v => {
      this.inlineSearchSubject.next(v);
    });

    this.subscribers.push(this.sharedServices.getSchemaDetailsTableDataAPICallState().subscribe((state: string) => {
      if (state === 'true') {
        this.setLoading({
          getData: true
        });
      } else if (state === 'false') {
        this.setLoading({
          getData: false
        });
      }
    }));
    this.setLoading();
  }

  selectedNodeChange(params: ParamMap) {
    this.setLoading({
      getData: true
    });
    this.nodeId = params.get('node') || 'header';
    this.nodeType = params.get('node-level') || 'HEADER';
    this.updateColumnBasedOnNodeSelection(this.nodeId, this.nodeType, true);
  }


  /**
   * Call service for get schema statics based on schemaId and latest run
   */
  getSchemaStatics(loading = true) {
    this.setLoading({
      schemaStatics: loading
    });
      const filterCriteria = this.filterCriteria.getValue() || [];
      const sub = this.schemaService.getSchemaThresholdStaticsV2(this.schemaId, this.variantId, this.appliedBrList ? this.appliedBrList.map(m => m.brIdStr) : [], filterCriteria).subscribe(res => {
        this.statics = res;
        this.setLoading({
          schemaStatics: false
        });
        this.updateTableColumnSize();
      }, error => {
        this.statics = new SchemaStaticThresholdRes();
        this.setLoading({
          schemaStatics: false
        });
        this.updateTableColumnSize();
        console.error(`Error : ${error}`);
      });
      this.subscribers.push(sub);
  }

  /**
   * Call service to get schema execution tree
   */
  getSchemaExecutionTree(plantCode, userName) {
    const filterCriteria = this.filterCriteria.getValue() || [];
    const sub = this.schemaService.getSchemaExecutionTreeV2(this.moduleId, this.schemaId, this.variantId, plantCode, userName, this.activeTab, this.appliedBrList ? this.appliedBrList.map(m => m.brIdStr) : [], filterCriteria).subscribe(res => {
      this.executionTreeHierarchy = res;
      this.executionTreeObs.next(res);
    }, error => {
      this.executionTreeHierarchy = new SchemaExecutionTree();
      console.error(error);
    });
    this.subscribers.push(sub);
  }

  /**
   * Get schema variant details ..
   */
  getVariantDetails() {
    this.setLoading({
      variantDetails: true
    });
    const sub = this.schemaVariantService.getVariantdetailsByvariantId(this.variantId, this.userDetails.currentRoleId, this.userDetails.plantCode, this.userDetails.userName).subscribe(res => {
      if (res) {
        const finalFiletr: FilterCriteria[] = [];
        const inline = res.filterCriteria.filter(fil => fil.fieldId === 'id')[0];
        if (inline) {
          this.preInpVal = inline.values ? inline.values.toString() : '';
          finalFiletr.push(inline);
        }
        res.filterCriteria.forEach(fil => {
          const fltr: FilterCriteria = fil; // new FilterCriteria();
          // fltr.fieldId = fil.fieldId;
          // fltr.type = fil.type;
          // fltr.values = fil.values;

          const dropVal: DropDownValue[] = [];
          if (fltr.values) {
            fltr.values.forEach(val => {
              const dd: DropDownValue = { CODE: val, FIELDNAME: fil.fieldId } as DropDownValue;
              dropVal.push(dd);
            });
          }

          fltr.filterCtrl = { fldCtrl: fil.fldCtrl, selectedValues: dropVal };
          finalFiletr.push(fltr);
        });

        this.filterCriteria.next(finalFiletr);
      }
      this.setLoading({
        variantDetails: false
      });
    }, error => {
      this.setLoading({
        variantDetails: false
      });
      console.error(`Error : ${error.message}`);
    });
    this.subscribers.push(sub);
  }

  /**
   * Get all fld metada based on module of schema
   */
  getFldMetadata() {
    if (this.moduleId === undefined || this.moduleId.trim() === '') {
      throw new Error('Module id cant be null or empty');
    }
    const sub = this.coreService.getMetadataFieldsByModuleId([this.moduleId],'').subscribe(response => {
      this.metadata.next(response);
    }, error => {
      console.error(`Error : ${error.message}`);
    });
    this.subscribers.push(sub);
  }

  /**
   * Calculate fields based on user view ..
   *
   */
  calculateDisplayFields(): void {

    const metaFld = this.getAllNodeFields(this.activeNode);

    const fields = [];
    const select = [];
    const metadataLst: any = {};
    this.startColumns.forEach(col => fields.push(col));
    for (const headerField in metaFld) {
      if (metaFld.hasOwnProperty(headerField)) {
        const index = this.selectedFields.findIndex(f => f.fieldId === headerField);
        if (fields.indexOf(headerField) < 0 && (index !== -1)) {
          select[index] = headerField;
        }
        metadataLst[headerField] = metaFld[headerField];
      }
    }

    this.metadataFldLst = metadataLst;
    select.forEach(fldId => fields.push(fldId));
    this.displayedFields.next(fields);
    console.log(this.displayedFields.getValue());
  }

  getAllNodeFields(node: SchemaExecutionTree) {

    if (!node || !node.nodeId) {
      return this.metadata.getValue() ? this.metadata.getValue().headers : {};
    }
    let fields = {};
    const parentNode = this.getParentNode(node.nodeId);
    if (parentNode) {
      if (node.nodeType === SchemaExecutionNodeType.HEADER) {
        fields = this.metadata.getValue() ? this.metadata.getValue().headers || {} : {};
        Object.keys(fields).forEach(f => {
          fields[f] = { ...fields[f], nodeId: node.nodeId, nodeType: node.nodeType };
        });
        const parentFields = this.getAllNodeFields(parentNode);
        fields = { ...fields, ...parentFields };
      } else if (node.nodeType === SchemaExecutionNodeType.HEIRARCHY) {
        fields = this.metadata.getValue() ? this.metadata.getValue().hierarchyFields[node.nodeId] || {} : {};
        Object.keys(fields).forEach(f => {
          fields[f] = { ...fields[f], nodeId: node.nodeId, nodeType: node.nodeType };
        });
        const parentFields = this.getAllNodeFields(parentNode);
        fields = { ...fields, ...parentFields };
      } else if (node.nodeType === SchemaExecutionNodeType.GRID) {
        fields = this.metadata.getValue() ? this.metadata.getValue().gridFields[node.nodeId] || {} : {};
        Object.keys(fields).forEach(f => {
          fields[f] = { ...fields[f], nodeId: node.nodeId, nodeType: node.nodeType };
        });
        const parentFields = this.getAllNodeFields(parentNode);
        fields = { ...fields, ...parentFields };
      }
    } else {
      if (node.nodeType === SchemaExecutionNodeType.HEADER) {
        fields = this.metadata.getValue() ? this.metadata.getValue().headers || {} : {};
      } else if (node.nodeType === SchemaExecutionNodeType.HEIRARCHY) {
        fields = this.metadata.getValue() ? this.metadata.getValue().hierarchyFields[node.nodeId] || {} : {};
      } else if (node.nodeType === SchemaExecutionNodeType.GRID) {
        fields = this.metadata.getValue() ? this.metadata.getValue().gridFields[node.nodeId] || {} : {};
      }
      Object.keys(fields).forEach(f => {
        fields[f] = { ...fields[f], nodeId: node.nodeId, nodeType: node.nodeType };
      });
    }

    return fields;
  }

  getParentNode(nodeId) {
    const executionTreeArray = this.getExectionArray(this.executionTreeHierarchy) || [];
    const node = executionTreeArray.find(n => (n.nodeId === nodeId));
    if (node && node.parentNodeId) {
      return executionTreeArray.find(n => n.nodeId === node.parentNodeId);
    }
    return null;
  }

  /**
   * Map schema execution tree to an array
   * @param node root node
   * @param parentNodeId parent id
   * @returns execution array
   */
  getExectionArray(node: SchemaExecutionTree, parentNodeId?: string) {
    let executionTreeArray = [];
    const index = executionTreeArray.findIndex(n => n.nodeId === node.nodeId);
    if (index !== -1) {
      executionTreeArray[index] = { ...node, parentNodeId };
    } else {
      executionTreeArray.push({ ...node, parentNodeId });
    }

    if (node && node.childs && node.childs.length) {
      node.childs.forEach(child => {
        executionTreeArray = executionTreeArray.concat(this.getExectionArray(child, node.nodeId));
      })
    }

    return executionTreeArray;
  }

  getNodeParentsHierarchy(childNode: SchemaExecutionTree) {
    if (!childNode || !childNode.nodeId) {
      return ['header'];
    }
    const parentNode = this.getParentNode(childNode.nodeId);
    if (parentNode) {
      return [childNode.nodeId].concat(this.getNodeParentsHierarchy(parentNode));
    } else {
      return ['header'];
    }
  }


  /**
   * Get table data from service ..
   * @param filterCriteria have default filter or apply filter as request...
   * @param sort apply some sorting on column ..
   */
  getData(filterCriteria?: FilterCriteria[], sort?: any, fetchCount?: number, isLoadMore?: boolean, loading = true, useCache = false) {
    this.selection.clear();
    this.setLoading({
      getData: loading
    });
    const request: RequestForSchemaDetailsWithBr = new RequestForSchemaDetailsWithBr();
    request.schemaId = this.schemaId;
    request.variantId = this.variantId;
    request.fetchCount = fetchCount ? fetchCount : 0;
    request.fetchSize = 40;
    request.requestStatus = this.activeTab;
    request.filterCriterias = filterCriteria;
    request.sort = sort;
    request.nodeId = this.nodeId ? this.nodeId : '';
    request.nodeType = this.nodeType ? this.nodeType : '';
    request.isLoadMore = isLoadMore ? isLoadMore : false;
    request.ruleSelected = this.appliedBrList ? this.appliedBrList.map(m => m.brIdStr) : [];
    this.dataSource.getTableData(request, useCache);
    this.dataSource.connect().subscribe(() => {
      this.updateTableColumnSize();
    });
  }


  /**
   * Navigate particular tab by tab status
   * @param status get tab name to navigate
   */
  changeTabStatus(status: string) {
    this.dataSource.fetchCount = 0;
    if (this.activeTab === status) {
      console.log('Already loaded for tab {}', status)
      return false;
    }
    this.activeTab = status;
    this.updateEditableFields();
    this.router.navigate(['/home/schema/list', this.schemaId], {
      queryParams: { status: this.activeTab }, queryParamsHandling: 'merge'
    });

    // update state of columns
    this.manageStaticColumns();
    this.calculateDisplayFields();
    this.selection.clear();
    this.dataSource.setDocValue([]);
    if (status === 'error' || status === 'success') {
      this.getData(this.filterCriteria.getValue(), this.sortOrder);
    } else {
      this.getData();
    }

    if (this.userDetails) {
      this.getSchemaExecutionTree(this.userDetails.plantCode, this.userDetails.userName);
    }
    this.getSchemaStatics(false);
  }

  /**
   * Oen choose column side sheet..
   */
  openTableColumnSettings() {
    const data = {
      schemaId: this.schemaId, variantId: this.variantId, fields: this.metadata.getValue(), selectedFields: this.selectedFields,
      editActive: true, activeNode: this.activeNode, allNodeFields: this.getAllNodeFields(this.activeNode)
    };
    this.sharedServices.setChooseColumnData(data);
    this.router.navigate(['', { outlets: { sb: 'sb/schema/table-column-settings' } }], { queryParamsHandling: 'preserve' });
  }

  /**
   * Method for download error or execution logs
   */
  downloadExecutionDetails() {
    const data = {
      moduleId: this.moduleId,
      schemaId: this.schemaId,
      runId: this.schemaInfo.runId,
      requestStatus: this.activeTab,
      executionTreeHierarchy: this.executionTreeHierarchy && this.executionTreeHierarchy.nodeId ? this.executionTreeHierarchy : null,
      variantId: this.variantId
    }

    this.matDialog.open(DownloadExecutionDataComponent, {
      width: '600px',
      data
    });
  }

  /**
   *
   * @param fldid editable field id
   * @param row entire row should be here
   */
  editCurrentCell(fldid: string, row: any, rIndex: number, containerRef: ContainerRefDirective) {
    console.log(fldid);
    console.log(row);

    if (this.activeNode && this.activeNode.nodeId !== this.metadataFldLst[fldid].nodeId || this.activeTab === 'outdated' || this.activeTab === 'skipped') {
      return;
    }

    const field = this.selectedFields.find(f => f.fieldId === fldid);
    if (field && !field.isEditable) {
      console.log('Edit is disabled for this field ! ', fldid);
      return;
    }

    if (document.getElementById('inpctrl_' + fldid + '_' + rIndex)) {
      const inpCtrl = document.getElementById('inpctrl_' + fldid + '_' + rIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_' + fldid + '_' + rIndex) as HTMLSpanElement;
      // const inpValCtrl = document.getElementById('inp_'+ fldid + '_' + rIndex) as HTMLInputElement;

      // add a dynamic cell input component
      this.addDynamicInput(fldid, row, rIndex, containerRef);
      inpCtrl.style.display = 'block';
      // inpValCtrl.focus();
      viewCtrl.style.display = 'none';

      this.fieldsInUpdate = this.fieldsInUpdate.filter(x => !(x.fldId === fldid && x.rIndex === rIndex));
    }
  }

  isEditEnabled(fldid: string, row: any, rIndex: number) {
    const field = this.selectedFields.find(f => f.fieldId === fldid);
    if (field && !field.isEditable) {
      return false;
    }

    const el = document.getElementById('inpctrl_' + fldid + '_' + rIndex);

    if (el) {
      const inpCtrl = document.getElementById('inpctrl_' + fldid + '_' + rIndex) as HTMLDivElement;
      if (inpCtrl.style.display === 'block') {
        return true;
      }
    }

    return false;
  }

  isFieldEditable(fldid) {
    const field = this.selectedFields.find(f => f.fieldId === fldid);
    if (field && this.activeNode.nodeId === field.nodeId && field.isEditable && !(this.activeTab === 'outdated') && !(this.activeTab === 'skipped')) {
      return true;
    }

    return false;
  }

  /**
   * After value change on & also call service for do correction
   * @param fldid fieldid that have blur triggered
   * @param value current changed value
   * @param row row data ..
   */
  emitEditBlurChng(fldid: string, value: any, row: any, rIndex: number, viewContainerRef?: ViewContainerRef) {
    delete row.___data.editing;
    this.activeCellPosition(fldid, rIndex);
    let code = value;

    if (typeof value === 'object') {
      code = value.CODE;
      value = value.TEXT;
    }
    if(row[fldid]) {
      row[fldid].newFieldData = code;
    }
    console.log(value);

    if (document.getElementById('inpctrl_' + fldid + '_' + rIndex)) {

      // DOM control after value change ...
      const inpCtrl = document.getElementById('inpctrl_' + fldid + '_' + rIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_' + fldid + '_' + rIndex) as HTMLSpanElement;

      // clear the dynamic cell input component
      viewContainerRef.clear();

      inpCtrl.style.display = 'none';
      viewCtrl.innerText = value !== 'undefined' ? value : '';
      viewCtrl.style.display = 'block';

      // DO correction call for data
      const objctNumber = row.OBJECTNUMBER.fieldData;
      const oldVal = row[fldid] ? row[fldid].fieldData : '';
      if (objctNumber && oldVal !== value) {
        const request: SchemaCorrectionReq = { id: [objctNumber], fldId: fldid, vc: code, vt: value, isReviewed: null } as SchemaCorrectionReq;

        if (this.nodeType === 'GRID') {
          request.gridId = this.nodeId;
        } else if (this.nodeType === 'HEIRARCHY') {
          request.heirerchyId = this.nodeId;
        }

        // get the rowsno ...
        if (this.nodeType === 'GRID' || this.nodeType === 'HEIRARCHY') {
          request.rowSno = row.objnr ? row.objnr.fieldData : '';
        }
        this.setBadgeState(fldid, row, BadgeStatus.PENDING);
        this.populateData([row]);
        this.requestStatus = BadgeStatus.PENDING;

        // validate the cell data before call actual do correction ... api
        this.dataSource.updateDoc(objctNumber,fldid, value, code, this.nodeType.toLocaleLowerCase(), request.gridId, request.heirerchyId, request.rowSno);
        // set the value to cell
        if (row[fldid]?.fieldData) {
          row[fldid].fieldData = value;
        }
        const doc = this.dataSource.getRow(objctNumber);
        forkJoin([this.schemaDetailService.validateCell(this.moduleId, this.schemaId, doc,fldid, request.rowSno)]).toPromise().then(r=>{
          if(r[0] && r[0].status === 'SUCCESS') {
            const sub = this.schemaDetailService.doCorrection(this.schemaId, request).subscribe(res => {
              this.requestStatus = BadgeStatus.SUCCESS;
              this.setBadgeState(fldid, row, BadgeStatus.SUCCESS);
              this.removeBadgeState(fldid, row);

              if (row[fldid]?.fieldData) {
                row[fldid].fieldData = value;
              } else {
                row[fldid] = {fieldData:value};
              }

              if (res.acknowledge) {
                this.statics.correctedCnt = res.count ? res.count : 0;
                this.getSchemaStatics(false);
              }
              // reset the error message ...
              try{
                row[fldid].errorMsg = '';
                row[fldid].isInError = false;
              } catch(e){console.error(`Error while reset the error message : ${e}`)}
            }, error => {
              this.requestStatus = BadgeStatus.ERROR;
              this.transientService.open(`Error :: ${error}`, 'Close', { duration: 2000 });
              console.error(`Error :: ${error.message}`);
            });
            this.subscribers.push(sub);
          } else {
            this.requestStatus = BadgeStatus.ERROR;
            this.setBadgeState(fldid, row, BadgeStatus.ERROR);
            this.removeBadgeState(fldid, row);
            row[fldid].isInError = true;
            row[fldid].isCorrected = false;
            row[fldid].errorMsg = r[0] && r[0].allFieldsLogs && r[0].allFieldsLogs[0] && r[0].allFieldsLogs[0].errMsg ? r[0].allFieldsLogs[0].errMsg : 'Something went wrong';
            console.log('Log the execption on cell');
          }

        }).catch(err => {
          console.log(`Exception : ${err}`);
          this.setBadgeState(fldid, row, BadgeStatus.ERROR);
          this.removeBadgeState(fldid, row);
          this.requestStatus = BadgeStatus.ERROR;
          if (row[fldid]?.fieldData) {
            row[fldid].fieldData = value;
          }
          if (row[fldid]) {
            row[fldid].errorMsg = err?.error?.message || 'Something went wrong';
          } else {
            row[fldid].errorMsg = err?.error?.message || 'Something went wrong';
          }
          try{
            row[fldid].isInError = true;
            row[fldid].isCorrected = false;
          } catch(e){console.error(`Error while reset the error message : ${e}`)}
        }).finally(() => {
          console.log('Done !!!');
        });
      } else {
        console.error(`Wrong with object number or can't change if old and new same... `);
      }
    }

  }

  setBadgeState(fldId, row, badge: BadgeStatus) {
    let badgeFld = this.fieldsInUpdate.find(x => (x.fldId === fldId && x.row === row));
    if(!badgeFld) {
      badgeFld = {row, fldId, badge};
      this.fieldsInUpdate.push(badgeFld);
      if(this.fieldsInUpdate.length > 5) {
        this.fieldsInUpdate.splice(0, 1);
      }
    } else {
      badgeFld.badge = badge;
    }
    this.populateData([row]);
  }

  removeBadgeState(fldId, row) {
    setTimeout(() => {
      const badgeIndex = this.fieldsInUpdate.findIndex(data => data.row === row && data.fldId === fldId);
      if(badgeIndex > -1) {
        this.fieldsInUpdate.splice(badgeIndex, 1);
        this.populateData([row]);
      }
    }, 2000);
  }


  /**
   * After value change on text input
   * @param value current value after change on
   */
  inlineSearch(value: string) {
    const filterCValue = this.filterCriteria.getValue() ? this.filterCriteria.getValue() : [];
    const haveInline = filterCValue.filter(fil => fil.fieldId === 'id')[0];
    if (value && value.trim() !== '') {
      if (haveInline) {
        const idx = filterCValue.indexOf(haveInline);
        filterCValue.splice(idx, 1);
        haveInline.values = [value];
        filterCValue.push(haveInline);
      } else {
        const filterC = new FilterCriteria();
        filterC.fieldId = 'id';
        filterC.type = 'INLINE';
        filterC.values = [value];
        filterCValue.push(filterC);
      }
    } else {
      const idx = filterCValue.indexOf(haveInline);
      filterCValue.splice(idx, 1);
    }
    this.filterCriteria.next(filterCValue);
  }

  // @HostListener('window:scroll', ['$event'])
  onTableScroll(e) {
    console.log('colled');
    const tableViewHeight = e.target.offsetHeight // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit) {
      if (!this.scrollLimitReached) {
        console.log('Load more data here ...');
        this.scrollLimitReached = true;
        this.getData(this.filterCriteria.getValue(), this.sortOrder, this.dataSource.fetchCount, true, false);
      }
    } else {
      this.scrollLimitReached = false;
    }
  }

  /**
   * Manage columns based on status change
   */
  manageStaticColumns() {
    let dispCols: string[] = [];
    if (this.activeTab === 'success' || this.activeTab === 'error') {
      dispCols = ['_select_columns', '_assigned_buckets', '_score_weightage', 'OBJECTNUMBER'];
      this.tableHeaderActBtn = [];
    } else {
      dispCols = ['_select_columns', '_assigned_buckets', '_row_actions', 'OBJECTNUMBER'];
    }
    this.startColumns = dispCols;
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.docLength();
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.docValue().forEach(row => this.selection.select(row));
  }


  /**
   *
   * @param type type of request is inline or submit all
   * @param row if request  type is inline then submit single rec..
   */
  approveRecords(type: string, row?: any) {
    const id: string[] = [];
    if (type === 'inline') {
      const docId = row ? row.OBJECTNUMBER.fieldData : '';
      if (docId) {
        id.push(docId);
      }
    } else {
      if (this.selection.selected.length) {
        const selected = this.selection.selected.filter(sel => !sel.OBJECTNUMBER.isReviewed);
        selected.forEach(sel => {
          const docId = sel.OBJECTNUMBER.fieldData;
          id.push(docId);
        });

      }
    }
    const sub = this.schemaDetailService.approveCorrectedRecords(this.schemaId, id, this.userDetails.currentRoleId).subscribe(res => {
      if (res === true) {
        this.dataSource.setDocValue([]);
        this.getData();
        this.selection.clear();
        this.transientService.open('Correction is approved', 'Okay', { duration: 2000 });
        this.getSchemaStatics(false);
      }
    }, error => {
      this.transientService.open(`${error?.error?.message}`, 'Close', { duration: 2000 });
      console.error(`Error :: ${error.message}`);
    });
    this.subscribers.push(sub);
  }

  /**
   * Reset schema corrected records ..
   * @param row which are going to reset ..
   * @param type from where ..
   */
  resetRec(row: any, type: string) {
    const id: string[] = [];
    if (type === 'inline') {
      const docId = row ? row.OBJECTNUMBER.fieldData : '';
      if (docId) {
        id.push(docId);
      }
    } else {
      if (this.selection.selected.length) {
        const selected = this.selection.selected.filter(sel => !sel.OBJECTNUMBER.isReviewed);
        selected.forEach(sel => {
          const docId = sel.OBJECTNUMBER.fieldData;
          id.push(docId);
        });

      }
    }
    const sub = this.schemaDetailService.resetCorrectionRecords(this.schemaId, this.schemaInfo.runId, id).subscribe(res => {
      if (res && res.acknowledge) {
        this.transientService.open('Correction is rejected', 'Okay', { duration: 2000 });
        this.statics.correctedCnt = res.count ? res.count : 0;
        this.dataSource.setDocValue([]);
        this.getData();
        this.getSchemaStatics(false);
        this.selection.clear();
      }
    }, error => {
      this.transientService.open(`Error :: ${error}`, 'Close', { duration: 2000 });
      console.error(`Error :: ${error.message}`);
    });
    this.subscribers.push(sub);

  }


  /**
   * Make control for prepare filter for ...
   * @param fld ready for applied filter control
   */
  makeFilterControl(fld: AddFilterOutput) {
    console.log(fld);
    this.trigger.closeMenu();

    const exitingFilterCtrl = this.filterCriteria.getValue() ? this.filterCriteria.getValue() : [];
    const extFld = exitingFilterCtrl.filter(fil => fil.fieldId === fld.fldCtrl.fieldId)[0];

    const filterCtrl: FilterCriteria = new FilterCriteria();
    filterCtrl.fieldId = fld.fldCtrl.fieldId;
    filterCtrl.type = 'DROPDOWN';
    filterCtrl.filterCtrl = fld;
    filterCtrl.values = fld.selectedValues.map(map => map.CODE);

    if (extFld) {
      exitingFilterCtrl.splice(exitingFilterCtrl.indexOf(extFld), 1);
    }
    exitingFilterCtrl.push(filterCtrl);
    this.filterCriteria.next(exitingFilterCtrl);
  }

  /**
   * Preapare data to show as a labal ..
   * @param ctrl get filter control and prepare data for view
   */
  prepareTextToShow(ctrl: FilterCriteria): string {
    const selCtrl = ctrl.filterCtrl?.selectedValues.filter(fil => fil.FIELDNAME === ctrl.fieldId);
    if (selCtrl && selCtrl.length > 1) {
      const fld = this.filterCriteria.getValue().filter(fil => fil.fieldId === ctrl.fieldId);
      if (fld && fld.length > 0) {
        const sel = fld[0].filterCtrl?.selectedValues.filter(f => f.FIELDNAME === ctrl.fieldId);
        return String(sel.length);
      }
    }
    return ((selCtrl && selCtrl.length === 1) ? (selCtrl[0].TEXT ? selCtrl[0].TEXT : selCtrl[0].CODE) : 'Unknown');
  }

  /**
   * Remove applied filter ..
   * @param ctrl control for remove applied filter
   */
  removeAppliedFilter(ctrl: FilterCriteria) {
    const exitingFilterCtrl = this.filterCriteria.getValue() ? this.filterCriteria.getValue() : [];
    const extFld = exitingFilterCtrl.filter(fil => fil.fieldId === ctrl.fieldId)[0];
    if (extFld) {
      exitingFilterCtrl.splice(exitingFilterCtrl.indexOf(extFld), 1);
      this.filterCriteria.next(exitingFilterCtrl);
    }
  }

  /**
   * Set selected drop requet .. for load values ..
   * @param fldC get cliked fld control
   */
  loadDropValues(fldC: FilterCriteria) {
    if (fldC) {
      const dropArray: DropDownValue[] = [];
      fldC.values.forEach(val => {
        const drop: DropDownValue = { CODE: val, FIELDNAME: fldC.fieldId } as DropDownValue;
        dropArray.push(drop);
      });
      this.loadDopValuesFor = { fieldId: fldC.fieldId, checkedValue: dropArray };
    }
  }

  /**
   * Open dialog for save applied filters ..
   */
  opnDialogSaveVariant() {
    const ref = this.matDialog.open(SaveVariantDialogComponent, {
      width: '600px',
      height: '450px',
      data: { schemaInfo: this.schemaInfo, variantId: this.variantId, moduleId: this.moduleId, filterData: this.filterCriteria.getValue() }
    });

    ref.afterClosed().subscribe(res => {
      console.log(res);
    });
  }

  /**
   * Reset applied filter
   */
  resetAppliedFilter() {
    this.appliedBrList = [];
    this.filterCriteria.next([]);
    this.preInpVal = '';
    this.searchFrmCtrl.setValue('');
    this.refreshBrRuleFilterDesc();
  }

  /**
   * Updated selected drop values ...
   * @param dropValue updated dropvalues
   */
  updateFilterCriteria(dropValue: DropDownValue[]) {
    console.log(dropValue);
    const fillData = this.filterCriteria.getValue() ? this.filterCriteria.getValue() : [];
    const filterControl = fillData.filter(fill => fill.fieldId === this.loadDopValuesFor.fieldId)[0];
    if (filterControl) {
      if (dropValue && dropValue.length > 0) {
        filterControl.values = dropValue.map(map => map.CODE);
        filterControl.filterCtrl = { fldCtrl: filterControl.filterCtrl.fldCtrl, selectedValues: dropValue };
      } else {
        fillData.slice(fillData.indexOf(filterControl), 1);
      }
      this.filterCriteria.next(fillData);
    }

  }

  variantChange(variantId) {
    if (this.variantId !== variantId) {
      this.variantId = variantId;

      const scope = this.dataScope.find(v => v.variantId === this.variantId);
      if (scope) {
        this.variantName = scope?.variantName;
        this.variantTotalCnt = scope?.dataScopeCount;
      } else {
        this.variantName = 'Entire dataset';
        this.variantTotalCnt = this.totalVariantsCnt;
      }
      if (this.variantId !== '0') {
        this.getVariantDetails();
      } else {
        this.filterCriteria.next([]);
      }
    } else if (this.variantId === '0') {
      this.variantTotalCnt = this.totalVariantsCnt;
      this.variantName = 'Entire dataset';
    }
  }

  /**
   * get input type when user edits a cell
   * @param fieldId the field id
   */
  getFieldInputType(fieldId) {

    if (this.metadataFldLst[fieldId] && this.metadataFldLst[fieldId].picklist === '0' && this.metadataFldLst[fieldId].dataType === 'NUMC') {
      return this.FIELD_TYPE.NUMBER;
    }
    if (this.metadataFldLst[fieldId] && this.metadataFldLst[fieldId].picklist === '0' && (this.metadataFldLst[fieldId].dataType === 'DATS' || this.metadataFldLst[fieldId].dataType === 'DTMS')) {
      return this.FIELD_TYPE.DATE;
    }

    if (this.metadataFldLst[fieldId] && (this.metadataFldLst[fieldId].picklist === '1' || this.metadataFldLst[fieldId].picklist === '30' || this.metadataFldLst[fieldId].picklist === '37')) {
      if (this.metadataFldLst[fieldId].isCheckList === 'true') {
        return this.FIELD_TYPE.MULTI_SELECT;
      } else {
        return this.FIELD_TYPE.SINGLE_SELECT;
      }
    }

    return this.FIELD_TYPE.TEXT;

  }


  /**
   * format cell displayed value based on field type...
   * @param fieldId the field id
   * @param value cell value
   */
  formatCellData(fieldId, value) {
    value = !value || value === 'null' ? '' : value;
    if (this.getFieldInputType(fieldId) === this.FIELD_TYPE.MULTI_SELECT) {
      // console.log(value);
      return value.toString();
    }
    return value;
  }

  getParentVal(fldid: string, row: any) {
    const res = [];
    const field = this.selectedFields.find(f => f.fieldId === fldid);

    if (field && field.parentField && field.parentField.length) {
      field.parentField.forEach(fld => {
        const resObj = {
          parentfieldId: fld,
          value: row[fld]?.fieldCode || ''
        };
        res.push(resObj);
      });
    }

    return res;
  }

  addDynamicInput(fldid: string, row: any, rIndex: number, containerRef: ContainerRefDirective) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      TableCellInputComponent
    );

    row.___data.editing = fldid;
    // add the input component to the cell
    const componentRef = containerRef.viewContainerRef.createComponent(componentFactory);
    const viewCtrl = document.querySelector(`#viewctrl_${fldid}_${rIndex}`) as HTMLElement;
    componentRef.instance.fieldHeight = viewCtrl?.offsetHeight || 34;
    // binding dynamic component inputs/outputs
    componentRef.instance.fieldId = fldid;
    componentRef.instance.inputType = this.getFieldInputType(fldid);
    componentRef.instance.parentFldValues = this.getParentVal(fldid, row);

    this.tableContainer.nativeElement.onscroll = () => {
      componentRef.instance.inputAutoCompleteEl.closePanel();
      componentRef.instance.input.nativeElement.blur();
    };

    // componentRef.instance.value =  this.activeTab !== 'review' ?( row[fldid] ? row[fldid].fieldData : '') : ( row[fldid] && row[fldid].oldData ? row[fldid].oldData : (row[fldid] && row[fldid].fieldData ?row[fldid].fieldData: ''));
    componentRef.instance.value = this.activeTab !== 'review' ? (row[fldid] ? row[fldid].newFieldData ?? row[fldid].fieldData : '') : (row[fldid] ? row[fldid].newFieldData ?? row[fldid].fieldData : (row[fldid] && row[fldid].oldData ? row[fldid].oldData : ''));
    // componentRef.instance.value =  row[fldid] ? row[fldid].fieldData : '';
    componentRef.instance.inputBlur.subscribe(value => this.emitEditBlurChng(fldid, value, row, rIndex, containerRef.viewContainerRef));

  }

  /**
   * Get data scopes .. or variants ...
   */
  getDataScope(activeVariantId?: string, loading = true) {
    this.setLoading({
      getDataScope: loading
    });
    const body = {
      from: 0,
      size: 10,
      variantName: null
    };
    const observable = this.schemaVariantService.getDataScopesList(this.schemaId, 'RUNFOR', body);
    const sub = observable.subscribe(res => {
      this.dataScope = res;
      this.currentDatascopePageNo = 0;
      if (activeVariantId) {
        this.variantChange(activeVariantId);
      }
      this.setLoading({
        getDataScope: false
      });
    }, (error) => {
      this.setLoading({
        getDataScope: false
      });
      console.error(`Something went wrong while getting variants. : ${error.message}`);
    });
    this.subscribers.push(sub);

    return observable;
  }

  updateDataScopeList() {
    const pageNo = this.currentDatascopePageNo + 1;
    const body = {
      from: pageNo,
      size: 10,
      variantName: null
    };

    const sub = this.schemaVariantService.getDataScopesList(this.schemaId, 'RUNFOR', body).subscribe(res => {
      if (res && res.length) {
        this.dataScope = [...this.dataScope, ...res];
        this.currentDatascopePageNo = pageNo;
      }
    }, (error) => console.error(`Something went wrong while getting variants. : ${error.message}`));
    this.subscribers.push(sub);
  }

  /**
   * Function to open data scope side sheet
   */
  openDataScopeSideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/data-scope/${this.moduleId}/${this.schemaId}/new/sb` } }], { queryParamsHandling: 'preserve' })
  }

  /**
   * Function to open summary side sheet of schema
   */
  openSummarySideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}` } }], { queryParamsHandling: 'preserve' })
  }

  /**
   * Function to open trend execution side sheet
   */
  openExecutionTrendSideSheet() {
    this.router.navigate(['', { outlets: { sb: `sb/schema/execution-trend/${this.moduleId}/${this.schemaId}/${this.variantId}` } }], { queryParamsHandling: 'preserve' })
  }

  /**
   * Funcation to open chat execution side sheet
   */
  openCollaboration() {
    this.showChats = !this.showChats;
    // this.router.navigate(['', { outlets: { sb: `sb/schema/comments/${this.moduleId}/${this.schemaId}/${this.variantId}` } }], { queryParamsHandling: 'preserve' })
  }

  /**
   * get already saved schema actions
   */
  getSchemaTableActions() {
    const sub = this.schemaDetailService.getTableActionsBySchemaId(this.schemaId).subscribe(actions => {
      console.log(actions);
      if (actions && actions.length) {
        this.tableActionsList = actions;
        this.refreshActions();
      }
    });
    this.subscribers.push(sub);
  }

  refreshActions() {
    this.primaryActions = this.tableActionsList.filter(action => action.isPrimaryAction);
    this.secondaryActions = this.tableActionsList.filter(action => !action.isPrimaryAction);
  }

  doAction(action: SchemaTableAction, element) {
    console.log('Action selected ', action);
    if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE && (this.isReviewer || this.isApprover || this.isAdmin)) {
      this.approveRecords('inline', element);
    } else if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.REJECT && (this.isReviewer || this.isApprover || this.isAdmin)) {
      this.resetRec(element, 'inline');
    } else {
      this.generateCrossEntry(element, action.refBrId);
    }
  }

  /**
   * check if the user is allowed to make an action
   * @param action action to be performed
   */
  hasActionPermission(action: SchemaTableAction) {
    if (action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE) {
      return this.isReviewer || this.isApprover || this.isAdmin;
    }

    if (action.actionCode === STANDARD_TABLE_ACTIONS.REJECT) {
      return this.isReviewer || this.isApprover || this.isAdmin;
    }

    return true;

  }

  /**
   * Help to generate / create cross module ..
   * @param row get selected row data
   */
  generateCrossEntry(row: any, crossbrId?) {
    const tragetFld = this.dataSource.targetField;
    if (!tragetFld) {
      throw new Error('Tragetfield cant be null or empty ');
    }
    const objNr = row && row.OBJECTNUMBER ? row.OBJECTNUMBER.fieldData : '';
    if (!objNr) {
      throw new Error(`Objectnumber must be required !!!`);
    }
    const sub = this.schemaDetailService.generateCrossEntry(this.schemaId, this.moduleId, objNr, crossbrId || '').subscribe(res => {
      if (res) {
        const oldData = this.dataSource.docValue();
        const sameDoc = oldData.filter(fil => (fil as any).OBJECTNUMBER.fieldData === objNr)[0];
        if (sameDoc[tragetFld]) {
          sameDoc[tragetFld].fieldData = res;
        } else {
          sameDoc[tragetFld] = { fieldData: res, fieldDesc: '', fieldId: tragetFld };
        }

        this.dataSource.setDocValue(oldData);

        // put into correction tab
        const request: SchemaCorrectionReq = { id: [objNr], fldId: tragetFld, vc: res, isReviewed: null } as SchemaCorrectionReq;
        const doCorrectionRequest = this.schemaDetailService.doCorrection(this.schemaId, request).subscribe(r => {
          if (r.acknowledge) {
            this.statics.correctedCnt = r.count ? r.count : 0;
          }
        }, error => {
          this.transientService.open(`Something went wrong `, 'Close', { duration: 2000 });
          console.error(`Error :: ${error.message}`);
        });
        this.subscribers.push(doCorrectionRequest);
      } else {
        this.transientService.open(`Something went wrong `, 'Close', { duration: 2000 });
      }
    }, error => { console.error(`Exception while generating coss module .. ${error.message}`) });
    this.subscribers.push(sub);
  }

  /**
   * Open side sheet for upload corrected data in correction index ..
   */
  uploadCorrectedData() {
    this.router.navigate([{ outlets: { sb: `sb/schema/upload-data/${this.moduleId}/${this.outlet}` } }], { queryParams: { importcorrectedRec: true, schemaId: this.schemaId, runid: this.schemaInfo.runId } });
  }

  /**
   * Opens files in local system for uploading csv
   */
  uploadCorrectedDataCsv() {
    if (document.getElementById('uploadFileCtrl')) {
      document.getElementById('uploadFileCtrl').click();
    }

    return true;
  }

  /**
   * function to toggle the icon
   * and emit the toggle event
   */
  toggleSideBar() {
    if (this.arrowIcon === 'chevron-left') {
      this.arrowIcon = 'chevron-right';
      this.widthOfSchemaNav = 0;
    }
    else {
      this.arrowIcon = 'chevron-left';
      this.widthOfSchemaNav = 246;
    }
  }

  public setNavDivPositions() {
    const { left, top } = this.navscroll.nativeElement.getBoundingClientRect();
    this.boxPosition = { left, top };
  }

  public setStatus(event: MouseEvent, status: number) {
    console.log(event, status)
    if (status === 1) event.stopPropagation();
    else this.setNavDivPositions();
    this.status = status;
  }

  public enableResize() {
    const sidebar = document.getElementById('navscroll')
    const grabberElement = document.createElement('div');
    grabberElement.style.height = '100%';
    grabberElement.style.width = '2px';
    grabberElement.style.backgroundColor = '#ffffff';
    grabberElement.style.position = 'absolute';
    grabberElement.style.cursor = 'col-resize';
    grabberElement.style.resize = 'horizontal';
    grabberElement.style.overflow = 'auto';
    grabberElement.style.right = '0%';

    grabberElement.addEventListener('mousedown', () => {
      this.grab = true;
      sidebar.style.cursor = 'col-resize';
    });

    grabberElement.addEventListener('mouseup', () => {
      this.grab = false;
      sidebar.style.cursor = 'default';
    });

    sidebar.addEventListener('mouseup', () => {
      this.grab = false;
      sidebar.style.cursor = 'default';
      grabberElement.style.backgroundColor = '#fff';
    });

    document.addEventListener('mouseup', () => {
      if (this.grab) {
        this.grab = false;
        sidebar.style.cursor = 'default';
      }
    })

    document.addEventListener('mousemove', (e) => {
      if (this.grab) {
        this.mousePosition = { x: e.clientX, y: e.clientY };
        if (this.status === SchemaNavGrab.RESIZE) {
          this.navscroll.nativeElement.style.cursor = 'col-resize';
        } else {
          this.navscroll.nativeElement.style.cursor = 'default';
        }

        const maxWidth = this.listingContainer.nativeElement.clientWidth / 3;
        this.widthOfSchemaNav = Number(this.mousePosition.x > this.boxPosition.left) ?
          Number(this.mousePosition.x - this.boxPosition.left < maxWidth) ?
            this.mousePosition.x - this.boxPosition.left : maxWidth : 0;
        this.widthOfSchemaNav < 30 ? this.arrowIcon = 'chevron-right' : this.arrowIcon = 'chevron-left';
      }
    });

    this.navscroll.nativeElement.prepend(grabberElement);

  }

  /**
   * uploads csv file
   * @param evt file event
   */
  fileChange(evt: Event) {
    const validResponse = this.checkForValidFile(evt);
    if (validResponse.file) {
      const activeNodeId = this.activeNode.nodeId || 'header';
      const activeNodeType = this.activeNode.nodeType || 'HEADER';
      const moduleDesc = this.moduleInfo.moduleDesc ? `${this.moduleInfo.moduleDesc} Number` : '';
      this.schemaDetailService.uploadCsvFileData(validResponse.file, this.schemaId, activeNodeId, activeNodeType, '', moduleDesc)
        .subscribe(res => {
          this.transientService.open(`Successfully Imported`, 'Close', { duration: 2000 });
          if (res) {
            this.isFileUploading = true;
          }
        }, error => {
          console.log(`Error:: ${error.message}`);
        });
    } else {
      const errMsg = validResponse.errMsg || 'Unable to upload file';
      this.transientService.open(`Error :: ${errMsg}`, 'Close', { duration: 2000 });
      console.error(`Error :: ${errMsg}`);
    }
  }

  /**
   * Validates for valid csv file and file size limit
   * @param evt file event
   * @returns returns file or error message
   */
  checkForValidFile(evt: Event) {
    const res = {
      errMsg: '',
      file: null
    };
    if (evt !== undefined) {
      const target: DataTransfer = (evt.target) as unknown as DataTransfer;
      if (target.files.length !== 1) {
        res.errMsg = 'Cannot use multiple files';
      }
      // check file type
      let fileName = '';
      try {
        fileName = target.files[0].name;
      } catch (ex) {
        console.error(ex)
      }
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        // check size of file
        const size = target.files[0].size;

        const sizeKb = Math.round((size / 1024));
        if (sizeKb > (10 * 1024)) {
          res.errMsg = `File size too large , upload less then 10 MB`;
        }
        res.file = target.files[0];
      } else {
        res.errMsg = `Unsupported file format, allowed file formats are .xlsx, .xls and .csv`;
      }
    }

    return res;
  }

  /**
   * Closes file upload progress screen along with a toast message
   * @param msg output message from upload progress screen
   */
  fileUploaded(msg) {
    this.isFileUploading = false;
    if (msg) {
      this.transientService.open(msg, 'Okay', { duration: 2000 });
    }
  }

  onRunCompleted($event) {
    delete this.statics;
    this.runCompleted.emit($event);
    this.getSchemaStatics(true);
  }

  /**
   * get module info based on module id
   * @param id module id
   */
  getModuleInfo(id, loading = false) {
    this.setLoading({
      getModuleInfo: loading
    });
    const obsv = this.coreService.searchAllObjectType({lang: this.locale,fetchsize: 1,fetchcount: 0,description: ''},[id]);
    const sub = obsv.subscribe(res => {
      if (res && res.length) {
        this.moduleInfo = res[0];
      }
      this.getDataScope(this.schemaInfo?.variantId);
      this.setLoading({
        getModuleInfo: false
      });
    }, error => {
      this.setLoading({
        getModuleInfo: false
      });
      console.log(`Error:: ${error.message}`)
    });
    this.subscribers.push(sub);
    return obsv;
  }

  getEntireDatasetCount() {
    this.totalVariantsCnt = 0;
    this.schemaService.getDataScopeCount(this.moduleId, []).subscribe((res) => {
      this.totalVariantsCnt = res;
    });
  }

  /**
   * Navigate the detail page based on node clicked ....
   * @param node selected / clicked node details
   */
  loadNodeData(node: SchemaExecutionTree) {

    if (node.nodeId === this.activeNode.nodeId) {
      console.log('Already active');
      return;
    }
    this.activeNode = node;
    console.log(node);
    this.router.navigate([], {
      relativeTo: this.activatedRouter,
      queryParams: {
        node: node.nodeId,
        'node-level': node.nodeType
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }
  /**
   * Enable collapsiable icon ...
   * @param col column ...
   * @returns will return true  or false
   */
  enableIcon(col: string): boolean {
    let found = false;
    if (this.columns.header && (this.columns.header.indexOf(col) === this.columns.header.length - 1)) {
      found = true;
    }
    return found && (this.nodeId !== 'header');
  }
  /**
   * Manage column collapsiable or expandable ..
   * @param evt events
   * @param state state will be open || close based on that manage columns
   * @param fld operation on this field...
   */
  doColumnsCollapsible(evt, state: string, fld: string) {
    if (state === 'open') {

      switch (fld) {
        case '___header__collapsible':
          const __header_coll_indx = this.displayedFields.getValue().indexOf('___header__collapsible');
          const array = this.displayedFields.getValue().splice(0, __header_coll_indx);
          array.push(...this.columns.header);
          if (this.nodeId !== 'header') {
            array.push(...this.columns[this.nodeId]);
          }
          this.displayedFields.next(array);
          break;

        case '___grid__collapsible':
          const __grid_coll_indx = this.displayedFields.getValue().indexOf('___grid__collapsible');
          const grid_array = this.displayedFields.getValue().splice(0, __grid_coll_indx);
          grid_array.push(...this.columns[this.nodeId]);
          this.displayedFields.next(grid_array);
          break;

        case '___hierarchy__collapsible':
          const __hie_coll_indx = this.displayedFields.getValue().indexOf('___hierarchy__collapsible');
          const hie_array = this.displayedFields.getValue().splice(0, __hie_coll_indx);
          hie_array.push(...this.columns[this.nodeId]);
          this.displayedFields.next(hie_array);
          break;

      }

    } else if (state === 'close') {
      const objNrIdx = this.displayedFields.getValue().indexOf('OBJECTNUMBER');
      const array = this.displayedFields.getValue().splice(0, objNrIdx + 1);
      let keyFor = null;
      for (const cl in this.columns) {
        if (this.columns[cl].indexOf(fld) !== -1) {
          keyFor = cl;
          break;
        }
      }
      if (keyFor === 'header') {
        array.push('___header__collapsible');
        console.log(this.columns[this.nodeId]);
        if (this.nodeId !== 'header') {
          array.push(...this.columns[this.nodeId]);
        }
      } else if (keyFor !== null && this.nodeType === 'GRID') {
        array.push(...this.columns.header);
        array.push('___grid__collapsible');
      } else if (keyFor !== null && this.nodeType === 'HEIRARCHY') {
        array.push(...this.columns.header);
        array.push('___hierarchy__collapsible');
      }
      console.log(array)
      this.displayedFields.next(array);
    }
  }
  /**
   * Update the selected columns ... based on selected node
   * @param nodeId selected node id ...
   * @param nodeType selected node type ...
   */
  updateColumnBasedOnNodeSelection(nodeId: string, nodeType: string, reload = false) {
    const nodeIds = this.getNodeParentsHierarchy(this.activeNode);
    const sub = this.schemaListService.getSchemaDetailsBySchemaId(this.schemaId).subscribe((resp) => {
      const currentVariantId = (resp && resp.variantId) ? resp.variantId : '0';
      const sub1 = this.schemaDetailService.getSelectedFieldsByNodeIds(this.schemaId, currentVariantId, nodeIds.reverse())
        .subscribe(res => {
          const allFields = [];
          let updateTableView = false;
          this.columns = {};
          const metadata = this.metadata.getValue();
          if (res && res.length) {
            res.forEach(node => {
              if (node.fieldsList && node.fieldsList.length) {
                this.columns[node.nodeId] = [];
                node.fieldsList = node.fieldsList.sort((a, b) => a.order - b.order);
                node.fieldsList.forEach(f => {
                  if (!allFields.find(fld => fld.fieldId === f.fieldId)) {
                    allFields.push(f);
                    this.columns[node.nodeId].push(f.fieldId);
                  }
                });
              } else {
                let fields = [];
                const nType = this.getNodeTypeById(node.nodeId);
                if (nType === 'HEIRARCHY') {
                  if (metadata && metadata.hierarchyFields && metadata.hierarchyFields.hasOwnProperty(node.nodeId)) {
                    fields = Object.keys(metadata.hierarchyFields[node.nodeId]).slice(0, 10);
                    this.columns[node.nodeId] = fields;
                    fields.forEach((f, index) => {
                      const fldMap = new SchemaTableViewFldMap();
                      fldMap.fieldId = f;
                      fldMap.order = index;
                      fldMap.nodeId = node.nodeId;
                      fldMap.nodeType = nType;
                      allFields.push(fldMap);
                    });
                    updateTableView = true;
                  }
                } else if (nType === 'GRID') {
                  if (metadata && metadata.gridFields && metadata.gridFields.hasOwnProperty(node.nodeId)) {
                    fields = Object.keys(metadata.gridFields[node.nodeId]).slice(0, 10);
                    this.columns[node.nodeId] = fields;
                    fields.forEach((f, index) => {
                      const fldMap = new SchemaTableViewFldMap();
                      fldMap.fieldId = f;
                      fldMap.order = index;
                      fldMap.nodeId = node.nodeId;
                      fldMap.nodeType = nType;
                      allFields.push(fldMap);
                    });
                    updateTableView = true;
                  }
                } else if (nType === 'HEADER') {
                  if (metadata && metadata.headers) {
                    fields = Object.keys(metadata.headers).slice(0, 10);
                    this.columns[node.nodeId] = fields;
                    fields.forEach((f, index) => {
                      const fldMap = new SchemaTableViewFldMap();
                      fldMap.fieldId = f;
                      fldMap.order = index;
                      fldMap.nodeId = node.nodeId;
                      fldMap.nodeType = nType;
                      allFields.push(fldMap);
                    });
                    updateTableView = true;
                  }
                }
              }
            });
            this.selectedFields = allFields;
            this.selectedFields.map((x) => x.isEditable = true);
            this.updateEditableFields();
            this.selectedFieldsOb.next(updateTableView);
          };

          if(reload) {
            this.getData(this.filterCriteria.getValue(), this.sortOrder, 0, false, true, true);
          }
        }, error => {
          console.error(`Error:: ${error.message}`);
        });
      this.subscribers.push(sub1);
    });
    this.subscribers.push(sub);
  }

  getNodeTypeById(nodeId: string) {
    const treeArray = this.getExectionArray(this.executionTreeHierarchy);
    const nodeDetails = treeArray.find(n => n.nodeId === nodeId);
    return nodeDetails && nodeDetails.nodeType;
  }

  isHeaderColumn(dynCols) {
    return this.columns.header?.includes(dynCols);
  }

  /**
   * Get all the buisness rules ... based on schema last run ...
   */
  businessRulesBasedOnLastRun(searchString?: string) {
    const ruleslst = this.schemaService.getBuisnessRulesBasedOnRun(this.schemaId, searchString ? searchString : '').subscribe(res => {
      this.filterableRulesOb = of(res);
      this.brList = res;
      if(this.appliedBrList?.length && this.appliedBrList.find((br:any) => !br.brInfo)) {
        this.appliedBrList.forEach(br => {
          if(!br.brInfo) {
            const brDetail = res.find(item => item.brIdStr === br.brIdStr);
            br.brInfo = brDetail.brInfo
          }
        })
      };
      this.refreshBrRuleFilterDesc();
    }, err => console.error(`Exception : ${err.message}`));
    this.subscribers.push(ruleslst);
  }

  /**
   * Return all business rules based on search string ..
   * @param searchString get the business rule bt this text ...
   */
  searchBusinessRules(searchString: string) {
    this.delayedCall(searchString);
  }

  /**
   *
   * @param br buisness rule which going to select or deselect ....
   * @param state checkbox state ....
   */
  addFilterFromBrRule(br: CoreSchemaBrInfo, state: boolean) {
    if (state && !this.appliedBrList.some(s => s.brIdStr === br.brIdStr)) {
      this.appliedBrList.push(br);
    } else {
      this.appliedBrList.splice(this.appliedBrList.findIndex(f => f.brIdStr === br.brIdStr), 1);
    }
    this.refreshBrRuleFilterDesc();
  }

  /**
   * Check whether current business rule applied or not
   * @param ckbox the current business rule ...
   * @returns will return true if exits otherwise return false
   */
  isBrAppliedChecked(ckbox: CoreSchemaBrInfo): boolean {
    return this.appliedBrList.some(s => s.brIdStr === ckbox.brIdStr)
  }

  /**
   * Get the filtered applied description dynamic ...
   */
  refreshBrRuleFilterDesc() {
    this.brRuleFilterDesc = `${this.appliedBrList.length > 0 ? (this.appliedBrList.length === 1 ? this.appliedBrList[0].brInfo : this.appliedBrList.length) : 'All'}`;
  }

  /**
   * Apply the selected br rule filter...
   */
  applyFilterFromBrRule() {
    this.dataSource.fetchCount = 0;
    this.getData(this.filterCriteria.getValue(), this.sortOrder, 0, false);
    this.getSchemaExecutionTree(this.userDetails.plantCode, this.userDetails.userName);
    this.getSchemaStatics(false);
  }

  getBadgeState(fldid, row) {
    const badgeFld = this.fieldsInUpdate.find(x => (x.fldId === fldid && x.row === row));
    const state = badgeFld ? badgeFld.badge : null;
    return this.badgeService.getBadgeByStatus(state);
  }

  /**
   * Tocheck if the current cell is active
   * @param column column name
   * @param rowIndex row index
   * @returns boolean
   */
  isActive(column: string, rowIndex: number): boolean {
    if (column && rowIndex > -1 && this.activeCell) {
      return column === this.activeCell.column && rowIndex === this.activeCell.rowIndex;
    }

    return false;
  }

  /**
   * Hold the active cell position using column and row values
   * @param column column name
   * @param rowIndex row index
   */
  activeCellPosition(column: string, rowIndex: number): void {
    this.requestStatus = null;
    this.activeCell = { column, rowIndex };
  }

  modifyFilterCriteria(filterC) {

    const exitingF = this.filterCriteria.getValue();
    if(exitingF) {
      filterC.filters = filterC.filters || [];
      filterC.filters.forEach(f=>{
        const hasF = exitingF.find(ef=> ef.fieldId === f.fieldId);
        if(hasF) {
          hasF.values.push(...f.values);
          hasF.values = Array.from(new Set(hasF.values));

          hasF.filterCtrl.selectedValues.push(...f.selectedValues);
          hasF.filterCtrl.selectedValues = Array.from(new Set(hasF.filterCtrl.selectedValues));
        } else {
          exitingF.push(f);
        }
      });
      this.filterCriteria.next(exitingF);
    } else {
      this.filterCriteria.next(filterC.filters);
    }

    // for brs
    filterC.rule = filterC.rule || [];
    filterC.rule.forEach(f=>{
      if(!this.appliedBrList.find(fa=> fa.brId === f)) {
        const brInfo = {brId: f , brIdStr: f, brInfo: ''} as  CoreSchemaBrInfo;
        this.appliedBrList.push(brInfo);
      }
    });
    this.refreshBrRuleFilterDesc();
  }

  refreshUserMode() {
    this.isAdmin = this.schemaInfo?.collaboratorModels?.isAdmin || this.schemaInfo?.createdBy === this.userDetails?.userName;
    this.isEditer = this.schemaInfo
    && this.schemaInfo.collaboratorModels
    && this.schemaInfo.collaboratorModels.isEditer;
    this.isReviewer = this.schemaInfo
    && this.schemaInfo.collaboratorModels
    && this.schemaInfo.collaboratorModels.isReviewer;
    this.isApprover = this.schemaInfo
    && this.schemaInfo.collaboratorModels
    && (this.schemaInfo.collaboratorModels.isReviewer || this.schemaInfo.collaboratorModels.isApprover);
  }

  updateEditableFields() {
    this.displayedFields.getValue().forEach((field) => {
      this.editableFields[field] = this.isFieldEditable(field);
    });
  }

  populateData(list = this.dataSource.docValue()) {
    const processRow = (row) => {
      const badge: any = {};
      const formatted: any = {};
      this.selectedFields.forEach(fld => {
        badge[fld.fieldId] = this.getBadgeState(fld.fieldId, row);
        formatted[fld.fieldId]= {
          fieldData: row[fld.fieldId]?.fieldData? this.formatCellData(fld.fieldId, row[fld.fieldId].fieldData) : '',
          oldData: row[fld.fieldId]?.oldData ? this.formatCellData(fld.fieldId, row[fld.fieldId].oldData) : ''
        }
      });
      return {badge, formatted};
    };
    list.forEach((row: any) => {
      row.___data = {
        ...processRow(row),
      };
    });
  }

  /**
   * The object number for the row element
   * @param index for the row ...
   * @param item the row element
   * @returns will return the row objectnumber ...
   */
  tableTrackBy(index: number, item: any): string {
    return `${item.OBJECTNUMBER?.fieldData}`;
  }

  /**
   * Set the view type
   * @param type the view type
   */
  setViewType(type: any) {
    this.view = type as CorrectionDetailView;
  }
}
