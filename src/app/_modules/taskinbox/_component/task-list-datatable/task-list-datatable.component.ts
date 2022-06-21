import { TaskListDataSource } from './task-list-data-source';
import { FilterCriteriaData, FilterDataObject, RequestByList, ResponseBody, TaskListData } from './../../../../_models/task-list/tasklistData';
import { TaskListService } from './../../../../_services/task-list.service';
import { take, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedServiceService } from './../../../shared/_services/shared-service.service';
import { FilterFieldModel, TaskListFilter, ViewsPage } from '@models/list-page/listpage';
import { MatSort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FilterSaveModalComponent } from '@modules/list/_components/filter-save-modal/filter-save-modal.component';
import { RejectModuleComponent } from '../../../../_modules/shared/_components/reject-module/reject-module.component';
import { TransientService } from 'mdo-ui-library';

export const NODEFIELDS: { [node: string]: { fldId: string; fldDesc: string }[] } = {
  inbox: [
    {
      fldId:'REJECT_COMMENTS',
      fldDesc: 'Description'
    },{
      fldId:'RCVD_ON',
      fldDesc: 'Sent'
    },{
      fldId:'DUE_DATE',
      fldDesc: 'Due by'
    },{
      fldId:'USR',
      fldDesc: 'Requested by'
    },
    {
      fldId:'REQ_BY',
      fldDesc: 'Send by'
    }
  ],
  workflow: [
    {
      fldId:'REJECT_COMMENTS',
      fldDesc: 'Description'
    },{
      fldId:'RCVD_ON',
      fldDesc: 'Sent'
    },{
      fldId:'DUE_DATE',
      fldDesc: 'Due by'
    },{
      fldId:'USR',
      fldDesc: 'Requested by'
    },
    {
      fldId:'REQ_BY',
      fldDesc: 'Send by'
    }
  ],
  rejected: [
    {
      fldId:'CR_DESCRIPTION',
      fldDesc: 'Description'
    },
    {
      fldId: 'ISCHILDRECORD',
      fldDesc: 'Child Record'
    },{
      fldId:'CRID',
      fldDesc: 'CR'
    },{
      fldId:'STATUS',
      fldDesc: 'Status'
    },{
      fldId:'EVENTID',
      fldDesc: 'Event'
    },{
      fldId:'MODULEID',
      fldDesc: 'Dataset'
    },{
      fldId:'PROCESSFLOWCONTAINERID',
      fldDesc: 'Process'
    },{
      fldId:'USERCREATED',
      fldDesc: 'User'
    },
  ],
  draft: [
    {
      fldId:'CR_DESCRIPTION',
      fldDesc: 'Description'
    },
    {
      fldId: 'ISCHILDRECORD',
      fldDesc: 'Child Record'
    },{
      fldId:'CRID',
      fldDesc: 'CR'
    },{
      fldId:'STATUS',
      fldDesc: 'Status'
    },{
      fldId:'EVENTID',
      fldDesc: 'Event'
    },{
      fldId:'MODULEID',
      fldDesc: 'Dataset'
    },{
      fldId:'PROCESSFLOWCONTAINERID',
      fldDesc: 'Process'
    },{
      fldId:'USERCREATED',
      fldDesc: 'User'
    },
  ],
  completed: [
    {
      fldId:'REJECT_COMMENTS',
      fldDesc: 'Description'
    },{
      fldId:'RCVD_ON',
      fldDesc: 'Sent'
    },{
      fldId:'DUE_DATE',
      fldDesc: 'Due by'
    },{
      fldId:'USR',
      fldDesc: 'Requested by'
    },
    {
      fldId:'REQ_BY',
      fldDesc: 'Send by'
    }
  ],
  error: [
    { fldId: 'rec_id', fldDesc: 'Rec' },
    { fldId: 'cr_id', fldDesc: 'CR' },
    { fldId: 'req_det', fldDesc: 'Req Det' },
    { fldId: 'labels', fldDesc: 'Labels' },
    { fldId: 'event', fldDesc: 'Event' },
    { fldId: 'mod_name', fldDesc: 'Module Name' },
    { fldId: 'draft_on', fldDesc: 'Draft On' },
    { fldId: 'req_by', fldDesc: 'Request by' },
  ],
};
export interface INodeChips {
  fldId: string;
  value: any[];
  icon?: string;
  type?: string;
  hasMenu: boolean;
  startvalue?: any;
  endvalue?: any;
  operator?: string;
  parentnode?: string;
}
export interface IFilterSettings {
  fldId: string;
  value: any[];
  startvalue: any;
  endvalue: any;
  operator: string;
  parentnode?: string;
}
export const nodeChips: {
  [node: string]: INodeChips[];
} = {
  inbox: [
    {
      fldId: 'Bookmarked',
      value: [2],
      icon: 'star',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Important',
      value: [4],
      icon: 'long-arrow-up',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Due',
      value: [4],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Unread',
      value: [3],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Label',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Sent',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Requestedby',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
  ],
  workflow: [
    {
      fldId: 'Bookmarked',
      value: [2],
      icon: 'star',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Important',
      value: [4],
      icon: 'long-arrow-up',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Unread',
      value: [3],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Label',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Sent',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Requestedby',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
  ],
  rejected: [
    {
      fldId: 'Bookmarked',
      value: [2],
      icon: 'star',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Important',
      value: [4],
      icon: 'long-arrow-up',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Due',
      value: [4],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Unread',
      value: [3],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Sent',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Requestedby',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
  ],
  draft: [
    {
      fldId: 'Bookmarked',
      value: [2],
      icon: 'star',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Important',
      value: [4],
      icon: 'long-arrow-up',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Due',
      value: [4],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Unread',
      value: [3],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Label',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Sent',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
  ],
  completed: [
    {
      fldId: 'Bookmarked',
      value: [2],
      icon: 'star',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Important',
      value: [4],
      icon: 'long-arrow-up',
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Due',
      value: [4],
      hasMenu: false,
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Label',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Sent',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
    {
      fldId: 'Requestedby',
      value: [],
      hasMenu: true,
      type: 'info',
      startvalue: '',
      endvalue: '',
      operator: 'equal',
      parentnode: '',
    },
  ],
};

export const nodeChipsMenuItems: { [fldId: string]: string[] } = {
  Label: ['H', 'He'],
  // Sent: ['Long', 'Short'],
  // Requestedby: ['Fred', 'Shred'],
};
export const lableItems = ['Forwarded', 'Delegated', 'Completed', 'Pending', 'In Progress'];

@Component({
  selector: 'pros-task-list-datatable',
  templateUrl: './task-list-datatable.component.html',
  styleUrls: ['./task-list-datatable.component.scss'],
})
export class TaskListDatatableComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    // 'select',
    // 'setting',
    // 'Records',
    // 'description',
    // 'labels',
    // 'sent',
    // 'dueby',
    // 'requestby',
    // 'sentby',
  ];
  staticColumns: string[] = ['select', 'setting', 'Records'];
  dataSource: TaskListDataSource;
  // dataSource: MatTableDataSource<TaskListData>;
  selection = new SelectionModel<TaskListData>(true, []);
  node: string = null;
  nodeColumns: { fldId: string; fldDesc: string }[] = [];

  currentNodeFilterChips: INodeChips[] = [];
  filteredNodeChipsMenuItems = Object.assign({}, nodeChipsMenuItems);
  currentFilterSettings: FilterFieldModel[] = [];

  pageEvent: { pageIndex: number; pageSize: number; } = {
    pageIndex: 1,
    pageSize: 50
  };
  isLoadingResults = false;

  viewsList: ViewsPage = new ViewsPage();
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  AllLabels = [...lableItems];
  filteredLabels = [...lableItems];
  labelSearchFieldSub: Subject<string> = new Subject();
  sideSheetFilterData: FilterFieldModel[] = [];
  /**
   * Checkbox options list;
   */
  CheckboxOptions = [
    {
      label: 'Select this page',
      value: 'select_this_page',
    },
    {
      label: 'Select all page',
      value: 'select_all_page',
    },
    {
      label: 'Select none',
      value: 'select_none',
    },
  ];
  /**
   * selected row data
   */
  selectedPages = [];
  /**
   * selected row in the table
   */
  selectedRecordsList = [];
  /**
   * default datatable page size
   */
  // recordsPageSize = 5;

  /**
   * Hold total records count
   */
  // totalCount = 0;

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  previousFilterStrVal = '';
  // flowList: Observable<FlowFormDetails[]> = of([]);
  activeFilterId = '';
  requestedByList: Observable<RequestByList[]>
  private readonly dialofConfig = {
    disableClose: true,
    width: '600px',
    minHeight: '250px',
  };
  savedFilterList: Observable<FilterDataObject[]> = of([]);

  get isRowActionVisible () {
    return this.node === 'inbox' || this.node === 'workflow' || this.node === 'rejected' || this.node === 'completed' || this.node === 'draft';
  }

  showSkeleton = false;
  tableHasData = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matDialog: MatDialog,
    private sharedServices: SharedServiceService,
    private taskListService: TaskListService,
    private transientService: TransientService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    this.dataSource = new TaskListDataSource(this.taskListService);
    this.dataSource.$loading.subscribe((isLoading: boolean) => this.showSkeleton = isLoading);
    this.dataSource.connect(null).subscribe((res) => {
      if(!this.tableHasData && !!res.length) {
        this.tableHasData = true;
      }
    })
  }

  /**route param contains the node
   * node - based on node find the columns the table should have
   * node - based on node find the filter chips the page should have
   * queryParam contains the s and f. f is the filter the current table has now
   * only when the page is first time loaded we check if the url has filter setting in URL. thats why checking currentFilterSettings is less than or equal 0
   * atob the f and expect that contains filterSettings. then updateNodeChips is called to update the current page filter chips status
   * shared service gettaskinboxViewDetailsData contains if any user configuration of the table exist. if exist update table columns with that configuration,
   */
  ngOnInit(): void {
    this.dataSource.$loading.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (!resp) {
        this.showSkeleton = false;
      }
    });

    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.route.params.subscribe((param) => {
      this.tableHasData = false;
      this.node = param.node || null;
      this.dataSource.reset();
      // this.totalCount = 0;
      this.currentFilterSettings = [];
      this.nodeColumns = NODEFIELDS[this.node] || [];
      this.getDetailsData();
      // this.updateTableColumns();
      // this.getHeadersForNode(this.node);
      this.updateNodeChips();
      this.saveTasklistVisitByUser(this.node);
      this.activeFilterId = '';
      this.requestedByList = null; // to avoid api call, when when side nav tab switch
    });

    this.route.queryParams.subscribe((queryParam) => {
      this.sideSheetFilterData = [];
      this.currentFilterSettings = [];
      this.updateNodeChips();
      let decoded = '';
      if (queryParam.f) {
        decoded = atob(queryParam.f);
        if (decoded) {
          const decodeArr = JSON.parse(decoded);
          if (decodeArr && decodeArr.length > 0) {
            const filterArr = [...decodeArr.filter(obj => obj.moduleId)];
            if (filterArr && filterArr.length > 0) {
              this.sideSheetFilterData = filterArr;
            }
            const staticFilterArr = [...decodeArr.filter(obj => !obj.moduleId)];
            if (staticFilterArr && staticFilterArr.length > 0) {
              this.currentFilterSettings = staticFilterArr;
              this.updateNodeChips(staticFilterArr);
            }
          }
        }
      }
      if (decoded !== this.previousFilterStrVal) {
        this.previousFilterStrVal = decoded;
        this.getTableData();
      }

    });

    // this.sharedServices
    //   .gettaskinboxViewDetailsData()
    //   .pipe(takeUntil(this.unsubscribeAll$))
    //   .subscribe((resp) => {
    //     if (resp && resp.node === this.node) {
    //       this.nodeColumns = resp.viewDetails;
    //       this.updateTableColumns();
    //     } else {
    //       this.updateTableColumns();
    //     }
    //   });

    this.labelSearchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.filterLabels(searchString);
    });

    // subscribe the sub for refresh the tasklist datables
    this.sharedServices.getRefreshTaskListDatatable().pipe(distinctUntilChanged(), takeUntil(this.unsubscribeAll$)).subscribe(res=>{
      if(res) {
        console.log(`Refereshing the datatable ... `);
        this.getTableData();
      }
    });

  }

  ngAfterViewInit() {
    // this.sort.sortChange.subscribe(() => {
    //   // this.paginator.pageIndex = 0;
    //   this.pageEvent.pageIndex = 0;
    // });
  }

  getDetailsData() {
    this.sharedServices
      .gettaskinboxViewDetailsData()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((resp) => {
        if (resp && resp.node === this.node) {
          this.nodeColumns = resp.viewDetails;
          //Removing the unnecessary columns which do not carry any fldDesc ohterwise it would show up as undefined columns
          this.nodeColumns.forEach((ele,index)=>{
            if(ele.fldDesc === ''){
              this.nodeColumns.splice(index,1);
            }
          })
          this.updateTableColumns();
        } else {
          this.updateTableColumns();
        }
      });
  }

  /**update table columns based on node and if user configuration exist
   * 3 fixed column at start 'select', 'setting', 'Records'
   */
  updateTableColumns() {
    this.displayedColumns = this.nodeColumns.map((d) => d.fldId);
    this.displayedColumns.unshift('select', 'setting', 'Records');
    this.getTableData();
  }

  /**filter chips are based on node
   * if browser URL contains f queryParam part, then the method will call with filterFromQueryParam parameter
   * has to update currentNodeFilterChips with the value of filterFromQueryParam
   */
  updateNodeChips(filterFromQueryParam?: FilterFieldModel[]) {
    const allNodechips = JSON.parse(JSON.stringify(nodeChips));
    this.currentNodeFilterChips = [...allNodechips[this.node]];
    if (filterFromQueryParam) {
      this.currentNodeFilterChips = this.currentNodeFilterChips.map((d) => {
        const index = filterFromQueryParam.findIndex((p) => p.fieldId === d.fldId);
        if (index >= 0) {
          d.value = filterFromQueryParam[index].values; // has some glitch
        }
        return d;
      });
    }
  }

  /**calls from the template on chips click with chip and new value (item)
   * if currentFilterSettings contains any existing settings for the chip we have update that (match with fldId)
   * for existing setting check if the value(item) exist. If exist remove otherwise push the value(item)
   * update currentFilterSettings array with the filterSettingObj at the index
   * also update currentNodeFilterChips array with the latest value(item) of chip(parameter)
   * call updateQueryParameter to add the currentFilterSettings to the f queryParam
   */
  setChipValue(chip: INodeChips, item: any) {
    const index = this.currentFilterSettings.findIndex((d) => d.fieldId === chip.fldId);
    if (index >= 0) {
      const filterSettingObj: FilterFieldModel = Object.assign({}, this.currentFilterSettings[index]);
      const valueIndex = filterSettingObj.values.findIndex((d) => d === item);
      if (valueIndex >= 0) {
        filterSettingObj.values.splice(valueIndex, 1);
      } else {
        filterSettingObj.values.push(item);
      }
      if (filterSettingObj.values.length <= 0) {
        this.currentFilterSettings.splice(index, 1);
      } else {
        this.currentFilterSettings[index] = filterSettingObj;
      }
    } else {
      const filterSettingObj: FilterFieldModel = {
        fieldId: chip.fldId,
        filterType: chip.fldId.toUpperCase(),
        operator: 'EQUAL',
        values: [item]
      };
      this.currentFilterSettings.push(filterSettingObj);
    }

    this.currentNodeFilterChips = this.currentNodeFilterChips.map((d) => {
      if (d.fldId === chip.fldId) {
        const idx = d.value.indexOf(item);
        if (idx >= 0) {
          d.value.splice(idx, 1);
        } else {
          d.value.push(item);
        }
      }
      return d;
    });
    this.updateQueryParameter();
  }

  /**currentFilterSettings will be stringified and endcoded and added to the f queryParam.
   *
   */
  updateQueryParameter() {
    const filters = [];
    if (this.currentFilterSettings && this.currentFilterSettings.length) {
      filters.push(...this.currentFilterSettings);
    }
    if (this.sideSheetFilterData && this.sideSheetFilterData.length) {
      filters.push(...this.sideSheetFilterData);
    }

    let encoded = '';
    if (filters && filters.length) {
      encoded = btoa(JSON.stringify(filters));
    }
    this.router.navigate([`/home/task/${this.node}/feed`], { queryParams: { f: encoded }, queryParamsHandling: 'merge' });
  }

  /**load chip menu dynamically based on chip and search string (event) from nodeChipsMenuItems
   *
   */
  filterModulesMenu(event, chip) {
    const items: string[] = nodeChipsMenuItems[chip] || [];
    const filtered = items.filter((d) => d.toLowerCase().includes(event.toLowerCase()));
    this.filteredNodeChipsMenuItems[chip] = filtered;
  }
  getTableData() {
    // this.dataSource = new MatTableDataSource<TaskListData>(ELEMENT_DATA);
    // this.selection = new SelectionModel<TaskListData>(true, []);

    this.selection.clear();
    const taskFilterCriteria = this.getFormatFilterData();
    const filterData: TaskListFilter = {
      from: this.pageEvent.pageIndex-1,
      searchString: '',
      size: this.pageEvent.pageSize,
      sort: {},
      taskFilterCriteria
    }

    this.dataSource.getData(this.node, 'en', this.pageEvent.pageSize, 0, filterData, this.pageEvent.pageIndex-1);
    // this.pageEvent.length = this.dataSource.totalCount();
  }

  getFormatFilterData() {
    const taskFilterCriteria = [];
    let filterArr = JSON.parse(JSON.stringify(this.currentFilterSettings));
    filterArr = filterArr.concat(this.sideSheetFilterData)
    if (filterArr && filterArr.length > 0) {
      filterArr.forEach(obj => {
        taskFilterCriteria.push({
          moduleId: obj.moduleId,
          fieldId: obj.fieldId,
          values: obj.values,
          operator: obj.operator,
          filterType: obj.filterType
        });
      })
    }

    return taskFilterCriteria;
  }

  get tableDataTotalCount(): number {
    return this.dataSource.totalCount();
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.docLength();
    return numSelected === numRows;
    // return false;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(event?) {
    // this.isAllSelected() ? this.selection.clear() : this.dataSource.docValue().forEach((row) => this.selection.select(row));
    switch (event?.value) {
      case 'select_this_page': {
        if (!this.selectedPages.includes(this.pageEvent.pageIndex)) {
          this.selectedPages.push(this.pageEvent.pageIndex);
        }
        if (this.selectedPages.includes('all')) {
          this.selectedPages.splice(this.selectedPages.indexOf('all'), 1);
        }
        if (this.selectedPages.includes(this.pageEvent.pageIndex)) {
          this.dataSource.docValue().forEach((row) => {
            this.selection.select(row);
            if (this.selectedRecordsList.indexOf(row) === -1) {
              this.selectedRecordsList.push(row);
            }
          });
        }
        break;
      }
      case 'select_all_page': {
        this.selection.clear();
        this.selectedPages = ['all'];
        this.dataSource.docValue().forEach((row) => this.selection.select(row));
        break;
      }
      case 'select_none': {
        this.selection.clear();
        this.selectedPages = [];
        this.selectedRecordsList = [];
        break;
      }
      default:
        break;
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  onPageChange(event: PageEvent) {
    this.pageEvent.pageIndex = event.pageIndex;
    // this.getTableData();

    // if (this.recordsPageIndex !== event.pageIndex) {
    //   this.recordsPageIndex = event.pageIndex;
    this.getTableData();
    // }
  }
  isStaticCol(dynCol) {
    return this.staticColumns.includes(dynCol);
  }
  getFieldDesc(dynCol) {
    const field = this.nodeColumns.find((f) => f.fldId === dynCol);
    return field ? field.fldDesc || 'Unknown' : dynCol || 'Unknown';
  }

  saveTasklistVisitByUser(nodeId: string) {
    if (nodeId) {
      this.taskListService
        .saveTasklistVisitByUser(nodeId)
        .pipe(take(1))
        .subscribe(
          (resp) => { },
          (err) => {
            console.error(err);
          }
        );
    }
  }
  getHeadersForNode(nodeId: string) {
    if (nodeId) {
      this.taskListService
        .getHeadersForNode(nodeId)
        .pipe(take(1))
        .subscribe(
          (resp: { fldId: string; fldDesc: string }[]) => {
            const nodeFields = NODEFIELDS[nodeId];
            this.nodeColumns = resp.map((d) => {
              return {
                ...d,
                fldDesc: nodeFields.find((n) => n.fldId === d.fldId) ? nodeFields.find((n) => n.fldId === d.fldId).fldDesc : '',
              };
            });
            this.updateTableColumns();
          },
          (err) => {
            console.error(err);
          }
        );
    }
  }
  filterLabels(event) {
    this.filteredLabels = this.AllLabels.filter((d) => d.toLowerCase().indexOf(event.toLowerCase()) >= 0);
  }

  removeLabel(element: TaskListData, label) {
    element.labels = element.labels.filter((d) => d !== label);
  }
  applyLabel(element: TaskListData, label) {
    if (element.labels.indexOf(label) < 0) {
      element.labels.push(label);
    }
  }
  /**open auxilary routing to configure settings of table columns
   *
   */
  openTableViewSettings() {
    this.router.navigate([{ outlets: { sb: `sb/task/view/${this.node}` } }], { queryParamsHandling: 'preserve' });
  }
  openFilterSettingsPanel() {
    this.router.navigate([{ outlets: { sb: `sb/task/filter/${this.node}` } }], { queryParamsHandling: 'preserve' });
  }

  openTransaction(rowObj, layoutId: string) {
    const moduelId = rowObj.staticFieldsVal.MODULEID;
    const rec_no = rowObj.staticFieldsVal.OBJECT_NUMBER;
    const cr_id = rowObj.staticFieldsVal.CRID;
    const dataEventId = rowObj.staticFieldsVal.EVENTID;
    const processId = rowObj?.staticFieldsVal?.PROCESS_ID || '';
    const processInstId = rowObj?.staticFieldsVal?.PRC_INST_ID || '';
    const processFlowContainerId = rowObj.staticFieldsVal.PROCESSFLOWCONTAINERID || '';
    this.router.navigate([{ outlets: { sb: `sb/transaction/${moduelId}/approve/${processInstId}/${processFlowContainerId}/${processId}/${rowObj?.TASKID}/${layoutId}/${moduelId}/${rec_no}/parent/${cr_id}/${dataEventId}` } }], {
      queryParamsHandling: 'preserve'
    });
  }

  viewProcessLog(rowObj) {
    const moduelId = rowObj.staticFieldsVal.MODULEID;
    const recNo = rowObj.staticFieldsVal.OBJECT_NUMBER;

    if (moduelId && recNo) {
      this.router.navigate([{ outlets: { sb: 'sb/logs/audit-log' } }], {
        queryParams: { mid: moduelId, rid: recNo },
        queryParamsHandling: 'merge'
      });
    }
  }

  filterSaveAs(): void {
    this.matDialog.open(FilterSaveModalComponent, {
      data: {
        filterName: ''
      },
      disableClose: true,
      autoFocus: false,
      minWidth: '400px'
    }).afterClosed().subscribe((filterSaveName: string) => {
      if (filterSaveName) {
        console.log('afterClosed Save as', filterSaveName);
        // const data = {
        //   // taskFilterId
        //   taskFilterName: filterSaveName,
        //   taskFilterCategory: this.node,
        //   taskFilterCriteria: this.getFormatFilterData(),
        //   // filterOrder: 0,
        //   // isDefault: true,
        //   // moduleId: ''
        // }
        // console.log('data', data);
        this.saveTaskListFilter(filterSaveName);
      }
    })
  }
  /**
   * confirm the popup to set active or inactive status
   */
  approve(isApprove: boolean): void {
    if (isApprove) {
      // call api to approve
    } else {
      // reject
      this.matDialog.open(RejectModuleComponent, {
        data: {
          task: this.selection?.selected
        },
        ...this.dialofConfig,
        disableClose: true,
        autoFocus: false,
        minWidth: '765px',
        panelClass: 'create-master-panel'
      }).afterClosed().subscribe((dialogData: any) => {
        if (dialogData ==='saved') {
        }
      })
    }
  }

  /**
   * @param text string from which we extract initials
   * @returns the avatar initials
   */
   getAvatarInitials(text: string): string {
    let initials = [];
    if(!text) return '';
    if(text.includes('@')){
      initials = text.split('.');
    } else {
      initials = text.split(' ');
    }
    if(initials.length >= 2) {
      return initials[0].substring(0, 1) + initials[1].substring(0, 1);
    } else {
      return initials[0].substring(0, 1);
    }
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.pageEvent.pageIndex * this.pageEvent.pageSize < this.tableDataTotalCount ? this.pageEvent.pageIndex * this.pageEvent.pageSize : this.tableDataTotalCount;
    return this.tableDataTotalCount ? `${(this.pageEvent.pageIndex - 1) * this.pageEvent.pageSize + 1} to ${endRecord} of ${this.tableDataTotalCount}` : '';
  }

  /**
   * get values for flow list
   * @param str pass the search string
   */
  getFlowListOptions(rowObj): void {
    if (rowObj.staticFieldsVal && rowObj.staticFieldsVal.MODULEID && this.isRowActionVisible) {
      this.taskListService.getFlowList(rowObj.staticFieldsVal.MODULEID, rowObj.staticFieldsVal.PRC_INST_ID, rowObj.STP).subscribe((res) => {
        if (res && res.forms && res.forms[0])
          this.openTransaction(rowObj, res.forms[0]?.formId);
        else
          this.transientService.open(res.flowDesc);
      }, err => console.error(err));
    }
  }

  getAllFilters() {
    this.savedFilterList = this.taskListService.getAllFilters(this.locale, this.node.toUpperCase()).pipe(takeUntil(this.unsubscribeAll$));
  }

  getOptions(fldId: string): void {
    if (fldId === 'Requestedby' || fldId === 'Sent')
      this.requestedByList = this.taskListService.getRequestedByList(this.locale, this.node.toUpperCase());
  }
  /**
   * update the row relevant status
   * @param type field type
   * @param rowObj row details object
   */
  handleRowStatusDetail(type: string, rowObj): void {
    if (!rowObj.staticFieldsVal)
      return;

    const data = [
      {
        datasetId: rowObj.staticFieldsVal.MODULEID,
        docId: rowObj.staticFieldsVal.CRID,
        isBmk: rowObj.BMKD,
        // isImp: true,
        isRead: rowObj.READ
      }
    ];
    if (type === 'rowClick' && rowObj.READ === 'true') {
      return;
    }
    if (type === 'rowClick') {
      data[0].isRead = rowObj.READ === 'true';
      data[0].isRead = !data[0].isRead;
    } else if (type === 'bookmark') {
      data[0].isBmk = rowObj.BMKD === 'true';
      data[0].isBmk = !data[0].isBmk;
    }
    this.taskListService.saveTaskListStatus(this.locale, data).subscribe((res: ResponseBody) => {
      if (res.acknowledge) {
        if (type === 'rowClick')
          rowObj.READ = data[0].isRead ? 'true' : 'false';
        else if (type === 'bookmark')
          rowObj.BMKD = data[0].isBmk ? 'true' : 'false';
      }
    }, err => console.error(err));
  }

  saveTaskListFilter(taskFilterName: string): void {
    const data = {
      taskFilterId: '',
      taskFilterName,
      taskFilterCategory: this.node.toUpperCase(),
      taskFilterCriteria: this.getFormatFilterData(),
      // filterOrder: 0,
      // isDefault: true,
      // moduleId: ''
    }
    console.log('data', data);

    this.taskListService.saveTaskListFilter(this.locale, data).subscribe((res: ResponseBody) => {
    }, err => console.error(err));
  }

  deleteTaskListFilter(filterId: string): void {
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: 'Are You sure want to remove this filter?' },
        disableClose: true,
        autoFocus: false,
        width: '600px',
      },
      (response) => {
        if (response === 'yes') {
          this.taskListService.deleteTaskListFilter(this.locale, filterId).subscribe((res: ResponseBody) => {
          }, err => console.error(err));
        }
      }
    );
  }

  setActiveFilter(filterId: string): void {
    if (filterId) {
      this.taskListService.getFilterDetail(filterId).subscribe((res: FilterCriteriaData) => {
        if (res.taskFilterCriteria) {
          this.currentFilterSettings = [];
          this.sideSheetFilterData = [];
          this.activeFilterId = filterId;
          res.taskFilterCriteria.forEach(obj => {
            if (obj.moduleId) {
              const sideSheetData: FilterFieldModel = {
                fieldId: obj.fieldId,
                operator: obj.operator,
                values: obj.values,
                filterType: obj.filterType,
                moduleId: obj.moduleId
              };
              this.sideSheetFilterData.push(sideSheetData);
            } else {
              const filterSettingObj: FilterFieldModel = {
                fieldId: obj.fieldId,
                filterType: obj.fieldId.toUpperCase(),
                operator: obj.operator,
                values: obj.values
              };
              this.currentFilterSettings.push(filterSettingObj);
            }
          });
          this.updateQueryParameter();
        }
      }, err => console.error(err));
    }
  }

  resetFilter(): void {
    this.activeFilterId = '';
    this.currentFilterSettings = [];
    this.sideSheetFilterData = [];
    this.updateQueryParameter();
  }

  selectAllChipValue(chipObj: INodeChips): void {
    this.currentFilterSettings = [...this.currentFilterSettings.filter(obj => obj.fieldId !== chipObj.fldId)];
    chipObj.value = [];
    this.updateQueryParameter();
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
