import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FieldMetaData, ObjectType } from '@models/core/coreModel';
import {
  ColumnSortDirection,
  FilterCriteria,
  ListPageFilters,
  ListPageViewDetails,
  ListSearchEntry,
  ViewsPage
} from '@models/list-page/listpage';
import { Userdetails } from '@models/userdetails';
import { PackageType, PublishPackage, PublishToConnekthubComponent } from '@modules/connekthub';
import { DeleteReasonDialogComponent } from '@modules/shared/_components/delete-reason-dialog/delete-reason-dialog.component';
import { ResizableColumnDirective } from '@modules/shared/_directives/resizable-column.directive';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { DeleteRecordsPayload, FlowAndFormDetails } from '@modules/transaction/model/transaction';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { CoreService } from '@services/core/core.service';
import { DateTimeHelperService } from '@services/date-time-helper.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { IntrojsService } from '@services/introjs/introjs.service';
import { ListService } from '@services/list/list.service';
import { UserService } from '@services/user/userservice.service';
import { sortBy } from 'lodash';
import { TransientService } from 'mdo-ui-library';
import * as moment from 'moment';
import { BehaviorSubject, concat, forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, skip, take, takeUntil } from 'rxjs/operators';
import { FilterSaveModalComponent } from '../filter-save-modal/filter-save-modal.component';
import { ListDataSource } from './list-data-source';

@Component({
  selector: 'pros-list-datatable',
  templateUrl: './list-datatable.component.html',
  styleUrls: ['./list-datatable.component.scss']
})
export class ListDatatableComponent implements OnInit, OnDestroy {
  @ViewChildren(ResizableColumnDirective, { read: ElementRef }) columnsList: QueryList<ElementRef>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('table') table: MatTable<any>;

  /**
   * hold current module id
   */
  @Input() moduleId: string;

  dataExist = true;

  /**
   * hold the tenant id
   */
  tenantId: string;

  /**
   * Hold current module details
   */
  objectType: ObjectType = { objectdesc: '', objectid: 0, objectInfo: '' };

  /**
   * hold current view
   */
  currentView: ListPageViewDetails = new ListPageViewDetails();

  /**
   * isReport list
   */
  @Input() isReport = false;

  /**
   * All static
   */
  staticFields: Array<{ fieldId: string; description: string; picklist?: string }> = [
    { fieldId: 'DATECREATED', description: 'Created on', picklist: '52' }, // created on
    { fieldId: 'DATEMODIFIED', description: 'Modified on', picklist: '52' }, // modified on
    { fieldId: 'USERCREATED', description: 'Created by' }, // created by
    { fieldId: 'USERMODIFIED', description: 'Modified by' }, // modified by
    { fieldId: 'STATUS', description: 'Status' }
  ]; // status

  /**
   * Default view to display if there is no configured view
   */
  defaultView = {
    viewId: 'default',
    viewName: 'Default view',
    isSystemView: false,
    fieldsReqList: [
      { fieldId: 'DATECREATED' }, // create on
      { fieldId: 'DATEMODIFIED' }, // modified on
      { fieldId: 'USERCREATED' }, // created by
      { fieldId: 'USERMODIFIED' }, // modified by
      { fieldId: 'STATUS' } // status
    ]
  } as ListPageViewDetails;

  /**
   * hold views list
   */
  viewsList: ViewsPage = new ViewsPage();

  /**
   * for views list paging
   */
  viewsPageIndex = 0;

  /**
   * default datatable page size
   */
  recordsPageSize = 50;

  /**
   * Hold total records count
   */
  totalCount = 0;

  /**
   * Flag for show hide global filter sections
   */
  showGlobalFilter = false;

  /**
   * for table records paging
   */
  recordsPageIndex = 1;

  /**
   * Saved search has pagination
   */
  savedSearchPageIndex = 0;
  /**
   * Saved search pagesize is 10 or less
   */
  savedSearchPageSize = 10;
  /**
   * Saved search has more data till endpoint return [].
   */
  savedSearchHasMoreData = true;
  /**
   * saved seach get call is running now
   */
  infinteScrollLoading = false;

  staticColumns: string[] = ['_select', '_settings', 'OBJECTNUMBER'];

  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject(this.staticColumns);

  inlineFilterColumns: BehaviorSubject<string[]> = new BehaviorSubject(
    this.staticColumns.map((col) => `${col}_filter`)
  );

  dataSource: ListDataSource;

  selection = new SelectionModel<any>(true, []);

  subscriptionsList: Subscription[] = [];
  dataRefSubscription: Subscription;
  metadataFldLst: FieldMetaData[] = [];

  filtersList: ListPageFilters = new ListPageFilters();
  savedFilters: Partial<ListPageFilters>[] = [];
  selectedSavedFilters: Partial<ListPageFilters> = null;

  isPageRefresh = true;

  globalSearchControl: FormControl = new FormControl('');

  searchHistory: ListSearchEntry[] = [];

  bannerErrorText = '';
  bannerSuccessText = '';
  isFromSideSheet = '';
  selectedData;

  selectedFilters = [];

  limit = 3;

  selectedFilter: FilterCriteria;

  changedFilterValue = [{ fieldId: '', values: [] }];

  changedFilterDateObj = [];

  isFilterValueChanged = false;
  isDateFilter = false;

  dateFormat = 'dd/MM/YYYY'; // User Configured Date Format, default it to dd/MM/YYYY

  private readonly dialofConfig = {
    disableClose: true,
    width: '600px',
    minHeight: '250px'
  };

  dateFilterUpdated = false;

  displayedRecordsRangeValue = '';

  openFilterSideSheet = false;

  @ViewChild('historyEntriesTrigger', { read: MatAutocompleteTrigger }) searchHisTrigger: MatAutocompleteTrigger;
  flowList: Observable<FlowAndFormDetails> = of({ flows: [], forms: [] });
  flowSearchControl: FormControl = new FormControl('');

  showSkeleton = false;
  isLoaderAvailable = true;
  dataSourceHasData = false;
  // store user location
  userLocation: string;

  constructor(
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private sharedServices: SharedServiceService,
    private listService: ListService,
    private coreService: CoreService,
    private glocalDialogService: GlobaldialogService,
    private matDialog: MatDialog,
    private dateTimeHelper: DateTimeHelperService,
    private transitenService: TransientService,
    private userService: UserService,
    private coreCrudService: CoreCrudService,
    private schemaService: SchemaService,
    private introjsService: IntrojsService,
    private ngZone: NgZone,
    @Inject(LOCALE_ID) public locale: string,
    private dialogRef: MatDialogRef<DeleteReasonDialogComponent>
  ) {
    this.initializeDataSource();
  }

