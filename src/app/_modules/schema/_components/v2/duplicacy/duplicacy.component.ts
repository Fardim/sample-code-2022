import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges, Input, ViewContainerRef, ComponentFactoryResolver, ElementRef, NgZone, ViewChildren, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FieldInputType, FilterCriteria, SchemaTableAction, SchemaTableViewFldMap, SchemaTableViewRequest, STANDARD_TABLE_ACTIONS, TableActionViewType } from '@models/schema/schemadetailstable';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, Subject, Subscription } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';

import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaStaticThresholdRes, LoadDropValueReq, SchemaListDetails, SchemaVariantsModel, ModuleInfo } from '@models/schema/schemalist';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { AddFilterOutput } from '@models/schema/schema';
import { MatMenuTrigger } from '@angular/material/menu';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MatDialog } from '@angular/material/dialog';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { DoCorrectionRequest, MasterRecordChangeRequest, MasterRuleStatus, MASTER_RULE_STATUS_KEY, RECORD_STATUS, RECORD_STATUS_KEY, RequestForCatalogCheckData } from '@models/schema/duplicacy';
import { CatalogCheckService } from '@services/home/schema/catalog-check.service';
import { MatPaginator } from '@angular/material/paginator';
import { DuplicacyDataSource } from './duplicacy-data-source';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { debounceTime, distinctUntilChanged, skip, take } from 'rxjs/operators';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { TableCellInputComponent } from '@modules/shared/_components/table-cell-input/table-cell-input.component';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { FormControl } from '@angular/forms';
import { TransientService } from 'mdo-ui-library';
import { sortBy } from 'lodash';
import { MatTable } from '@angular/material/table';
import { BadgeStatus, BadgeService, BadgeData } from '@services/home/schema/badge.service';
import { debounce } from 'lodash';
import { SchemaViewComponent } from '../_builder/schema-view/schema-view.component';
import { CoreService } from '@services/core/core.service';
@Component({
  selector: 'pros-duplicacy',
  templateUrl: './duplicacy.component.html',
  styleUrls: ['./duplicacy.component.scss']
})
export class DuplicacyComponent extends SchemaViewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

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

  dataSource: DuplicacyDataSource;

  /**
   * Selected group id, 0 for all groups
   */
  groupId: string;

  /**
   * Selected group key
   */
  groupKey: string;
  groupDesc: string;
  groupIgnored = false;
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
   * Current active tab..
   */
  activeTab = 'error';

  /**
   * Variant id if have otherwise by default is 0 for all
   */
  variantId = '0';

  /**
   * Variant name if have otherwise by default is entire dataset
   */
  variantName = 'Entire dataset';


  /**
   * Selected Variant total count
   */
  variantTotalCnt = 0;

  /**
   * doc count for entire dataset
   */
  totalVariantsCnt = 0;

  /**
   * holds module info
   */
  moduleInfo: ModuleInfo;

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
  startColumns = ['select', 'action', RECORD_STATUS_KEY, 'OBJECTNUMBER'];

  /**
   * All display column fieldid should be here
   */
  displayedFields: BehaviorSubject<string[]> = new BehaviorSubject(this.startColumns);

  /**
   * Make table header row visiable
   */
  tableHeaderActBtn: string[] = [];


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
   * Hold info about for try to load value for
   * selected field id with preselcted ..
   */
  loadDopValuesFor: LoadDropValueReq;

  /**
   * Flag for re inilize filterable field ..
   */
  reInilize = true;

  /**
   * Input value for search by object number ...
   */
  preInpVal = '';

  /**
   * Store all data scopes ...  as a variants
   */
  dataScope: SchemaVariantsModel[] = [];

  /**
   * Current schema info ..
   */
  @Input() schemaInfo: SchemaListDetails;

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('filterRowContainer') filterRowContainer: ElementRef;

  @ViewChild('table') table: MatTable<any>;
  @ViewChild('tableContainer') tableContainer: ElementRef;

  @ViewChildren('menuTrigger') menuTriggers;

  lastScrollTop: number;

  inlineSearchSubject: Subject<string> = new Subject();

  RECORD_STATUS = RECORD_STATUS;

  RECORD_STATUS_KEY = RECORD_STATUS_KEY;

  FIELD_TYPE = FieldInputType;

  userDetails: Userdetails;

  /**
   * data fetch page index
   */
  pageIndex = 0;

  TableActionViewType = TableActionViewType;

  tableActionsList: SchemaTableAction[] = [
    { actionText: 'Confirm', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON_TEXT, actionCode: STANDARD_TABLE_ACTIONS.APPROVE, actionIconLigature: 'check' },
    { actionText: 'Revert', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON_TEXT, actionCode: STANDARD_TABLE_ACTIONS.REJECT, actionIconLigature: 'ban' },
    { actionText: 'Delete', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON_TEXT, actionCode: STANDARD_TABLE_ACTIONS.DELETE, actionIconLigature: 'trash-alt' }
  ] as SchemaTableAction[];

  @Input()
  isInRunning: boolean;
  /**
   * Emit event to details builder component when schema running is completed
   */
  @Output() runCompleted = new EventEmitter();

  /**
   * data table search input
   */
  @ViewChild('tableSearchInput') tableSearchInput: SearchInputComponent;

  /**
   * Control for the search ...
   */
  searchFrmCtrl: FormControl = new FormControl();

  currentDatascopePageNo = 0;

  /**
   * arrow mat-icon code
   */
   arrowIcon = 'chevron-left';

   widthOfGroupDataTable = 340;

   get dataContainerStyle() {
     return  {
      height: `calc(100% - ${this.filterRowContainer?.nativeElement.offsetHeight || 80}px - 116px)`
    };
   }

  isRefresh = false;

  /**
   * Skeleton Loader flags
   */
  get loading() {
    return !this.schemaInfo || Object.keys(this.loader).find(x => this.loader[x]);
  }

  loader = {
    schemaDetails: false,
    variantDetails: false,
    schemaStatics: true,
    moduleDetails: false,
    tableColumns: false,
    getData: false
  };

  fieldsInUpdate = [];

  subscriptions: Array<Subscription> = [];
  /**
   * Variable to hold the information about the rule status list popover
   */
  statusMenuTrigger = {
    qsMark: false,
    toolTip: false
  }

  closeStatusMenu = debounce(() => {
    if (!this.statusMenuTrigger.qsMark && !this.statusMenuTrigger.toolTip) {
      this.toggleRuleStatusMenu();
    }
  }, 300);

  constructor(
    private activatedRouter: ActivatedRoute,
    public schemaDetailService: SchemaDetailsService,
    private router: Router,
    private sharedServices: SharedServiceService,
    private schemaService: SchemaService,
    private endpointservice: EndpointsClassicService,
    private snackBar: TransientService,
    private matDialog: MatDialog,
    private schemaListService: SchemalistService,
    private schemaVariantService: SchemaVariantService,
    private catalogService: CatalogCheckService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private userService: UserService,
    private ngZone: NgZone,
    private badgeService: BadgeService,
    private coreService: CoreService
  ) {
    super(schemaDetailService)
  }


  ngOnChanges(changes: SimpleChanges): void {

    this.isRefresh = false;

    if (changes && changes.isInRunning && changes.isInRunning.currentValue !== changes.isInRunning.previousValue) {
      this.isInRunning = changes.isInRunning.currentValue;
    }

    if (changes && changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue) {
      this.moduleId = changes.moduleId.currentValue;
      this.isRefresh = true;
    }

    if (changes && changes.schemaId && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
      this.schemaId = changes.schemaId.currentValue;
      this.ngOnDestroy();
      this.isRefresh = true;
      this.filterCriteria.next(null);
      this.searchFrmCtrl.setValue('');
    }

    if (changes && changes.schemaInfo && changes.schemaInfo.currentValue !== changes.schemaInfo.previousValue) {
      this.getSchemaStatics();
    }

    if (changes && changes.schemaInfo && changes.schemaInfo.currentValue !== changes.schemaInfo.previousValue) {
      if(!this.isInRunning) {
        this.getSchemaStatics();
      } else {
        this.loader.schemaStatics = false;
      }
    }

    /* if(changes && changes.variantId && changes.variantId.currentValue !== changes.variantId.previousValue) {
      this.variantId = changes.variantId.currentValue ? changes.variantId.currentValue : '0';
    } */

    if (this.isRefresh) {
      this.getModuleInfo(this.moduleId);
    }

    if (this.isRefresh && !this.isInRunning) {
      this.refreshView();
    }
  }

  refreshView() {
    this.dataSource = new DuplicacyDataSource(this.catalogService, this.snackBar, this.sharedServices);
      this.groupId = null;
      this.groupKey = null;
      this.groupIgnored = false;
      delete this.statics;
      // this.variantId = '0';
      // this.variantName = 'Entire dataset';
      this.sortOrder = {};
      // this.getSchemaStatics();
      this.getSchemaTableActions();
      // this.getData();

      // reset filter and sort order
      this.filterCriteria.next(null);
      this.preInpVal = '';

      // Connecting to datasource callback in order to refresh the UI upon completion
      this.dataSource.connect().subscribe((res) => {
        if(res && res?.length) {
          this.updateTableColumnSize();
        }
      });
  }


  ngAfterViewInit(): void {
    this.sort?.sortChange.subscribe(res => {
      this.sortOrder = {};
      if (res.direction) {
        const fldId = res.active ? res.active : '';
        const order = res.direction ? res.direction : '';
        // this.sortOrder = {};
        this.sortOrder[fldId] = order;
      }
      this.getData();
    });

  }

  ngOnInit(): void {

    this.subscriptions.push(
      this.sharedServices.getAfterVariantDeleted().subscribe(() => {
        this.getDataScope(this.variantId, false);
      })
    );
    if(!this.isInRunning) {
      this.subscriptions.push(
        this.sharedServices.getDataScope().subscribe(res => {
          if (res) {
            this.getDataScope(res);
          }
        })
      );
    }

    /**
     * After choose columns get updated columns ..
     */
    this.subscriptions.push(this.sharedServices.getChooseColumnData().pipe(skip(1)).subscribe(result => {
      if (result && !result.editActive) {
        this.getSelectedTableColumns();
        if (result.tableActionsList && result.tableActionsList.length) {
          this.tableActionsList = result.tableActionsList
        }
      }
      this.updateTableColumnSize();
    }));

    /**
     * After filter applied should call for get data
     */
    this.filterCriteria.subscribe(res => {
      if (res !== null && !this.isInRunning) {
        this.getData();
        this.getSchemaStatics(false);
      }
    });

    /**
     * While row selection change then control the header actions..
     */
    this.selection.changed.subscribe(res => {
      if (res.source.selected.length > 0) {
        this.tableHeaderActBtn = ['common_actions_header'];
      } else {
        this.tableHeaderActBtn = [];
      }
    });

    /**
     * inline search changes
     */
    this.inlineSearchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(value => this.inlineSearch(value));

    this.userService.getUserDetails().subscribe(res => {
      this.userDetails = res;
    }, error => console.error(`Error : ${error.message}`));

    this.searchFrmCtrl.valueChanges.subscribe(val=>{
      this.inlineSearchSubject.next(val);
    });

    this.subscriptions.push(this.sharedServices.getSchemaDetailsTableDataAPICallState().subscribe((state: string) => {
      if (state === 'true') {
        this.loader.getData = true;
      } else if (state === 'false') {
        this.loader.getData = false;
      }
    }));
  }

  /**
   * get module info based on module id
   * @param id module id
   */
  getModuleInfo(id) {
    this.totalVariantsCnt = 0;
    this.loader.moduleDetails = true;
    const sub = this.coreService.searchAllObjectType({lang: 'en',fetchsize: 1,fetchcount: 0,description: ''},[id]);
    const subscription = sub.subscribe(res => {
      if (res && res.length) {
        this.moduleInfo = res[0];
        this.totalVariantsCnt = this.moduleInfo.datasetCount || 0;
      }
      this.getDataScope(this.schemaInfo?.variantId);
      if(!this.isInRunning && this.isRefresh) {
        this.getTableHeaders();
      }
      this.loader.moduleDetails = false;
    }, error => {
      this.loader.moduleDetails = false;
      console.log(`Error:: ${error.message}`)
    });
    this.subscriptions.push(subscription);
    return sub;
  }

  getSelectedTableColumns() {
    this.loader.tableColumns = true;
    const subscription = this.schemaDetailService.getSelectedFieldsByNodeIds(this.schemaId, this.variantId, ['header'])
      .subscribe(res => {
          this.selectedFields = sortBy(res[0].fieldsList, 'order');
          this.selectedFields.map((x) => x.editable = true);
          this.calculateDisplayFields();
          this.loader.tableColumns = false;
      });
    this.subscriptions.push(subscription);
  }

  /**
   * Combine obserable for metadata and selected field by user
   */
  getTableHeaders() {
    combineLatest([this.coreService.getMetadataFieldsByModuleId([this.moduleId], ''),
    this.schemaDetailService.getSelectedFieldsByNodeIds(this.schemaId, this.variantId, ['header'])])
      .subscribe(res => {
        if (res) {
          this.metadataFldLst = res[0];
          const selcteFlds = res[1] ? res[1][0].fieldsList : [];
          if (!selcteFlds.length) {
            const orderFld: SchemaTableViewFldMap[] = [];
            Object.keys(res[0].headers).forEach((header, index) => {
              if (index <= 9) {
                const choosenField: SchemaTableViewFldMap = new SchemaTableViewFldMap();
                choosenField.order = index;
                choosenField.fieldId = header;
                choosenField.nodeId = 'header';
                choosenField.nodeType = 'HEADER';
                orderFld.push(choosenField);
              }
            });
            const schemaTableViewRequest: SchemaTableViewRequest = new SchemaTableViewRequest();
            schemaTableViewRequest.schemaId = this.schemaId;
            schemaTableViewRequest.variantId = this.variantId ? this.variantId : '0';
            schemaTableViewRequest.schemaTableViewMapping = orderFld;
            this.schemaDetailsService.updateSchemaTableView(schemaTableViewRequest).subscribe(response => {}, error => {
              console.error('Exception while persist table view');
            });
            this.selectedFields = orderFld;
            this.selectedFields.map((x) => x.editable = true);
          } else {
            this.selectedFields = sortBy(selcteFlds, 'order');
            this.selectedFields.map((x) => x.editable = true);
          }
          this.calculateDisplayFields();
          this.getSchemaStatics(false);
        }
      });
  }


  /**
   * Call service for get schema statics based on schemaId and latest run
   */
  getSchemaStatics(loading = true) {
    this.loader.schemaStatics = loading;
    if(loading) {
      delete this.statics;
    }
    setTimeout(() => {
      const filterCriteria = this.filterCriteria.getValue() || [];
      const subscription = this.schemaService.getSchemaThresholdStaticsV2(this.schemaId, this.variantId, [], filterCriteria).subscribe(res => {
        this.statics = res;
        this.updateTableColumnSize();
        this.loader.schemaStatics = false;
      }, error => {
        this.statics = new SchemaStaticThresholdRes();
        this.updateTableColumnSize();
        this.loader.schemaStatics = false;
        console.error(`Error : ${error}`);
      });
      this.subscriptions.push(subscription);
    }, 1000);
  }

  /**
   * Get schema variant details ..
   */
  getVariantDetails() {
    this.loader.variantDetails = true;
    const subscription = this.schemaVariantService.getVariantdetailsByvariantId(this.variantId, this.userDetails.currentRoleId, this.userDetails.plantCode, this.userDetails.userName).subscribe(res => {
      if (res) {
        const finalFiletr: FilterCriteria[] = [];
        const inline = res.filterCriteria.filter(fil => fil.fieldId === 'id')[0];
        if (inline) {
          this.preInpVal = inline.values ? inline.values.toString() : '';
          finalFiletr.push(inline);
        }
        res.filterCriteria.forEach(fil => {
          const filter: FilterCriteria = fil; // new FilterCriteria();
          // filter.fieldId = fil.fieldId;
          // filter.type = fil.type;
          // filter.values = fil.values;

          const dropVal: DropDownValue[] = [];
          filter.values.forEach(val => {
            const dd: DropDownValue = { CODE: val, FIELDNAME: fil.fieldId } as DropDownValue;
            dropVal.push(dd);
          });

          filter.filterCtrl = { fldCtrl: fil.fldCtrl, selectedValues: dropVal };
          finalFiletr.push(filter);
        });

        this.filterCriteria.next(finalFiletr);
      }
      this.loader.variantDetails = false;
    }, error => {
      this.filterCriteria.next([]);
      this.tableSearchInput.clearSearch(true);
      console.error(`Error : ${error.message}`);
      this.loader.variantDetails = false;
    });
    this.subscriptions.push(subscription);
  }


  /**
   * Get table data from service ..
   * @param filterCriteria have default filter or apply filter as request...
   * @param sort apply some sorting on column ..
   */
  getData(isLoadingMore?, loading = true) {
    this.selection.clear();

    if (!this.groupId || !this.groupKey) {
      this.dataSource?.reset();
      return;
    }

    if (isLoadingMore) {
      this.pageIndex++;
    } else {
      this.pageIndex = 0;
    }

    const request = new RequestForCatalogCheckData();
    request.schemaId = this.schemaId;
    request.groupId = this.groupId;
    request.page = this.pageIndex;
    request.size = 40;
    if(this.groupIgnored) {
      request.ignore = this.groupIgnored;
    }
    request.key = this.groupKey;
    request.runId = this.schemaInfo && this.schemaInfo.runId ? this.schemaInfo.runId : '';
    request.filterCriterias = this.filterCriteria.getValue() || [];
    request.plantCode = '0';
    request.sort = this.sortOrder;
    request.requestStatus = this.activeTab;
    // request.runId = this.schemaInfo && this.schemaInfo.runId ?  this.schemaInfo.runId : '';

    this.dataSource.getTableData(request, isLoadingMore);
    if (loading === true) {
      this.sharedServices.setSchemaDetailsTableDataAPICallState('true');
    } else {
      this.loader.getData = loading;
    }
  }

  /**
   * Calculate fields based on user view ..
   *
   */
  calculateDisplayFields(): void {
    const allMDF = this.metadataFldLst;
    const fields = [];
    const select = [];
    // const metadataLst: any = {};
    this.startColumns.forEach(col => fields.push(col));
    for (const headerField in allMDF.headers) {
      if (allMDF.headers.hasOwnProperty(headerField)) {

        const index = this.selectedFields.findIndex(f => f.fieldId === headerField);
        if (fields.indexOf(headerField) < 0 && (index !== -1)) {
          select[index] = headerField;
        }
        // metadataLst[headerField] = allMDF.headers[headerField];
      }
    }
    // TODO for hierarchy and grid logic ..
    // this.metadataFldLst = metadataLst;
    select.forEach(fldId => fields.push(fldId));
    if(this.groupIgnored) {
      fields.splice(3, 0, '_groupDesc');
    }
    this.displayedFields.next(fields);
  }


  /**
   * Navigate particular tab by tab status
   * @param status get tab name to navigate
   */
  changeTabStatus(status: string) {

    if (this.activeTab === status) {
      console.log('Already loaded for tab {}', status)
      return false;
    }
    this.dataSource.reset();
    this.activeTab = status;
    this.groupId = null;
    // this.getData();
    this.router.navigate(['/home/schema/list', this.schemaId], { queryParams: { status } });

  }

  /**
   * Oen choose column side sheet ..
   */
  openTableColumnSettings() {
    const data = {
      schemaId: this.schemaId, variantId: this.variantId, fields: this.metadataFldLst,
      selectedFields: this.selectedFields, editActive: true
    }
    this.sharedServices.setChooseColumnData(data);
    this.router.navigate(['', { outlets: { sb: 'sb/schema/table-column-settings' } }], { queryParamsHandling: 'preserve' });
  }

  /**
   * Method for download error or execution logs
   */
  downloadExecutionDetails() {
    if (!this.groupId) {
      return;
    }
    const subscription = this.catalogService.downloadExecutionDetails(this.schemaId, this.schemaInfo.runId, this.activeTab.toLocaleLowerCase(), this.groupId, this.variantId)
      .subscribe(resp => {
          this.snackBar.open('Download successfully started', null, {
            duration: 1000
          });
        },
        err => {
          this.snackBar.open('An error occured, try later !', null, {
            duration: 1000
          });
          console.error(`Error:: ${err.message}`);
        });
    this.subscriptions.push(subscription);
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



  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.docLength();
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
   * @param row if request  type is inline then submit single rec ..
   */
  approveRecords(type: string, row?: any) {
    const objNumbs: string[] = [];
    if (type === 'inline') {
      const docId = row ? row.OBJECTNUMBER.fieldData : '';
      if (docId) {
        objNumbs.push(docId);
      }
    } else {
      if (this.selection.selected.length) {
        const selected = this.selection.selected.filter(sel => !sel.OBJECTNUMBER.isReviewed && (sel[RECORD_STATUS_KEY].fieldData !== RECORD_STATUS.DELETABLE));
        selected.forEach(sel => {
          const docId = sel.OBJECTNUMBER.fieldData;
          objNumbs.push(docId);
        });

      }
    }

    const subscription = this.catalogService.approveDuplicacyCorrection(this.schemaId, this.schemaInfo.runId, objNumbs, this.userDetails.userName)
      .subscribe(res => {
        // this.getData();
        this.snackBar.open('Successfully approved !', 'close', { duration: 1500 });

        if (type === 'inline') {
          row.OBJECTNUMBER.isReviewed = true;
        } else {
          this.selection.selected.forEach(record => {
            record.OBJECTNUMBER.isReviewed = true;
          })
        }
        this.selection.clear();
        this.getSchemaStatics(false);
      }, error => {
        this.snackBar.open(`${error?.error?.message}`, 'Close', { duration: 2000 });
        console.error(`Error :: ${error.message}`);
      });
    this.subscriptions.push(subscription);
  }

  /**
   *
   * @param type type of request is inline or submit all
   * @param row if request  type is inline then submit single rec ..
   */
  rejectRecords(type: string, row?: any) {
    const objNumbs: string[] = [];
    if (type === 'inline') {
      const docId = row ? row.OBJECTNUMBER.fieldData : '';
      if (docId) {
        objNumbs.push(docId);
      }
    } else {
      if (this.selection.selected.length) {
        const selected = this.selection.selected.filter(sel => !sel.OBJECTNUMBER.isReviewed && (sel[RECORD_STATUS_KEY].fieldData !== RECORD_STATUS.DELETABLE));
        selected.forEach(sel => {
          const docId = sel.OBJECTNUMBER.fieldData;
          objNumbs.push(docId);
        });

      }
    }

    const subscription = this.catalogService.rejectDuplicacyCorrection(this.schemaId, this.schemaInfo.runId, objNumbs, this.userDetails.userName)
      .subscribe(res => {
        this.selection.clear();
        this.getData();
        /* if (type === 'inline') {
          row.OBJECTNUMBER.isReviewed = false;
        } else {
          this.selection.selected.forEach(record => {
            record.OBJECTNUMBER.isReviewed = false;
          })
        } */
        this.getSchemaStatics(false);
      }, error => {
        this.snackBar.open(`Something went wrong !`, 'Close', { duration: 2000 });
        console.error(`Error :: ${error.message}`);
      });
    this.subscriptions.push(subscription);
  }

  /**
   * Make control for prepare filter for ...
   * @param fld ready for applied filter control
   */
  makeFilterControl(fld: AddFilterOutput) {
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
    const selCtrl = ctrl.filterCtrl.selectedValues.filter(fil => fil.FIELDNAME === ctrl.fieldId);
    if (selCtrl && selCtrl.length > 1) {
      const fld = this.filterCriteria.getValue().filter(fil => fil.fieldId === ctrl.fieldId);
      if (fld && fld.length > 0) {
        const sel = fld[0].filterCtrl.selectedValues.filter(f => f.FIELDNAME === ctrl.fieldId);
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
   * Submit reviewed records
   */
  /* submitReviewRec() {
    this.schemaDetailService.submitReviewedRecords(this.schemaId).subscribe(res => {
      if (res.acknowledge) {
        this.snackBar.open(`Successfully submitted !`, 'Close', { duration: 2000 });
      }
    }, error => {
      this.snackBar.open(`${error.statusText}: Please review atleast one record(s)`, 'Close', { duration: 2000 });
    });
  } */


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
  /* opnDialogSaveVariant() {
    const ref = this.matDialog.open(SaveVariantDialogComponent, {
      width: '600px',
      height: '450px',
      data: { schemaInfo: this.schemaInfo, variantId: this.variantId, moduleId: this.moduleId, filterData: this.filterCriteria.getValue() }
    });

    ref.afterClosed().subscribe(res => {
      console.log(res);
    });
  } */

  /**
   * Reset applied filter
   */
  resetAppliedFilter() {
    this.filterCriteria.next([]);
    this.preInpVal = '';
    this.searchFrmCtrl.setValue('');
  }

  /**
   * Updated selected drop values ...
   * @param dropValue updated dropvalues
   */
  updateFilterCriteria(dropValue: DropDownValue[]) {
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
      if (this.variantId === '0') {
        this.variantName = 'Entire dataset';
        this.variantTotalCnt = this.totalVariantsCnt;
      } else if (scope) {
        this.variantName = scope?.variantName;
        this.variantTotalCnt = scope?.dataScopeCount;
      }
      if (this.variantId !== '0') {
        this.getVariantDetails();
      } else {
        this.filterCriteria.next([]);
      }

      if (this.tableSearchInput) {
        this.tableSearchInput.clearSearch(true);
      }

      if(!this.isRefresh) {
        this.getSelectedTableColumns();
      }
    } else {
      if (this.variantId === '0') {
        this.variantTotalCnt = this.totalVariantsCnt;
      }
      this.filterCriteria.next([]);
    }
  }

  /**
   * Mark a record as master
   * @param row record details
   */
  markAsMasterRecord(row) {

    const request = new MasterRecordChangeRequest();
    request.id = row.OBJECTNUMBER.fieldData;
    request.schemaId = this.schemaId;
    request.runId = this.schemaInfo.runId;
    request.oldId = '';

    const subscription = this.catalogService.markAsMasterRecord(request)
      .subscribe(resp => {
        this.getSchemaStatics(false);

        this.getData(false, false);
      });
    this.subscriptions.push(subscription);
  }

  /**
   * mark record for deletion
   * @param row record to be marked for deletion
   * @param forReset flg to identify whether for
   */
  markForDeletion(row,forReset?: boolean) {
    const objectNumber = row.OBJECTNUMBER.fieldData;
    // || row[RECORD_STATUS_KEY].fieldData === RECORD_STATUS.DELETABLE
    if (!objectNumber) {
      return;
    }
    this.catalogService.markForDeletion(objectNumber, this.moduleId, this.schemaId, this.schemaInfo.runId, forReset ? forReset : false)
      .subscribe(resp => {

        // get the schema statics..
        this.getSchemaStatics(false);
        // get the table data ...
        this.getData();
      }, error => {
        console.log(error);
      });
  }

  /**
   * mark record for exclusion
   * @param row record to be marked for exclusion
   */
  markForExclusion(row, status: boolean = true) {
    const objectNumber = row.OBJECTNUMBER.fieldData;
    if (!objectNumber) {
      return;
    }
    this.catalogService.markForExclusion(objectNumber, this.schemaId, this.groupId, status)
      .subscribe(resp => {
        this.snackBar.open(
          status ? 'The record has been marked as non-duplicate' : 'The record has been moved to the original group', null, {
          duration: 2000
        });
        this.catalogService.setRefreshGroupList();
        // get the schema statics..
        this.getSchemaStatics(false);
        // get the table data ...
        this.getData();
      }, error => {
        console.log(error);
      });
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  updateSelectedGroup(event) {
    if (event.groupId === this.groupId) {
      return;
    }
    this.groupId = event.groupId;
    this.groupKey = event.groupKey;
    this.groupDesc = event.groupDesc;
    this.groupIgnored = event.ignore;
    this.calculateDisplayFields();
    this.getData();
  }

  isStaticColumn(dynCol) {
    return this.startColumns.includes(dynCol);
  }

  /**
   * load more records on scroll end
   * @param event scrol details
   */
  onScroll(event) {

    if (event.target.clientHeight + event.target.scrollTop >= event.target.scrollHeight) {
      if (event.target.scrollTop > this.lastScrollTop) {
        this.getData(true, false);
      }

    }
    this.lastScrollTop = event.target.scrollTop;
  }

  /**
   * Get data scopes .. or variants ...
   */
  getDataScope(activeVariantId?: string, loading = true) {
    const body = {
      from: 0,
      size: 10,
      variantName: null
    };
    const obsv = this.schemaVariantService.getDataScopesList(this.schemaId, 'RUNFOR', body);

    const subscription = obsv.subscribe(res => {
      this.dataScope = res;
      this.currentDatascopePageNo = 0;
      if(loading) {
        if (activeVariantId) {
          this.variantChange(activeVariantId);
        }
      }
    }, (error) => console.error(`Something went wrong while getting variants : ${error.message}`));
    this.subscriptions.push(subscription);
    return obsv;
  }

  updateDataScopeList() {
    const pageNo = this.currentDatascopePageNo + 1;
    const body = {
      from: pageNo,
      size: 10,
      variantName: null
    };

    const subscription = this.schemaVariantService.getDataScopesList(this.schemaId, 'RUNFOR', body).subscribe(res => {
      if (res && res.length) {
        this.dataScope = [...this.dataScope, ...res];
        this.currentDatascopePageNo = pageNo;
      }
    }, (error) => console.error(`Something went wrong while getting variants. : ${error.message}`));
    this.subscriptions.push(subscription);
  }

  /**
   * Function to open data scope side sheet...
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
   * inline search input changes
   */
  newInlineSearchText(value) {
    this.inlineSearchSubject.next(value);
  }

  getRecordStatusClass(row) {
    return row[RECORD_STATUS_KEY].fieldData === RECORD_STATUS.MASTER ? 'success-status'
      : row[RECORD_STATUS_KEY].fieldData === RECORD_STATUS.NOT_DELETABLE ? 'warning-status'
        : 'unselected';
  }

  isMasterRecord(row) {
    return row[RECORD_STATUS_KEY].fieldData === RECORD_STATUS.MASTER;
  }

  getTableRowClass(row) {
    const classList = [];
    if (row[RECORD_STATUS_KEY].fieldData !== RECORD_STATUS.MASTER) {
      classList.push('not-master-row')
    }
    if (row[RECORD_STATUS_KEY].fieldData === RECORD_STATUS.DELETABLE) {
      classList.push('row-deletable')
    }
    return classList;
  }

  /**
   *
   * @param fldid editable field id
   * @param row entire row should be here...
   */
  editCurrentCell(fldid: string, row: any, rIndex: number, containerRef: ContainerRefDirective) {
    if (this.activeTab === 'outdated') { return; };

    const field = this.selectedFields.find(f => f.fieldId === fldid);
    if (field && !field.editable) {
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

  /**
   * After value change on & also call service for do correction
   * @param fldid fieldid that have blur triggered
   * @param value current changed value
   * @param row row data ...
   */
  emitEditBlurChng(fldid: string, value: any, row: any, rIndex: number, viewContainerRef?: ViewContainerRef) {
    this.activeCellPosition(fldid, rIndex);
    let code = value;
    if(typeof value === 'object') {
      code = value.CODE;
      value = value.TEXT;
    }
    if(row[fldid]) {
      row[fldid].newFieldData = code;
    }
    if (document.getElementById('inpctrl_' + fldid + '_' + rIndex)) {

      // DOM control after value change ...
      const inpCtrl = document.getElementById('inpctrl_' + fldid + '_' + rIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_' + fldid + '_' + rIndex) as HTMLSpanElement;

      // clear the dynamic cell input component
      viewContainerRef.clear();

      inpCtrl.style.display = 'none';
      viewCtrl.innerText = value;
      viewCtrl.style.display = 'block';

      // DO correction call for data
      const objctNumber = row.OBJECTNUMBER.fieldData;
      const oldVal = row[fldid] ? row[fldid].fieldData : '';
      if (objctNumber && oldVal !== value) {
        console.log('correction request....');
        const groupNumber = this.groupDesc ? this.groupDesc.split('Group')[1] : 1;
        const request: DoCorrectionRequest = {
          id: objctNumber,
          fldId: fldid,
          vc: code,
          vt: value,
          oc: oldVal,
          groupIdold: this.groupId,
          groupIdnew: '',
          isReviewed: 'false',
          groupField: this.groupKey,
          groupDesc: Number(groupNumber)
        } as DoCorrectionRequest;
        this.requestStatus = BadgeStatus.PENDING;

        // validate the cell data before call actual do correction ... api
        this.dataSource.updateDoc(objctNumber,fldid, value, code);
        const doc = this.dataSource.getRow(objctNumber);
        // set the value to cell
        if (row[fldid]?.fieldData) {
          row[fldid].fieldData = value;
        }
        forkJoin([this.schemaDetailService.validateCell(this.moduleId, this.schemaId, doc,fldid)]).toPromise().then(r=>{
          if(r[0] && r[0].status === 'SUCCESS') {
            if (this.fieldsInUpdate.length <= 5) {
              this.fieldsInUpdate.push({rIndex, fldId: fldid, badge: BadgeStatus.PENDING});
            }
            this.catalogService.doCorrection(this.schemaId, this.schemaInfo.runId, request).subscribe(res => {
              this.requestStatus = BadgeStatus.SUCCESS;
              this.setBadgeState(fldid, rIndex, BadgeStatus.SUCCESS);

              if (row[fldid]?.fieldData) {
                row[fldid].fieldData = value;
              } else {
                row[fldid] = {fieldData:value};
              }

              if (res && res.count) {
                this.statics.correctedCnt = res.count;
              }
            }, error => {
              this.requestStatus = BadgeStatus.ERROR;
              this.snackBar.open(`Something went wrong !`, 'Close', { duration: 2000 });
              console.error(`Error :: ${error.message}`);
            });

            // reset the error message ...
            try{
              row[fldid].errorMsg = '';
              row[fldid].isInError = false;
            } catch(e){console.error(`Error while reset the error message : ${e}`)}
          } else {
            this.requestStatus = BadgeStatus.ERROR;
            row[fldid].isInError = true;
            row[fldid].isCorrected = false;
            row[fldid].errorMsg = r[0] && r[0].allFieldsLogs && r[0].allFieldsLogs[0] && r[0].allFieldsLogs[0].errMsg ? r[0].allFieldsLogs[0].errMsg : 'Something went wrong';
            console.log('Log the execption on cell');
          }
        }).catch(err=>{
          console.log(`Exception : ${err}`);
          this.requestStatus = BadgeStatus.ERROR;
          this.setBadgeState(fldid, rIndex, BadgeStatus.ERROR);
          if(row[fldid]?.fieldData) {
            row[fldid].fieldData = value;
          }
          if(row[fldid]) {
            row[fldid].errorMsg = err?.error?.message ||  'Something went wrong';
          } else {
            row[fldid].errorMsg = err?.error?.message ||  'Something went wrong';
          }
          try{
            row[fldid].isInError = true;
            row[fldid].isCorrected = false;
          } catch(e){console.error(`Error while reset the error message : ${e}`)}
        }).finally(()=>{
          console.log('Done !!!');
        });

      } else {
        console.error(`Wrong with object number or can't change if old and new same  ... `);
      }
    }
  }

  setBadgeState(fldId, rIndex, state) {
    const badgeFld = this.fieldsInUpdate.find(x => (x.fldId === fldId && x.rIndex === rIndex));
    if (badgeFld) {
      badgeFld.badge = state;
      setTimeout(() => {
        badgeFld.badge = '';
        this.fieldsInUpdate = this.fieldsInUpdate.filter(x => !(x.fldId === fldId && x.rIndex === rIndex));
      }, 2000);
    }
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

    // add the input component to the cell
    const componentRef = containerRef.viewContainerRef.createComponent(componentFactory);
    // binding dynamic component inputs/outputs
    componentRef.instance.fieldId = fldid;
    const viewCtrl = document.querySelector(`#viewctrl_${fldid}_${rIndex}`) as HTMLElement;
    componentRef.instance.fieldHeight = viewCtrl?.offsetHeight || 34;
    componentRef.instance.inputType = this.getFieldInputType(fldid);
    componentRef.instance.parentFldValues = this.getParentVal(fldid, row);
    componentRef.instance.value = row[fldid] ? row[fldid].newFieldData ?? row[fldid].fieldData : '';

    this.tableContainer.nativeElement.onscroll = () => {
      componentRef.instance.inputAutoCompleteEl?.closePanel();
      componentRef.instance.input.nativeElement.blur();
    };

    componentRef.instance.inputBlur.subscribe(value => this.emitEditBlurChng(fldid, value, row, rIndex, containerRef.viewContainerRef));

  }

  /**
   * get input type when user edits a cell
   * @param fieldId the field id
   */
  getFieldInputType(fieldId) {
    if(!this.metadataFldLst.headers[fieldId]) {
      return this.FIELD_TYPE.TEXT;
    }
    if (this.metadataFldLst.headers[fieldId].picklist === '0' && this.metadataFldLst.headers[fieldId].dataType === 'NUMC') {
      return this.FIELD_TYPE.NUMBER;
    }
    if (this.metadataFldLst.headers[fieldId].picklist === '0' && (this.metadataFldLst.headers[fieldId].dataType === 'DATS' || this.metadataFldLst.headers[fieldId].dataType === 'DTMS')) {
      return this.FIELD_TYPE.DATE;
    }

    if (this.metadataFldLst.headers[fieldId].picklist === '1' || this.metadataFldLst.headers[fieldId].picklist === '30' || this.metadataFldLst.headers[fieldId].picklist === '37') {
      if (this.metadataFldLst.headers[fieldId].isCheckList === 'true') {
        return this.FIELD_TYPE.MULTI_SELECT;
      } else {
        return this.FIELD_TYPE.SINGLE_SELECT;
      }
    }

    return this.FIELD_TYPE.TEXT;

  }

  /**
   * format cell displayed value based on field type
   * @param fieldId the field id
   * @param value cell value
   */
  formatCellData(fieldId, value) {
    if (this.getFieldInputType(fieldId) === this.FIELD_TYPE.MULTI_SELECT) {
      // console.log(value);
      return value.toString();
    }
    return value;
  }

  /**
   * Function to open trend execution side sheet
   */
  openExecutionTrendSideSheet() {
    this.router.navigate(['', { outlets: { sb: `sb/schema/execution-trend/${this.moduleId}/${this.schemaId}/${this.variantId}` } }], { queryParamsHandling: 'preserve' })
  }

  /**
   * get already saved schema actions
   */
  getSchemaTableActions() {
    this.schemaDetailService.getTableActionsBySchemaId(this.schemaId).subscribe(actions => {
      if (actions && actions.length) {
        this.tableActionsList = actions;
      }
    });
  }

  get primaryActions() {
    return this.tableActionsList.filter(action => action.isPrimaryAction);
  }

  get secondaryActions() {
    return this.tableActionsList.filter(action => !action.isPrimaryAction);
  }


  get isEditer() {
    return this.schemaInfo
      && this.schemaInfo.collaboratorModels
      && this.schemaInfo.collaboratorModels.isEditer;
  }

  get isReviewer() {
    return this.schemaInfo
      && this.schemaInfo.collaboratorModels
      && this.schemaInfo.collaboratorModels.isReviewer;
  }

  get isApprover() {
    return this.schemaInfo
      && this.schemaInfo.collaboratorModels
      && (this.schemaInfo.collaboratorModels.isReviewer || this.schemaInfo.collaboratorModels.isApprover);
  }


  doAction(action: SchemaTableAction, row) {
    if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE && (this.isReviewer || this.isApprover || this.isAdmin())) {
      this.approveRecords('inline', row);
    } else if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.REJECT && (this.isReviewer || this.isApprover || this.isAdmin())) {
      this.rejectRecords('inline', row);
    } else if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.DELETE && (this.isReviewer || this.isApprover || this.isEditer || this.isAdmin())) {
      this.markForDeletion(row);
    }
  }

  get isGlobalActionsEnabled() {
    return this.selection.selected.some(row => !row.OBJECTNUMBER.isReviewed && (row[RECORD_STATUS_KEY].fieldData !== RECORD_STATUS.DELETABLE));
  }

  isAdmin(): boolean {
    if(this.schemaInfo && this.userDetails) {
      const isAdmin = this.schemaInfo.collaboratorModels?.isAdmin;
      const isSameUser = this.schemaInfo.createdBy === this.userDetails.userName;
      return isAdmin || isSameUser;
    }

    return false;
  }

  /**
   * check if the user is allowed to make an action
   * @param action action to be performed
   */
  hasActionPermission(action: SchemaTableAction) {
    if (action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE) {
      return this.isReviewer || this.isApprover || this.isAdmin();
    }

    if (action.actionCode === STANDARD_TABLE_ACTIONS.REJECT) {
      return this.isReviewer || this.isApprover || this.isAdmin();
    }

    return true;

  }

  /**
   * Check where delFlag is true or false for this row ...
   * @param row the current row ...
   */
  isDeleted(row: any): boolean {
    return row.OBJECTNUMBER.delFlag ? row.OBJECTNUMBER.delFlag : false;
  }

  onRunCompleted($event) {
    delete this.statics;
    this.runCompleted.emit($event);
    this.getSchemaStatics(true);
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

  /**
   * function to toggle the icon
   * and emit the toggle event
   */
   toggleSideBar() {
    if (this.arrowIcon === 'chevron-left') {
      this.arrowIcon = 'chevron-right';
      this.widthOfGroupDataTable = 0;
    }
    else {
      this.arrowIcon = 'chevron-left';
      this.widthOfGroupDataTable = 340;
    }
  }

  get approveAction() {
    return this.tableActionsList.find(action => action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE);
  }

  get rejectAction() {
    return this.tableActionsList.find(action => action.actionCode === STANDARD_TABLE_ACTIONS.REJECT);
  }

  /**
   * use this method to update the UI after dynamic columns are displayed
   */
   updateTableColumnSize() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => this.table.updateStickyColumnStyles());
    this.activeCell = null;
  }

  /**
   * Get badge status
   * @param rowIndex index for the row
   * @param column column name
   * @returns BadgeData
   */
  badge(column: string, rowIndex: number): BadgeData {
    const isActive = this.isActive(column, rowIndex);

    return this.badgeService.getBadgeByStatus(isActive? this.requestStatus : null);
  }

  getBadgeState(fldid, rIndex) {
    const badgeFld = this.fieldsInUpdate.find(x => (x.fldId === fldid && x.rIndex === rIndex));
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
    if(column && rowIndex > -1 && this.activeCell) {
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
    this.activeCell = {column, rowIndex};
  }

  getMasterRuleStatus(row): Array<MasterRuleStatus> {
    const masterRules: Array<MasterRuleStatus> = row[MASTER_RULE_STATUS_KEY] || [];
    return masterRules;
  }

  /**
   * Open rule status tooltip for current row and close all the other tooltips
   * @param menuTrigger MatMenuTrigger
   */
  toggleRuleStatusMenu(menuTrigger?: MatMenuTrigger) {
    console.log('Menu Opened');
    const menuTriggers = this.menuTriggers?._results as Array<MatMenuTrigger> || [];
    menuTriggers.filter(trigger => trigger.menuOpen && menuTrigger !== trigger).forEach(trigger => trigger.closeMenu());
    if(menuTrigger) {
      menuTrigger.openMenu();
    }
  }

  showmeStatus(ele: any) {
    // if(ele && this.activeTab === 'review' && ele[RECORD_STATUS_KEY]?.masterByUser !== '1' && ele[RECORD_STATUS_KEY]?.masterByUser) {
    //   try{
    //     ele[RECORD_STATUS_KEY].fieldData = RECORD_STATUS.MASTER;
    //   }catch(e){console.error(`Error : ${e}`)};
    //   return true;
    // } else
    if(ele && this.activeTab !== 'review' && ele[RECORD_STATUS_KEY]?.masterByUser === '1') {
      return false;
    } else if(ele && this.activeTab === 'review' && ele[RECORD_STATUS_KEY]?.masterByUser === '1') {
      ele[RECORD_STATUS_KEY].fieldData = RECORD_STATUS.MASTER;
      return true;
    }
    return true;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
}
