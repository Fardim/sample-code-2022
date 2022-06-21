import { Component, OnInit, ViewChild, ComponentFactoryResolver, Input, OnChanges, SimpleChanges, OnDestroy, ViewContainerRef } from '@angular/core';
import { MetadataModeleResponse, RequestForSchemaDetailsWithBr, SchemaCorrectionReq, FilterCriteria, FieldInputType, SchemaTableViewFldMap, TableActionViewType, SchemaTableAction, SchemaTableViewRequest, STANDARD_TABLE_ACTIONS } from '@models/schema/schemadetailstable';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaStaticThresholdRes, LoadDropValueReq, SchemaListDetails, SchemaVariantsModel } from '@models/schema/schemalist';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatMenuTrigger } from '@angular/material/menu';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MatDialog } from '@angular/material/dialog';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { SchemaDataSource } from '@modules/schema/_components/schema-details/schema-datatable/schema-data-source';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { TableCellInputComponent } from '@modules/shared/_components/table-cell-input/table-cell-input.component';
import { SaveVariantDialogComponent } from '../../save-variant-dialog/save-variant-dialog.component';
import { AddFilterOutput } from '@models/schema/schema';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-potext-view',
  templateUrl: './potext-view.component.html',
  styleUrls: ['./potext-view.component.scss']
})
export class PotextViewComponent implements OnInit, OnChanges, OnDestroy {


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
  variantName = 'Entire dataset';

  /**
   * Hold all metada control for header , hierarchy and grid fields ..
   */
  metadata: BehaviorSubject<MetadataModeleResponse> = new BehaviorSubject<MetadataModeleResponse>(null);

  /**
   * Store info about user selected field and order
   */
  selectedFieldsOb: BehaviorSubject<SchemaTableViewFldMap[]> = new BehaviorSubject(null);

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
  startColumns = ['checkbox_select', 'bucket_assigned', 'action', 'OBJECTNUMBER'];

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
   *
   */
  fetchCount = 0;


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
   * Store all data scopes ...  as a variants
   */
  dataScope: SchemaVariantsModel[] = [];


  /**
   * Current schema info ..
   */
  schemaInfo: SchemaListDetails;

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  FIELD_TYPE = FieldInputType;

  selectFieldOptions: DropDownValue[] = [];


  subscribers: Subscription[] = [];

  /**
   * Hold current user informations ..
   */
  userDetails: Userdetails;

  TableActionViewType = TableActionViewType;

  tableActionsList: SchemaTableAction[] = [
    { actionText: 'Approve', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON },
    { actionText: 'Reject', isPrimaryAction: true, isCustomAction: false, actionViewType: TableActionViewType.ICON },
    // { actionText: 'Generate cross entry', isPrimaryAction: true, isCustomAction: true, actionViewType: TableActionViewType.ICON }
  ] as SchemaTableAction[];

  /**
   * To check whether schema is running or not.
   */
  @Input()
  isInRunning: boolean;

  constructor(
    private activatedRouter: ActivatedRoute,
    private schemaDetailService: SchemaDetailsService,
    private router: Router,
    private sharedServices: SharedServiceService,
    private schemaService: SchemaService,
    private endpointservice: EndpointsClassicService,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private schemaListService: SchemalistService,
    private schemaVariantService: SchemaVariantService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private schemavariantService: SchemaVariantService,
    private userService: UserService,
    private schemaDetailsService: SchemaDetailsService
  ) { }