  initializeDataSource() {
    this.dataSource = new ListDataSource(this.listService);
    this.dataSource.$loading.subscribe((loading) => {
      this.showSkeleton = loading;
      if (!loading) {
        this.updateTableStyling();
      }
    });
    this.dataSource.connect(null).subscribe((data) => {
      this.dataSourceHasData = !!data?.length;
      if (this.table && !this.showSkeleton && data?.length) {
        this.updateTableStyling();
      }
    });
  }

  /**
   * use this method to update the UI after dynamic columns are displayed
   */
  updateTableStyling() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => {
      this.table?.updateStickyColumnStyles();
      this.table?.updateStickyHeaderRowStyles();
      this.table?.updateStickyFooterRowStyles();
    });
  }

  ngOnInit(): void {
    this.selection.changed.subscribe(() => {
      this.updateTableStyling();
    });
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.subscriptionsList.push(
      this.coreService.updateDatasetView$.subscribe((data) => {
        if (data) {
          this.viewsList = new ViewsPage();
          this.currentView = new ListPageViewDetails();
          this.searchHistory = [];
          this.globalSearchControl.reset('', { emitEvent: false });
          this.resetViewValues();
          this.coreService.nextUpdateDatasetView(false);
        }
      })
    );

    this.activatedRouter.params.subscribe((params) => {
      this.initializeDataSource();
      this.dataSource.reset();
      this.viewsPageIndex = 0;
      this.recordsPageIndex = 0;
      this.totalCount = 0;
      this.viewsList = new ViewsPage();
      if (!this.isReport) {
        this.currentView = new ListPageViewDetails();
      }
      this.searchHistory = [];
      this.globalSearchControl.reset('', { emitEvent: false });
      this.moduleId = params.moduleId ? params.moduleId : this.moduleId;
      this.dataExist = params.moduleId !== 'new';
      this.isLoaderAvailable = this.dataExist;
      if (this.dataExist) {
        this.resetViewValues();
        this.updateCurrentModuleIdSubject(+this.moduleId);
        this.getObjectTypeDetails();
        this.getViewsList();
        this.getSearchHistory();
        this.savedFilters = [];
        this.getSavedFilters();
      }
      // this.getFlowListOptions();
    });

    this.activatedRouter.queryParams
      .pipe(
        map((params) => {
          if (params.f) {
            try {
              const filters = JSON.parse(atob(params.f));
              if (params.vid) {
                filters.vid = params.vid;
              }
              if (params?.filterSideSheetClosed === 'true') {
                this.openFilterSideSheet = false;
              }
              return filters;
            } catch (err) {
              console.error(err);
              return new ListPageFilters();
            }
          } else if (params.ss) {
            return params;
          } else {
            return new ListPageFilters();
          }
        })
      )
      .subscribe((filters) => {
        this.isFromSideSheet = filters.ss;
        this.subscribeEvent();
        if (!filters.ss) {
          this.filtersList = filters;
          this.selectedFilters = [...this.filtersList.filterCriteria];
          console.log(this.filtersList);
          if (!this.isPageRefresh && !this.openFilterSideSheet && this.currentView.viewId) {
            this.mapFilterValues(true, true);
          }
          this.isPageRefresh = false;
        }
      });

    this.sharedServices.getViewDetailsData().subscribe((resp) => {
      if (resp && resp.isUpdate) {
        this.currentView = resp.viewDetails;
        this.updateTableColumns();
      } else {
        this.getViewsList();
      }
    });

    this.globalSearchControl.valueChanges.pipe(debounceTime(1), distinctUntilChanged()).subscribe((searchTxt) => {
      console.log(searchTxt);
      if (searchTxt) {
        this.showGlobalFilter = true;
        setTimeout(() => this.searchHisTrigger.closePanel(), 1);
      } else if (this.searchHistory && this.searchHistory.length) {
        setTimeout(() => this.searchHisTrigger.openPanel(), 1);
      }
    });

    this.subscriptionsList.push(
      this.sharedServices.getRefreshListPage.pipe(debounceTime(500)).subscribe((res) => {
        if (res) {
          this.mapFilterValues(true, true);
        }
      })
    );

    this.userService.getUserDetails().subscribe((resp: Userdetails) => {
      this.tenantId = resp.plantCode;
      if (resp.dateformat) this.dateFormat = resp.dateformat;
    });

    this.flowSearchControl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchTxt) => {
      this.getFlowListOptions('1', searchTxt);
    });
  }

  resetViewValues() {
    this.dataSource.reset();
    this.viewsPageIndex = 0;
    this.recordsPageIndex = 0;
    this.totalCount = 0;
    this.displayedRecordsRangeValue = '';
  }

  subscribeEvent() {
    // dataRefSubscription
    if (this.isFromSideSheet === 'true' && !this.dataRefSubscription) {
      this.dataRefSubscription = this.sharedServices.getModuleListData.pipe(take(1)).subscribe((val) => {
        if (val.fromType === 'dataRef') this.selectedData = val.data;
      });
    }
  }

  updateCurrentModuleIdSubject(moduleId: number) {
    this.coreService.nextUpdateCurrentModuleId(moduleId);
  }

  /**
   * get available views list
   */
  getViewsList(loadMore?) {
    if (loadMore) {
      this.viewsPageIndex++;
    } else {
      this.viewsPageIndex = 0;
    }
    const sub = this.listService.getAllListPageViews(this.moduleId, this.viewsPageIndex).subscribe(
      (views) => {
        if (views && ((views.userViews && views.userViews.length) || (views.systemViews && views.systemViews.length))) {
          if (loadMore) {
            this.viewsList.userViews = this.viewsList.userViews.concat(views.userViews || []);
            this.viewsList.systemViews = this.viewsList.systemViews.concat(views.systemViews || []);
          } else {
            this.viewsList = views;
            this.viewsList.userViews.push({
              default: false,
              viewId: 'default',
              viewName: 'Default view'
            });
            const defaultViewId = this.getDefaultViewId();
            this.getViewDetails(defaultViewId);
          }
        } else if (!loadMore) {
          this.currentView = this.defaultView;
          this.updateTableColumns();
        } else {
          this.viewsPageIndex--;
        }
      },
      (error) => {
        console.error(`Error :: ${error.message}`);
        if (!loadMore) {
          this.currentView = this.defaultView;
          this.updateTableColumns(true);
        }
      }
    );

    this.subscriptionsList.push(sub);
  }

  /**
   * get view details by id
   */
  getViewDetails(viewId, isGetTableData?) {
    if (viewId === this.currentView.viewId) {
      return;
    } else if (viewId !== 'default') {
      this.resetViewValues();
      const view = this.userViews.concat(this.systemViews).find((v) => v.viewId === viewId);
      const defaultViewObs =
        view && !view.default
          ? this.listService.updateDefaultView(this.moduleId, viewId).pipe(catchError((err) => of(viewId)))
          : of(viewId);
      const sub = concat(defaultViewObs, this.listService.getListPageViewDetails(viewId, this.moduleId))
        .pipe(skip(1))
        .subscribe(
          (response) => {
            this.currentView = response;
            this.currentView.fieldsReqList = sortBy(this.currentView.fieldsReqList, 'fieldOrder');
            this.updateTableColumns(true);

            const queryParams: Params = { vid: viewId };
            this.router.navigate([], {
              queryParams,
              queryParamsHandling: 'merge',
              preserveFragment: true
            });
          },
          (error) => {
            console.error(`Error : ${error.message}`);
          }
        );
      this.subscriptionsList.push(sub);
    } else if (viewId === 'default') {
      this.resetViewValues();
      this.currentView = this.defaultView;
      this.updateTableColumns(true);
    }
  }

  /**
   * delete a view
   * @param viewId to delete
   */
  deleteView(viewId: string) {
    if (!viewId || viewId === 'default') {
      return;
    }

    this.transitenService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: 'Confirmation message text' },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel'
      },
      (response) => {
        if (response === 'yes') {
          this.listService.deleteListPageView(viewId, this.moduleId).subscribe(
            () => {
              this.currentView = this.defaultView;
              this.updateTableColumns(true);
            },
            (error) => {
              console.error(`Error :: ${error.message}`);
            }
          );
        }
      }
    );

    // this.glocalDialogService.confirm({ label: 'Are you sure to delete ?' }, (resp) => {
    //   if (resp && resp === 'yes') {
    //     const sub = this.listService.deleteListPageView(viewId, this.moduleId).subscribe(
    //       (response) => {
    //         this.currentView = this.defaultView;
    //         this.updateTableColumns(true);
    //       },
    //       (error) => {
    //         console.error(`Error :: ${error.message}`);
    //       }
    //     );

    //     this.subscriptionsList.push(sub);
    //   } else {
    //     return null;
    //   }
    // });
  }

  /**
   * Get all fld metada based on module of schema
   */
  getFldMetadata(fieldsList: string[]) {
    if (!fieldsList || !fieldsList.length || this.currentView.viewId === 'default') {
      this.metadataFldLst = [];
      return;
    }
    this.locale = 'en';
    this.recordsPageSize = 0;
    const sub = this.coreService.getMetadataByFields(this.moduleId, 0, '', this.recordsPageSize, this.locale).subscribe(
      (response) => {
        this.metadataFldLst = response;
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  /**
   * get current module details
   */
  getObjectTypeDetails() {
    const sub = this.coreService.getEditObjectTypeDetails(this.moduleId).subscribe(
      (response: any) => {
        /* this.objectType.objectid = response.moduleid; */
        this.objectType.objectInfo = response.moduleDescriptionMap[this.locale][0].information;
        this.objectType.objectdesc = response.moduleDescriptionMap[this.locale][0].description;
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  /**
   * get total records count
   */
  getTotalCount() {
    this.mapFilerValues().subscribe((data) => {
      const subs = this.listService.getDataCount(this.moduleId, data).subscribe(
        (count) => {
          this.totalCount = count;
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
      this.subscriptionsList.push(subs);
    });
  }

  getSavedFilters() {
    this.listService
      .getSavedFilters(this.moduleId, this.savedSearchPageIndex)
      .pipe(take(1))
      .subscribe((resp) => {
        if (resp.length > 0) {
          this.savedSearchHasMoreData = true;
          this.savedFilters.push(...resp);
        } else {
          this.savedSearchHasMoreData = false;
        }
        this.infinteScrollLoading = false;
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.docLength();
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.docValue().forEach((row) => this.selection.select(row));
    this.updateTableStyling();
  }

  isCheckboxSelected(element) {
    if (this.selectedData && this.selectedData.length > 0 && this.isFromSideSheet === 'true') {
      const dialogOptInd = this.selectedData.findIndex((obj) => obj.id === element.OBJECTNUMBER.fieldData);
      if (dialogOptInd !== -1) {
        this.selection.select(element);
        this.selectedData.splice(dialogOptInd, 1);
      }
    }
    return this.selection.isSelected(element);
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  get hasSelectedValue() {
    return !!this.selection?.selected?.length;
  }

  /**
   * open view config sidesheet
   */
  openTableViewSettings(edit?: boolean) {
    this.router.navigate(this.getTableViewSettingURL(edit), {
      queryParamsHandling: 'preserve'
    });
  }

  /**
   * Get Table View Setting URL
   */
  getTableViewSettingURL(edit?: boolean) {
    const url = this.router.url;
    const viewId = edit && this.currentView.viewId ? this.currentView.viewId : 'new';
    if (!url.includes('/outer')) {
      return [{ outlets: { sb: `sb/list/table-view-settings/${this.moduleId}/${viewId}` } }];
    } else {
      return [{ outlets: { sb3: `sb3/list/table-view-settings/${this.moduleId}/${viewId}` } }];
    }
  }

  openDataListObjectSetting() {
    this.router.navigate([{ outlets: { sb: `sb/list/dataset-settings/${this.moduleId}` } }], {
      queryParamsHandling: 'preserve'
    });
  }

  openFieldEditPopup() {
    this.router.navigate(['/home/list/fields', this.moduleId]);
  }

  openTransaction(
    flowId: string,
    layoutId: string,
    openActionType: string,
    docId: string,
    isNoFlows: boolean,
    stepId: string
  ) {
    if (!isNoFlows) {
      let docIdValue = 'new';
      if (openActionType === 'change' || openActionType === 'view' || openActionType === 'copy') {
        docIdValue = docId;
        if (!docId || !docId.trim()) {
          throw new Error(`Object number can't be null or empty`);
        }
      }

      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/transaction/${this.moduleId}/${openActionType}/${flowId}/${layoutId}/${this.moduleId}/${docIdValue}/parent/${stepId}`
            }
          }
        ],
        {
          queryParamsHandling: 'preserve'
        }
      );
    }
  }

  spanValue: number;
  /**
   * update displayed columns on view change
   */
  updateTableColumns(isDefaultview?: boolean) {
    if (this.currentView && this.currentView.fieldsReqList) {
      const fieldsList = this.currentView.fieldsReqList.map((field) => field.fieldId);
      this.getFldMetadata(fieldsList);
      this.recordsPageIndex = 1;
      const activeColumns: string[] = this.currentView.fieldsReqList.map((field) => field.fieldId);
      this.spanValue = new Set(this.staticColumns.concat(activeColumns))?.size - 2;
      this.displayedColumns.next(Array.from(new Set(this.staticColumns.concat(activeColumns))));
      const filterColumns = this.displayedColumns.getValue().map((col) => `${col}_filter`);
      this.inlineFilterColumns.next(filterColumns);

      if (isDefaultview) {
        this.totalCount = 0;
      }
      this.mapFilterValues(true, true);
    }
  }

  /**
   * get table data records
   */
  getTableData() {
    this.selection.clear();
    const viewId = this.currentView.viewId ? this.currentView.viewId : '';
    this.mapFilerValues().subscribe((data) => {
      this.enableSkeleton();
      this.dataSource.getData(this.moduleId, viewId, this.recordsPageIndex, data);
    });
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.mapFilterValues(true, false);
      this.displayedRecordsRange();
    }
  }

  /**
   * get system views list
   */
  get systemViews() {
    return this.viewsList.systemViews || [];
  }

  /**
   * get user views list
   */
  get userViews() {
    return this.viewsList.userViews || [];
  }

  /**
   * get user's default view id
   */
  getDefaultViewId(): string {
    if (this.filtersList.vid) {
      const viewId = this.filtersList.vid;
      this.filtersList.vid = '';
      return viewId;
    }
    const view = this.userViews.concat(this.systemViews).find((v) => v.default);
    return view ? view.viewId : this.userViews.concat(this.systemViews)[0].viewId;
  }

  /**
   * get field description based on field id
   * @param fieldId field id
   * @returns field description
   */
  getFieldDesc(fieldId: string): string {
    const staticField = this.staticFields.find((f) => f.fieldId === fieldId);
    if (staticField) return staticField?.description || 'Unknown';
    const field = this.metadataFldLst.find((f) => f.fieldId === fieldId);
    return field ? field.fieldDescri || 'Unkown' : fieldId || 'Unkown';
  }

  /**
   * check if a column is static
   * @param colId column id
   */
  isStaticCol(colId: string) {
    return this.staticColumns.includes(colId);
  }

  rowHasWarning(row): boolean {
    return row.purchase && row.purchase < 300 ? true : false;
  }

  /**
   * Check if the row has error based on the data
   * @param row pass the row object for analysis
   * @returns boolean
   */
  rowHasError(row): boolean {
    return row.purchase && row.purchase > 800 ? true : false;
  }

  isLargeHeader(fieldId: string) {
    return this.getFieldDesc(fieldId) && this.getFieldDesc(fieldId).length > 50;
  }

  isLargeCell(row: any, fieldId: string) {
    return row[fieldId] && row[fieldId].fieldData && row[fieldId].fieldData.length > 50;
  }

  displayedRecordsRange() {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount
        ? this.recordsPageIndex * this.recordsPageSize
        : this.totalCount;
    this.displayedRecordsRangeValue = this.totalCount
      ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}`
      : '';
  }

  /**
   * update view columns width
   * @param event new column width
   */
  onColumnsResize(event) {
    const column = this.currentView.fieldsReqList.find((c) => c.fieldId === event.columnId);
    if (column && event.width) {
      column.width = `${event.width}`;
    }
  }

  onResizeEnd(event) {
    const sub = this.listService.upsertListPageViewDetails(this.currentView, this.moduleId).subscribe((resp) => {
      console.log(resp);
    });
    this.subscriptionsList.push(sub);
  }

  getColumnWidth(fieldId) {
    const col = this.currentView.fieldsReqList.find((c) => c.fieldId === fieldId);
    return col ? +col.width || 100 : 100;
  }

  /**
   * table width based on displayed columns width
   */
  get tableWidth() {
    let width = this.staticColumns.length * 100;
    this.currentView.fieldsReqList.forEach((col) => {
      width += +col.width || 100;
    });

    return width;
  }

  /**
   * get initial sort direction icon for a column
   * @param fieldId column
   * @returns column sort direction icon
   */
  getColumnActiveSortIcon(fieldId) {
    if (!this.currentView.viewId) {
      return '';
    }
    const col = this.currentView.fieldsReqList.find((f) => f.fieldId === fieldId);
    switch (col.sortDirection) {
      case ColumnSortDirection.asc:
        return 'sort-up';
      case ColumnSortDirection.desc:
        return 'sort-down';
      default:
        return 'sort';
    }
  }

  /**
   * handle table column sort dir change
   * @param fieldId column
   */
  sortDirChanged(fieldId) {
    if (!this.currentView.viewId) {
      console.log('no sort');
      return;
    }
    const col = this.currentView.fieldsReqList.find((f) => f.fieldId === fieldId);
    switch (col.sortDirection) {
      case ColumnSortDirection.asc:
        col.sortDirection = ColumnSortDirection.desc;
        break;
      case ColumnSortDirection.desc:
        col.sortDirection = null;
        break;
      default:
        col.sortDirection = ColumnSortDirection.asc;
        break;
    }
    const sub = this.listService.upsertListPageViewDetails(this.currentView, this.moduleId).subscribe((resp) => {
      this.recordsPageIndex = 1;
      this.mapFilterValues(true, false);
    });
    this.subscriptionsList.push(sub);
  }

  /**
   * check if the column is sortable
   * @param fieldId field id
   * @returns the column is sortable or not
   */
  isSortable(fieldId) {
    return !!this.getColumnActiveSortIcon(fieldId);
  }

  showFilterValue(filter) {
    let filterValue = '';
    if (filter?.unit) {
      if (filter.unit === 'static_date') {
        return moment(+filter.startValue).format('MM/DD/YYYY');
      } else if (filter.unit === 'static_range') {
        return `${moment(+filter.startValue).format('MM/DD/YYYY')} to ${moment(+filter.endValue).format('MM/DD/YYYY')}`;
      } else {
        return filter.unit;
      }
    } else if (filter.fieldType === 'time') {
      const start = moment(+filter.startValue).format('HH:mm');
      const end = moment(+filter.endValue).format('HH:mm');
      return `from ${start} to ${end}`;
    } else if (filter.values.length !== 0) {
      filterValue = this.addFilterChipValues(filter.values);
    }
    return filterValue;
  }

  addFilterChipValues(filterValues) {
    let filterValue = '';
    if (filterValues) {
      let filterValuesList = filterValues.length > 1 ? filterValues : filterValues[0].split(',');
      filterValuesList = filterValuesList.filter((e) => e);
      if (filterValuesList.length !== 0) {
        filterValue = filterValuesList[0];
        if (filterValuesList.length > 1) {
          filterValue += ' + ' + (filterValuesList.length - 1);
        }
      }
    }
    return filterValue;
  }

  removeAppliedFilter(i) {
    this.filtersList.filterCriteria.splice(i, 1);
    this.filtersList.filterCriteria = [...this.filtersList.filterCriteria];
    this.mapFilterValues(true, true);
  }

  /**
   * open filter settings sidesheet
   */
  openFiltersSideSheet() {
    this.openFilterSideSheet = true;
    if (this.filtersList.filterCriteria.length > 0) {
      const filters = btoa(JSON.stringify(this.filtersList));
      this.router.navigate([{ outlets: { sb: `sb/list/filter-settings/${this.moduleId}` } }], {
        queryParams: { f: filters }
      });
    } else {
      this.router.navigate([{ outlets: { sb: `sb/list/filter-settings/${this.moduleId}` } }]);
    }
  }
  openDependencyRuleSideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/list/dependency-rule/${this.moduleId}` } }], {
      queryParamsHandling: 'preserve'
    });
  }

  /**
   * upsert filters
   */
  saveFilterCriterias() {
    const dialogCloseRef = this.matDialog.open(FilterSaveModalComponent, {
      data: { filterName: this.filtersList.description },
      width: '400px'
    });
    dialogCloseRef.afterClosed().subscribe((res) => {
      if (res) {
        this.filtersList.moduleId = this.moduleId;
        this.filtersList.description = res;
        const sub = this.listService.upsertListFilters(this.filtersList).subscribe(
          (resp) => {
            if (resp && resp.filterId) {
              this.filtersList.filterId = resp.filterId;
              this.router.navigate([], { queryParams: { f: btoa(JSON.stringify(this.filtersList)) } });
            }
          },
          (error) => {
            console.error(`Error : ${error.message}`);
          }
        );
        this.subscriptionsList.push(sub);
      }
    });
  }

  hasLimit(): boolean {
    return this.filtersList.filterCriteria.length > this.limit;
  }

  resetAllFilters() {
    this.router.navigate([], { queryParams: {} });
  }

  /**
   * map date filters based on fields metatdata
   * @returns mapped filter criterias
   */
  mapFilerValues(): Observable<any[]> {
    return new Observable((observer) => {
      const criterias = [];
      this.filtersList.filterCriteria.forEach((fc) => {
        if (fc.fieldType !== 'multi-select') {
          if (fc.unit && !['static_date', 'static_range'].includes(fc.unit)) {
            const dateRange = this.dateTimeHelper.dateUnitToDateRange(fc.unit);
            fc.startValue = dateRange.startDate.toString();
            fc.endValue = dateRange.endDate.toString();
          }
          criterias.push(fc);
        }

        if (fc.fieldType === 'multi-select' && fc.values.length !== 0) {
          const filterControlValue = fc.values;
          const fValuesArr = filterControlValue[0].split(',');
          let options = [];
          return this.schemaService.getFieldDropValues(this.moduleId, fc.fieldId, '').subscribe((response) => {
            options = response
              .filter((o1) =>
                fValuesArr.some(
                  (o2) => o1.CODE.toLowerCase() === o2.toLowerCase() || o1.TEXT.toLowerCase() === o2.toLowerCase()
                )
              )
              .map((data) => data.CODE);
            if (options.length > 0) {
              const multiSelectObj = Object.assign({}, fc, {
                values: options
              });
              criterias.push(multiSelectObj);
              observer.next(criterias);
              return of(observer.next(criterias));
            }
          });
        }
        observer.next(criterias);
        return of(observer.next(criterias));
      });
      observer.next(criterias);
    });
  }

  mapFilterValues(isGetTableData: boolean, isGetTableCount: boolean) {
    const simpleField = this.filtersList.filterCriteria?.filter((data) => data.fieldType !== 'multi-select');
    const multiSelect = this.filtersList.filterCriteria?.filter((data) => data.fieldType === 'multi-select');

    const simpleFieldObservables$: Observable<any>[] = [];
    simpleField.forEach((fc) => {
      fc.isUpdated = false;
      if (fc.type !== 'INLINE' && fc.values.length && fc.values.length === 1) {
        fc.values = fc.values[0].split(',');
      }
      if (fc.unit && !['static_date', 'static_range'].includes(fc.unit)) {
        const dateRange = this.dateTimeHelper.dateUnitToDateRange(fc.unit);
        fc.startValue = dateRange.startDate.toString();
        fc.endValue = dateRange.endDate.toString();
      }
      simpleFieldObservables$.push(of(fc));
    });

    const multiSelectFieldObservable$: Observable<any>[] = [];
    multiSelect.forEach((fc) => {
      fc.isUpdated = false;
      if (fc.fieldType === 'multi-select' && fc.values.length !== 0) {
        const filterControlValue = fc.values;
        const fValuesArr = filterControlValue[0].split(',');
        multiSelectFieldObservable$.push(
          this.schemaService.getFieldDropValues(this.moduleId, fc.fieldId, '').pipe(
            take(1),
            map((response) => {
              const options = response
                .filter((o1) =>
                  fValuesArr.some(
                    (o2) => o1.CODE.toLowerCase() === o2.toLowerCase() || o1.TEXT.toLowerCase() === o2.toLowerCase()
                  )
                )
                .map((data) => data.CODE);
              let multiSelectObj = {};
              if (options.length > 0) {
                multiSelectObj = Object.assign({}, fc, {
                  values: options
                });
                return multiSelectObj;
              } else {
                return fc;
              }
            }),
            catchError((err) => of(null))
          )
        );
      }
    });

    if (simpleFieldObservables$.length > 0 || multiSelectFieldObservable$.length > 0) {
      forkJoin([...simpleFieldObservables$, ...multiSelectFieldObservable$])
        .pipe(take(1))
        .subscribe(
          (resp) => {
            this.getTableDataAndCount(isGetTableData, isGetTableCount, resp);
          },
          (err) => {
            console.log('Error:', err);
          }
        );
    } else {
      this.getTableDataAndCount(isGetTableData, isGetTableCount, []);
    }
  }

  getTableDataAndCount(isGetTableData, isGetTableCount, values) {
    const viewId = this.currentView.viewId ? this.currentView.viewId : '';
    if (isGetTableData) {
      this.selection.clear();
      this.enableSkeleton();
      this.dataSource.getData(this.moduleId, viewId, this.recordsPageIndex, values);
    }

    if (isGetTableCount) {
      const subs = this.listService.getDataCount(this.moduleId, values).subscribe(
        (count) => {
          this.totalCount = count;
          this.displayedRecordsRange();
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
      this.subscriptionsList.push(subs);
    }
  }

  /**
   * apply an inline column filter
   * @param filterCriteria filter criteria
   */
  applyInlineFilter(filterCriteria: FilterCriteria) {
    const index = this.filtersList.filterCriteria.findIndex((f) => f.fieldId === filterCriteria.fieldId);
    if (index !== -1) {
      this.filtersList.filterCriteria[index] = filterCriteria;
    } else {
      this.filtersList.filterCriteria.push(filterCriteria);
    }
    this.removedBlankFilterValues();
    const filters = btoa(JSON.stringify(this.filtersList));
    this.router.navigate([{ outlets: { sb: null } }], { queryParams: { f: filters }, queryParamsHandling: 'merge' });
  }

  /**
   * get user global search history
   */
  getSearchHistory() {
    const sub = this.listService.getUserSearchHistory(this.moduleId).subscribe(
      (history) => {
        this.searchHistory = history;
      },
      (err) => {
        console.error(`Error:: ${err.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  /**
   * save a new global search entry
   * @param searchStr search text
   */
  saveSearchEntry(searchStr) {
    const sub = this.listService.saveSearchHistory(this.moduleId, searchStr).subscribe(
      (resp) => {
        console.log(resp);
        const searchEntry = new ListSearchEntry();
        searchEntry.searchString = searchStr;
        searchEntry.objectId = this.moduleId;
        searchEntry.id = resp.id;
        this.searchHistory.splice(0, 0, searchEntry);
        this.searchHistory = this.searchHistory.slice(0, 10);
        console.log(this.searchHistory);
      },
      (err) => {
        console.error(`Error:: ${err.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  /**
   * global search apply history entry
   * @param entryText entry search text
   */
  applyHistoryEntry(entryText) {
    this.globalSearchControl.setValue(entryText);
  }

  selectedFilterChip(filter) {
    this.isDateFilter = filter.unit || filter?.type === 'INLINE' ? true : false;
    this.selectedFilter = filter;
    this.changedFilterValue = [];
    this.changedFilterDateObj = [];
    this.isFilterValueChanged = false;
  }

  updateFilterValue(event) {
    if (event) {
      if (event?.filterType === 'date' || event?.filterType === 'time') {
        const index = this.changedFilterDateObj.findIndex(
          (dfl) => dfl.currentFilter.fieldId === event.currentFilter.fieldId
        );
        index > -1 ? (this.changedFilterDateObj[index] = event) : this.changedFilterDateObj.push(event);
      }
      if (event?.currentFilterValues) {
        const index = this.changedFilterValue.findIndex((dfl) => dfl.fieldId === event.fieldId);
        index > -1
          ? (this.changedFilterValue[index] = { fieldId: event.fieldId, values: event.currentFilterValues })
          : this.changedFilterValue.push({ fieldId: event.fieldId, values: event.currentFilterValues });
        if (event?.type === 'inline-updated') {
          this.changedFilterValue.forEach((data) => {
            if (data.fieldId === event.fieldId) {
              data.values = [...event.currentFilterValues];
            }
          });
        }
      }
    }
  }

  removedBlankFilterValues() {
    this.filtersList.filterCriteria.forEach((data, i) => {
      if (!data.values.length || (data.values.length && data.values[0] === '')) {
        this.filtersList.filterCriteria.splice(i, 1);
      }
    });
  }

  applyFilterChanged() {
    this.filtersList.filterCriteria.forEach((field, i) => {
      this.changedFilterDateObj.forEach((filter) => {
        if (field.fieldId === filter.currentFilter.fieldId) {
          this.filtersList.filterCriteria[i] = filter.currentFilter;
        }
      });
    });

    if (this.changedFilterValue.length !== 0) {
      this.filtersList.filterCriteria.forEach((field) => {
        this.changedFilterValue.forEach((filter) => {
          if (filter.fieldId === field.fieldId) {
            field.values = filter.values;
          }
        });
      });
    }
    this.removedBlankFilterValues();
    this.filtersList.filterCriteria = this.filtersList.filterCriteria.slice();
    this.mapFilterValues(true, true);
  }

  /**
   * upsert a global search filter criteria
   * @param fc filter criteria details
   */
  upsertFilterCriteria(fc: FilterCriteria) {
    this.showGlobalFilter = false;
    if (!fc) {
      return;
    }

    console.log('new global filter ', fc);
    if (
      this.globalSearchControl.value &&
      !this.searchHistory.some((entry) => entry.searchString === this.globalSearchControl.value)
    ) {
      this.saveSearchEntry(this.globalSearchControl.value);
    }

    const filterIndex = this.filtersList.filterCriteria.findIndex((f) => f.fieldId === fc.fieldId);
    if (filterIndex !== -1) {
      this.filtersList.filterCriteria[filterIndex] = fc;
    } else {
      this.filtersList.filterCriteria.push(fc);
    }
    const filters = btoa(JSON.stringify(this.filtersList));
    this.router.navigate([], { queryParams: { f: filters }, queryParamsHandling: 'merge' });
  }

  applyFilter() {
    this.showGlobalFilter = false;
    this.saveSearchEntry(this.globalSearchControl.value);
  }

  onGlobaleSearchFocus() {
    if (!this.globalSearchControl.value) {
      this.searchHisTrigger.openPanel();
    }
  }
  /**
   * opens confirmation dialog before deleting the saved filters
   */
  deleteFilter() {
    if (this.filtersList.filterId) {
      this.glocalDialogService.confirm({ label: $localize`:@@delete_message:Are you sure to delete ?` }, (resp) => {
        if (resp && resp === 'yes') {
          this.deleteFilterById(this.filtersList.filterId);
        } else {
          return null;
        }
      });
    }
  }

  /**
   * Delete selected saved filter
   */
  deleteFilterById(filterId: string) {
    this.listService
      .deleteFilter(filterId)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp && resp.acknowledge) {
          } else {
            this.transitenService.open('Delete failed', 'ok', {
              duration: 2000
            });
          }
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  /**
   * on select of a saved filter reload table data by that filter
   */
  onChangeSelectedSavedFilter(filter: ListPageFilters) {
    this.selectedSavedFilters = filter;
    this.filtersList = filter;
    if (!this.isPageRefresh) {
      this.mapFilterValues(true, true);
    }
    this.isPageRefresh = false;
  }

  resetSavedFilter() {
    if (this.selectedSavedFilters) {
      this.selectedSavedFilters.filterCriteria = [];
      this.filtersList.filterCriteria = [];
      if (!this.isPageRefresh) {
        this.mapFilterValues(true, true);
      }
      this.isPageRefresh = false;
    }
  }

  /**
   * Clear user search history
   */
  // clearSearchHistory() {
  //   const sub = this.listService.clearSearchHistory().subscribe(ack => {
  //     this.getSearchHistory();
  //   }, error => {
  //     console.error(`Error:: ${error.message}`);
  //   });
  //   this.subscriptionsList.push(sub);
  // }

  /**
   * onscroll down of savedfilters menu load more saved filters
   * @param loadMore is from load more
   * @returns a filters details page
   */
  scroll(loadMore: boolean) {
    console.log(loadMore);
    if (!this.infinteScrollLoading && this.savedSearchHasMoreData) {
      if (loadMore) {
        this.savedSearchPageIndex++;
      } else {
        this.savedSearchPageIndex = 0;
      }
      this.infinteScrollLoading = true;
      this.getSavedFilters();
    } else {
      return null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptionsList.forEach((subs) => subs.unsubscribe());
    this.sharedServices.setModuleListData([]);
    this.dataSource.disconnect(null);
  }

  exportDatasetConfirmation() {
    this.transitenService.confirm(
      {
        data: {
          dialogTitle: 'Confirmation',
          label: `Exporting a Dataset will allow the user to download metadata of the dataset in their environments. Please select from the below options to proceed with the process.`
        },
        disableClose: true,
        autoFocus: false,
        width: '700px',
        panelClass: 'create-master-panel'
      },
      (response) => {
        if ('yes' === response) {
          this.exportDataset();
        }
      }
    );
  }

  exportDataset() {
    this.coreService.exportSchema(this.moduleId, this.locale).subscribe(
      (resp) => {
        this.sharedServices.downloadFile(resp, this.objectType.objectdesc || 'Untitled', 'mdoDataset');
        this.transitenService.open('The dataset is now exported!', '', { duration: 2000 });
      },
      (error) => {
        this.bannerErrorText = 'The selected dataset could not be exported. Please try again';
        setTimeout(() => {
          this.bannerErrorText = '';
        }, 5000);
      }
    );
  }

  publishDatasetConfirmation() {
    if (localStorage.getItem('LIB-JWT-TOKEN')) {
      this.publichDatatset();
    } else {
      this.transitenService.confirm(
        {
          data: {
            dialogTitle: 'Publishing to Connekthub',
            label: `ConnektHub authorization is required to publish dataset. Use your credentials to authorize.`
          },
          disableClose: true,
          autoFocus: false,
          width: '700px',
          panelClass: 'create-master-panel'
        },
        (response) => {
          if ('yes' === response) {
            this.publichDatatset();
          }
        }
      );
    }
  }

  publichDatatset() {
    const publishPackage: PublishPackage = {
      id: Number(this.moduleId),
      name: this.objectType?.objectdesc || '',
      brief: this.objectType?.objectdesc || '',
      type: PackageType.DATASET
    };
    this.matDialog
      .open(PublishToConnekthubComponent, {
        data: publishPackage,
        ...this.dialofConfig,
        disableClose: true,
        autoFocus: false,
        minWidth: '765px',
        panelClass: 'create-master-panel'
      })
      .afterClosed()
      .subscribe((dialogData: any) => {
        if (dialogData.successfully) {
          this.bannerSuccessText =
            'Thanks for taking the time to contribute to the community. We will inform you when your dataset is available on the ConnektHub library!';
          setTimeout(() => {
            this.bannerSuccessText = '';
          }, 5000);
        }
        if (dialogData.returnId) {
          this.objectType.packageId = dialogData.returnId;
        }
      });
  }

  saveData() {
    if (this.selection.selected.length > 1) {
      this.bannerErrorText = 'Please select only one value';
      setTimeout(() => {
        this.bannerErrorText = '';
      }, 5000);
    } else {
      if (this.dataRefSubscription) {
        this.dataRefSubscription.unsubscribe();
      }
      this.sharedServices.setModuleListData({ fromType: 'datatable', data: this.selection.selected });
      //this.selection.clear();
      this.selectedData = [];
      this.router.navigate([{ outlets: { outer: null } }], { queryParams: { ss: false }, preserveFragment: true });
    }
  }

  /**
   * Close sidesheet
   */
  close() {
    if (this.dataRefSubscription) {
      this.dataRefSubscription.unsubscribe();
    }
    this.sharedServices.setModuleListData({ fromType: 'datatable', data: this.selection.selected });
    this.selection.clear();
    this.selectedData = [];
    this.router.navigate([{ outlets: { outer: null } }], { queryParams: { ss: false }, preserveFragment: true });
  }

  /**
   * Edit / change the record
   * @param _docId the object number which going to edit ...
   */
  // editRecord(_docId: string) {
  //   if(!_docId || !_docId.trim()) {
  //     throw new Error(`Object number can't be null or empty`);
  //   }
  //   this.router.navigate([{ outlets: { sb: `sb/transaction/${this.moduleId}/change/_0.MaterialCreationprocess/48ce35c7-a8a9-44b1-a47c-dbd24bae6537/${_docId}` } }], {
  //     queryParamsHandling: 'preserve',
  //   });
  // }

  // get User current location
  getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.userLocation =
        'Position' + JSON.stringify({ latitude: position?.coords.latitude, longitude: position.coords.longitude });
    });
  }

  bulkDeletionRecords() {
    let docId = [];
    this.selection?.selected.forEach((e) => {
      docId.push(e?.OBJECTNUMBER?.fieldData);
    });
    this.deleteRecord(docId);
  }

  /**
   * Delete the records
   * @param _docId Record Id to delete
   */
  deleteRecord(_docId: any) {
    this.getLocation();
    this.dialogRef = this.matDialog.open(DeleteReasonDialogComponent, {
      width: '600px'
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result?.value?.toLowerCase() === 'yes') {
        if (!_docId) {
          throw new Error(`Object number can't be null or empty`);
        }
        const payload: DeleteRecordsPayload = {
          moduleId: this.moduleId,
          recordNumbers: [..._docId],
          tenantId: this.tenantId,
          crudDeletionLogsModel: {
            systemInfo: this.userLocation,
            deletionReason: `${result?.reason}`
          }
        };

        this.transitenService.confirm(
          {
            data: { dialogTitle: 'Delete record?', label: `Are you sure you want to delete?` },
            disableClose: true,
            autoFocus: false,
            width: '700px',
            panelClass: 'create-master-panel'
          },
          (response) => {
            if ('yes' === response) {
              this.coreCrudService.deleteMDOCrRecords(payload).subscribe(
                () => {
                  this.initializeDataSource();
                  this.dataSource.reset();
                  this.viewsList = new ViewsPage();
                  if (!this.isReport) {
                    this.currentView = new ListPageViewDetails();
                  }
                  this.searchHistory = [];
                  this.globalSearchControl.reset('', { emitEvent: false });
                  this.isLoaderAvailable = this.dataExist;
                  if (this.dataExist) {
                    this.updateCurrentModuleIdSubject(+this.moduleId);
                    this.getObjectTypeDetails();
                    this.getViewsList();
                    this.getSearchHistory();
                    this.savedFilters = [];
                    this.getSavedFilters();
                  }
                  this.transitenService.open('Record deleted succesfully!!', 'ok', {
                    duration: 2000
                  });
                },
                () => {
                  this.transitenService.open('Some error occured!', 'ok', {
                    duration: 2000
                  });
                }
              );
            }
          }
        );
      }
    });
  }

  /**
   * View / Summary of that record
   * @param _docId the object number which will be visiable as summary
   */
  // viewRecord(_docId: string) {
  //   if (!_docId || !_docId.trim()) {
  //     throw new Error(`Object number can't be null or empty`);
  //   }
  //   this.router.navigate([{ outlets: { sb: `sb/transaction/${this.moduleId}/view/_0.MaterialCreationprocess/48ce35c7-a8a9-44b1-a47c-dbd24bae6537/${_docId}` } }], {
  //     queryParamsHandling: 'preserve',
  //   });
  // }

  /**
   * Open the fields into display  mode ...
   */
  openFieldReadOnlyPopup() {
    this.router.navigate(['/home/list/fields', this.moduleId, 'read-only']);
  }

  /**
   * get values for flow list
   * @param str pass the search string
   */
  getFlowListOptions(eventId: string, searchString?: string): void {
    this.flowList = this.listService.getFlowList(this.moduleId, eventId, searchString);
  }

  /**
   * Open process log sidesheet
   */
  viewProcessLog(referenceNo?: string) {
    if (referenceNo) {
      this.router.navigate([{ outlets: { sb: 'sb/logs/audit-log' } }], {
        queryParams: { mid: this.moduleId, rid: referenceNo },
        queryParamsHandling: 'merge'
      });
    }
  }
  // will be called on clicking plus icon from secondary navbar dataset
  openDatasetPopup() {
    this.sharedServices.setOpenDataset();
  }

  startHelp() {
    this.introjsService.start({
      steps: [
        {
          title: 'Data Tab',
          intro: 'Here, the user can search for a dataset or dataset record or add a new one.'
        },
        {
          title: 'Data Set Search',
          element: document.querySelector('#mat-input-2'),
          intro: 'You can search and select an existing dataset here.'
        },
        {
          title: 'Data Set Search',
          element: document.querySelector('#secondaryContent>pros-list-datatable>div>div>div>div>lib-search'),
          intro:
            'Further, you can search records using the search functionality from the list of records. <br/> Advanced search options allow the you to search for a record by defining their criteria. You can also apply column filters to fetch records based on the input value.'
        },
        {
          title: 'New record',
          element: document.querySelector(
            '#secondaryContent>pros-list-datatable>div>div>lib-button-group>ul>li>lib-button:nth-child(1)>button'
          ),
          intro: 'You can create a new record by selecting the flow applicable for record creation for this dataset.'
        },
        {
          title: 'New record',
          element: document.querySelector(
            '#secondaryContent>pros-list-datatable>div>div>lib-button-group>ul>li>lib-button:nth-child(1)>button'
          ),
          intro:
            'If hierarchy data is enabled in the form, you can add or remove hierarchy data. Furthermore, you can maintain related datasets as defined in the flow.'
        },
        {
          title: 'Change/Edit',
          intro:
            'You can edit an existing record by selecting the flow applicable for record changes for this dataset and make the desired changes to the record.'
        },
        {
          title: 'Details',
          intro:
            'Once a dataset has been imported, you can drill down to view a Summary, Configure view or Audit Log by clicking on the Elipsis (...) of each object.'
        }
      ]
    });
  }

  getFieldType(fieldId) {
    const staticField = this.staticFields.find((f) => f.fieldId === fieldId);
    if (staticField) return this.listService.getFieldType(staticField?.picklist);
    const field = this.metadataFldLst.find((f) => f.fieldId === fieldId);
    return this.listService.getFieldType(field?.picklist);
  }

  formatHtmlCell(text) {
    return text ? text.replace(/<[^>]*>?/gm, '') : '';
  }

  enableSkeleton() {
    if (this.isLoaderAvailable) {
      this.isLoaderAvailable = false;
    }
  }

  /**
   * Exort the data in excel with filter , which help to modify the entiries ...
   */
  _exportExcelAddIn() {
    this.listService.exportExcelAddin(this.moduleId, '', '', this.filtersList.filterCriteria).subscribe(
      (rawData) => {
        this.sharedServices.downloadFile(rawData, this.objectType.objectdesc || 'Untitled', 'xlsx');
        this.transitenService.open('The excel is now exported!', '', { duration: 3000 });
      },
      (err) => {
        this.transitenService.open(`${err?.error?.message || 'Something went wrong !'}`, null, { duration: 5000 });
        console.error(`${err?.error?.message || 'Exception while export data in excel'}`);
      }
    );
  }
}