  ngOnDestroy(): void {
    this.subscribers.forEach(s => {
      s.unsubscribe();
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    // check if any things is change then refresh again
    let isRefresh = false;

    if (changes && changes.isInRunning && changes.isInRunning.currentValue !== changes.isInRunning.previousValue) {
      this.isInRunning = changes.isInRunning.currentValue;
    }

    if (changes && changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue) {
      this.moduleId = changes.moduleId.currentValue;
      isRefresh = true;
      this.getFldMetadata();
    }

    if (changes && changes.schemaId && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
      this.schemaId = changes.schemaId.currentValue;
      isRefresh = true;
      if (!this.isInRunning) {
        this.getDataScope();
        this.getSchemaStatics();
        this.getSchemaTableActions();
      }
    }

    if (changes && changes.variantId && changes.variantId.currentValue !== changes.variantId.previousValue) {
      this.variantId = changes.variantId.currentValue ? changes.variantId.currentValue : 0;
      isRefresh = true;
      if (this.variantId !== '0') {
        this.getVariantDetails();
      }
    }

    if (isRefresh) {
      this.dataSource = new SchemaDataSource(this.schemaDetailService, this.endpointservice, this.schemaId, this.sharedServices);

      this.getSchemaDetails();

      /**
       * Get all user selected fields based on default view ..
       */
      this.schemaDetailService.getAllSelectedFields(this.schemaId, this.variantId ? this.variantId : '0').subscribe(res => {
        this.selectedFieldsOb.next(res ? res : [])
      }, error => console.error(`Error : ${error}`));

      // reset filter and sort order
      this.filterCriteria.next(null);
      this.preInpVal = '';
    }


    // if (changes && changes.activeTab && changes.activeTab.currentValue !== changes.activeTab.previousValue) {
    //   this.activeTab = changes.activeTab.currentValue && changes.activeTab.currentValue === 'error' ? 'success' : changes.activeTab.currentValue;
    // }
    /**
     * Get onload data ..
     */
    this.getData();
  }

  ngOnInit(): void {
    this.sharedServices.getDataScope().subscribe(res => {
      if (res) {
        this.getDataScope();
      }
    })

    /**
     * After choose columns get updated columns ..
     */
    this.sharedServices.getChooseColumnData().subscribe(result=> {
      if(result && !result.editActive){
        this.selectedFields = result.selectedFields ? result.selectedFields : [];
        this.calculateDisplayFields();

        if (result.tableActionsList && result.tableActionsList.length) {
          this.tableActionsList = result.tableActionsList
        }
      }
    });

    /**
     * Combine obserable for metadata and selected field by user
     * And calcute display field and order
     */
    combineLatest([this.metadata, this.selectedFieldsOb]).subscribe(res => {
      if (res[0]) {
        const selcteFlds = res[1] ? res[1] : [];
        if(!selcteFlds.length) {
          const orderFld: SchemaTableViewFldMap[] = [];
          Object.keys(res[0].headers).forEach((header, index)=>{
            if(index <= 9) {
              const choosenField: SchemaTableViewFldMap = new SchemaTableViewFldMap();
              choosenField.order = index;
              choosenField.fieldId = header;
              orderFld.push(choosenField);
            }
          });
          const schemaTableViewRequest: SchemaTableViewRequest = new SchemaTableViewRequest();
          schemaTableViewRequest.schemaId = this.schemaId;
          schemaTableViewRequest.variantId = this.variantId ? this.variantId: '0';
          schemaTableViewRequest.schemaTableViewMapping = orderFld;
          this.schemaDetailsService.updateSchemaTableView(schemaTableViewRequest).subscribe(response => {
            console.log(response);
          }, error => {
            console.error('Exception while persist table view');
          });
          this.selectedFields = orderFld;
        } else {
          this.selectedFields = res[1] ? res[1] : [];
        }
        this.calculateDisplayFields();
      }
    });

    /**
     * After filter applied should call for get data
     */
    this.filterCriteria.subscribe(res => {
      if (res !== null) {
        this.getData(res, this.sortOrder);
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

    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(re => {
      this.userDetails = re;
    }, err => console.error(`Error ${err.error}`));
  }

  /**
   * Get schema info ..
   */
  getSchemaDetails() {
    const sub = this.schemaListService.getSchemaDetailsBySchemaId(this.schemaId).subscribe(res => {
      this.schemaInfo = res;
    }, error => console.error(`Error : ${error.message}`));
    this.subscribers.push(sub);
  }


  /**
   * Call service for get schema statics based on schemaId and latest run
   */
  getSchemaStatics() {
    const sub = this.schemaService.getSchemaThresholdStatics(this.schemaId, this.variantId).subscribe(res => {
      this.statics = res;
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscribers.push(sub);
  }

  /**
   * Get schema variant details ..
   */
  getVariantDetails() {
    const sub = this.schemaVariantService.getVariantdetailsByvariantId(this.variantId, this.userDetails.currentRoleId, this.userDetails.plantCode, this.userDetails.userName).subscribe(res => {
      if (res) {
        const finalFiletr: FilterCriteria[] = [];
        const inline = res.filterCriteria.filter(fil => fil.fieldId === 'id')[0];
        if (inline) {
          this.preInpVal = inline.values ? inline.values.toString() : '';
          finalFiletr.push(inline);
        }
        res.filterCriteria.forEach(fil => {
          const filter: FilterCriteria = new FilterCriteria();
          filter.fieldId = fil.fieldId;
          filter.type = fil.type;
          filter.values = fil.values;

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
    }, error => {
      console.error(`Error : ${error.message}`);
    });
    this.subscribers.push(sub);
  }


  /**
   * Get all fld metada based on module of schema
   */
  getFldMetadata() {
    if (this.moduleId === undefined || this.moduleId.trim() === '') {
      throwError('Module id cant be null or empty');
    }
    const sub = this.schemaDetailService.getMetadataFields(this.moduleId).subscribe(response => {
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
    const allMDF = this.metadata.getValue();
    const fields = [];
    const select = [];
    const metadataLst: any = {};
    this.startColumns.forEach(col => fields.push(col));
    for (const headerField in allMDF.headers) {
      if (allMDF.headers.hasOwnProperty(headerField)) {
        // if selectedFields is blank then load all fields
        // if(fields.indexOf(headerField) < 0 && this.selectedFields.length === 0) {
        //   select.push(headerField);
        // }
        // else
        const index = this.selectedFields.findIndex(f => f.fieldId === headerField);
        if (fields.indexOf(headerField) < 0 && (index !== -1)) {
          select[index] = headerField;
        }
        metadataLst[headerField] = allMDF.headers[headerField];
      }
    }
    // TODO for hierarchy and grid logic ..
    this.metadataFldLst = metadataLst;
    select.forEach(fldId => fields.push(fldId));
    this.displayedFields.next(fields);
  }


  /**
   * Get table data from service ..
   * @param filterCriteria have default filter or apply filter as request...
   * @param sort apply some sorting on column ..
   */
  getData(filterCriteria?: FilterCriteria[], sort?: any, fetchCount?: number, isLoadMore?: boolean) {
    const request: RequestForSchemaDetailsWithBr = new RequestForSchemaDetailsWithBr();
    request.schemaId = this.schemaId;
    request.variantId = this.variantId;
    request.fetchCount = fetchCount ? fetchCount : 0;
    request.fetchSize = 20;
    request.requestStatus = this.activeTab ? this.activeTab : 'error';
    request.filterCriterias = filterCriteria;
    request.sort = sort;
    request.isLoadMore = isLoadMore ? isLoadMore : false;
    this.dataSource.getTableData(request);
  }


  /**
   * Navigate particular tab by tab status
   * @param status get tab name to navigate
   */
  changeTabStatus(status: string) {
    this.fetchCount = 0;
    if (this.activeTab === status) {
      console.log('Already loaded for tab {}', status)
      return false;
    }
    this.activeTab = status;
    this.selection.clear();
    this.router.navigate(['/home/schema/schema-details', this.moduleId, this.schemaId], { queryParams: { status: this.activeTab } });

    // update state of columns
    this.calculateDisplayFields();

    // if(status === 'error' || status === 'success') {
    //   this.getData(this.filterCriteria.getValue(), this.sortOrder);
    // } else {
    //   this.getData();
    // }
  }

  /**
   * Oen choose column side sheet ..
   */
  openTableColumnSettings() {
    const data ={schemaId: this.schemaId,variantId: this.variantId, fields: this.metadata.getValue(),
      selectedFields:this.selectedFields, editActive: true};
    this.sharedServices.setChooseColumnData(data);
    this.router.navigate(['', { outlets: { sb: 'sb/schema/table-column-settings' }} ], {queryParamsHandling: 'preserve'});
  }

  /**
   * Method for download error or execution logs
   */
  downloadExecutionDetails() {
    const downloadLink = document.createElement('a');
    downloadLink.href = this.endpointservice.downloadExecutionDetailsUrl(this.schemaId, this.activeTab === 'review' ? this.activeTab : 'all') + '?runId=';
    downloadLink.setAttribute('target', '_blank');
    document.body.appendChild(downloadLink);
    downloadLink.click();

  }



  /**
   * After value change on text input
   * @param value current value after change on
   */
  inlineSearch(value: string) {
    debounceTime(1000);
    const filterCValue = this.filterCriteria.getValue() ? this.filterCriteria.getValue() : [];
    const haveInline = filterCValue.filter(fil => fil.type === 'INLINE')[0];
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
      console.log('Load more data here ...');
      this.fetchCount++;
      this.getData(this.filterCriteria.getValue(), this.sortOrder, this.fetchCount, true);
    }
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }


  /**
   *
   * @param type type of request is inline or submit all
   * @param row if request  type is inline then submit single rec ..
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
    this.schemaDetailService.approveCorrectedRecords(this.schemaId, id, this.userDetails.currentRoleId).subscribe(res => {
      if (res && res.acknowledge) {
        this.getData();
        this.selection.clear();
      }
    }, error => {
      this.snackBar.open(`Error :: ${error}`, 'Close', { duration: 2000 });
      console.error(`Error :: ${error.message}`);
    });
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
    this.schemaDetailService.resetCorrectionRecords(this.schemaId, this.schemaInfo.runId, id).subscribe(res => {
      if (res && res.acknowledge) {
        this.schemaInfo.correctionValue = res.count ? res.count : 0;
        this.getData();
        this.selection.clear();
      }
    }, error => {
      this.snackBar.open(`Error :: ${error}`, 'Close', { duration: 2000 });
      console.error(`Error :: ${error.message}`);
    });

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
    this.filterCriteria.next([]);
    this.preInpVal = '';
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
      this.variantName = this.variantId === '0' ? 'Entire dataset'
        : this.dataScope.find(v => v.variantId === this.variantId).variantName;
      if (this.variantId !== '0') {
        this.getVariantDetails();
      } else {
        this.filterCriteria.next([]);
      }
    }
  }

  /**
   * Get data scopes .. or variats ...
   */
  getDataScope(activeVariantId?: string) {
    const sub = this.schemavariantService.getDataScope(this.schemaId, 'RUNFOR').subscribe(res => {
      this.dataScope = res;
      if(activeVariantId) {
        this.variantChange(activeVariantId);
      }
    }, err => console.error(`Exception : ${err.message}`));
    this.subscribers.push(sub);
  }

  /**
   * get input type when user edits a cell
   * @param fieldId the field id
   */
  getFieldInputType(fieldId) {

    if (this.metadataFldLst[fieldId].picklist === '0' && this.metadataFldLst[fieldId].dataType === 'NUMC') {
      return this.FIELD_TYPE.NUMBER;
    }
    if (this.metadataFldLst[fieldId].picklist === '0' && (this.metadataFldLst[fieldId].dataType === 'DATS' || this.metadataFldLst[fieldId].dataType === 'DTMS')) {
      return this.FIELD_TYPE.DATE;
    }
    if ((this.metadataFldLst[fieldId].isCheckList === 'false')
      && (this.metadataFldLst[fieldId].picklist === '1' || this.metadataFldLst[fieldId].picklist === '30' || this.metadataFldLst[fieldId].picklist === '37')) {
      return this.FIELD_TYPE.SINGLE_SELECT;
    }
    if ((this.metadataFldLst[fieldId].isCheckList === 'true')
      && (this.metadataFldLst[fieldId].picklist === '1' || this.metadataFldLst[fieldId].picklist === '30' || this.metadataFldLst[fieldId].picklist === '37')) {
      return this.FIELD_TYPE.MULTI_SELECT;
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
      return value.toString();
    }
    return value && value !== 'null' ? value : '';
  }


  /**
   * Help to generate / create cross module ..
   * @param row get selected row data
   */
  generateCrossEntry(row: any, crossbrId?) {
    const tragetFld = this.dataSource ? this.dataSource.targetField : '';
    if (!tragetFld) {
      throwError('Tragetfield cant be null or empty ');
    }
    const objNr = row && row.OBJECTNUMBER ? row.OBJECTNUMBER.fieldData : '';
    if (!objNr) {
      throwError(`Objectnumber must be required !!!`);
    }
    const sub = this.schemaDetailService.generateCrossEntry(this.schemaId, this.moduleId, objNr, crossbrId || '').subscribe(res=>{
      if(res) {
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
        const doCorrectionRequest =  this.schemaDetailService.doCorrection(this.schemaId, request).subscribe(r => {
          if (r.acknowledge) {
            this.schemaInfo.correctionValue = r.count ? r.count : 0;
          }
        }, error => {
          this.snackBar.open(`Something went wrong `, 'Close', { duration: 2000 });
          console.error(`Error :: ${error.message}`);
        });
        this.subscribers.push(doCorrectionRequest);
      } else {
        this.snackBar.open(`Something went wrong `, 'Close', { duration: 2000 });
      }
    }, error => { console.error(`Exception while generating coss module .. ${error.message}`) });
    this.subscribers.push(sub);
  }



  /**
   *
   * @param fldid editable field id
   * @param row entire row should be here
   */
  editCurrentCell(fldid: string, row: any, rIndex: number, containerRef: ContainerRefDirective) {

    const field = this.selectedFields.find(f => f.fieldId === fldid);
    if (field && !field.editable) {
      console.log('Edit is disabled for this field ! ', fldid);
      return;
    }

    if (document.getElementById('inpctrl_' + fldid + '_' + rIndex)) {
      const inpCtrl = document.getElementById('inpctrl_' + fldid + '_' + rIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_' + fldid + '_' + rIndex) as HTMLSpanElement;
      // const inpValCtrl = document.getElementById('inp_'+ fldid + '_' + rIndex) as HTMLInputElement;

      inpCtrl.style.display = 'block';
      // inpValCtrl.focus();
      viewCtrl.style.display = 'none';

      // add a dynamic cell input component
      this.addDynamicInput(fldid, row, rIndex, containerRef);

    }
  }

  /**
   * After value change on & also call service for do correction
   * @param fldid fieldid that have blur triggered
   * @param value current changed value
   * @param row row data ..
   */
  emitEditBlurChng(fldid: string, value: any, row: any, rIndex: number, viewContainerRef?: ViewContainerRef) {
    console.log(value);
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
        const request: SchemaCorrectionReq = { id: [objctNumber], fldId: fldid, vc: value, isReviewed: null } as SchemaCorrectionReq;
        this.schemaDetailService.doCorrection(this.schemaId, request).subscribe(res => {
          // row[fldid].fieldData = value;
          if (res.acknowledge) {
            this.statics.correctedCnt = res.count ? res.count : 0;
          }
        }, error => {
          this.snackBar.open(`Error :: ${error}`, 'Close', { duration: 2000 });
          console.error(`Error :: ${error.message}`);
        });
      } else {
        console.error(`Wrong with object number or can't change if old and new same  ... `);
      }
    }

  }

  addDynamicInput(fldid: string, row: any, rIndex: number, containerRef: ContainerRefDirective) {

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      TableCellInputComponent
    );

    // add the input component to the cell
    const componentRef = containerRef.viewContainerRef.createComponent(componentFactory);
    // binding dynamic component inputs/outputs
    componentRef.instance.fieldId = fldid;
    componentRef.instance.inputType = this.getFieldInputType(fldid);
    componentRef.instance.value = row[fldid] ? row[fldid].fieldData : '';
    componentRef.instance.inputBlur.subscribe(value => this.emitEditBlurChng(fldid, value, row, rIndex, containerRef.viewContainerRef));

  }

  /**
   * Function to open data scope side sheet
   */
  openDataScopeSideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/data-scope/${this.moduleId}/${this.schemaId}/new/sb` } }], {queryParamsHandling: 'preserve'})
  }

  /**
   * Function to open summary side sheet of schema
   */
  openSummarySideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}` } }], {queryParamsHandling: 'preserve'})
  }

  /**
   * Function to open trend execution side sheet
   */
  openExecutionTrendSideSheet() {
    this.router.navigate(['', { outlets: { sb: `sb/schema/execution-trend/${this.moduleId}/${this.schemaId}/${this.variantId}` } }], {queryParamsHandling: 'preserve'})
  }

  /**
   * get already saved schema actions
   */
  getSchemaTableActions() {
    this.schemaDetailService.getTableActionsBySchemaId(this.schemaId).subscribe(actions => {
      console.log(actions);
      if(actions && actions.length) {
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
    console.log('Action selected ', action);
    if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE && (this.isReviewer || this.isApprover)) {
      this.approveRecords('inline', row);
    } else if (!action.isCustomAction && action.actionCode === STANDARD_TABLE_ACTIONS.REJECT && (this.isReviewer || this.isApprover)) {
      this.resetRec(row, 'inline');
    } else {
      this.generateCrossEntry(row, action.refBrId);
    }
  }

  get isGlobalActionsEnabled() {
    return this.selection.selected.some(row => !row.OBJECTNUMBER.isReviewed);
  }

  /**
   * check if the user is allowed to make an action
   * @param action action to be performed
   */
  hasActionPermission(action: SchemaTableAction) {
    if (action.actionCode === STANDARD_TABLE_ACTIONS.APPROVE) {
      return this.isReviewer || this.isApprover;
    }

    if (action.actionCode === STANDARD_TABLE_ACTIONS.REJECT) {
      return this.isReviewer || this.isApprover;
    }

    return true;

  }

}
