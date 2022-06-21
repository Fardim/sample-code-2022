import { TaskListService } from '@services/task-list.service';
import { EditDataSetInfo, InboxNodesCount } from './../../../../_models/list-page/listpage';
import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  OnDestroy,
  ViewChildren,
  QueryList,
  AfterViewInit,
  Inject,
  LOCALE_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SchemaListModuleList, SchemaListDetails, ModuleInfo, SchemaRunningDetails } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { ReportService } from '@modules/report/_service/report.service';
import { ReportList } from '@modules/report/report-list/report-list.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { UserService } from '@services/user/userservice.service';
import { ListService } from '@services/list/list.service';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { CreateUpdateSchema } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SecondaryNavRefresh, SecondaynavType } from '@models/menu-navigation';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CoreService } from '@services/core/core.service';
import { ObjectType } from '@models/core/coreModel';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ImportComponent } from '@modules/report/view/import/import.component';
import { ReportDashboardReq } from '@modules/report/_models/widget';
import { debounce } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { _submenus } from './secondary-navbar.constants';
import { get } from 'lodash';
import { DatasetComponent } from '@modules/list/_components/dataset/dataset/dataset.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pros-secondary-navbar',
  templateUrl: './secondary-navbar.component.html',
  styleUrls: ['./secondary-navbar.component.scss'],
})
export class SecondaryNavbarComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  /**
   * List of Mat expansion panels available in DOM
   */
  @ViewChildren(MatExpansionPanel) expansionPanel: QueryList<any>;

  /**
   * Handles Show / Hide of Tasks list in other pages except Home page
   */
  showTasksList = false;

  /**
   * Highlights selected task and selected search / filter from Tasks list and search / filter under tasks list
   */
  selectedTask;
  selectedTaskFilter;

  public moduleList: SchemaListModuleList[] = [];
  objectTypeList: ObjectType[] = [];
  reportList: ReportList[] = [];
  dataIntillegences: SchemaListDetails[] = [];
  // virtualDataList: VirtualDataset[] = []
  /**
   * schema search result array from home navigation
   */
  searchSchemaResults: SchemaListDetails[] = [];

  /**
   * module search result array from schema navigation
   */
  searchModuleResults: SchemaListModuleList[] = [];

  /**
   * filtered modules for schema create menu
   */
  filteredModulesMenu: Observable<ModuleInfo[]> = of([]);

  /**
   * filtered modules for schema create menu
   */
  dataSets: ModuleInfo[] = [];

  /**
   * report list observal ..
   */
  reportOb: Observable<ReportList[]> = of([]);

  /**
   * data list observal ..
   */
  objectTypeObs: Observable<ObjectType[]> = of([]);
  @Input()
  activatedPrimaryNav: string;
  @Input()
  secondarySideBarOpened: boolean;

  /** To check page reloaded or not */
  isPageReload = true;
  schemaList: SchemaRunningDetails[] = [];
  schemaSearchString = '';
  schemaSearchSub: Subject<string> = new Subject();

  virtualSearchString = '';
  /**
   * search control for schema list
   */
  searchControl = new FormControl();
  dataSetSearchLoader = false;
  initialLoadingState = false;

  /**
   * Emitter to emit sidebar toggleing
   */
  @Output() toggleEmitter: EventEmitter<{}> = new EventEmitter<{}>();

  @ViewChild('schemaSearchInput') schemaSearchInput: SearchInputComponent;

  /**
   * subscription array to hold all services subscriptions
   */
  subscriptions: Subscription[] = [];

  activeMenuItemId = '';

  /**
   * Tasks list for secondary menu
   */
  taskList: InboxNodesCount[] = [];

  /**
   * Mockdata for tasks list in home page side menu
   */
  mockTaskList: InboxNodesCount[] = [
    {
      label: 'Inbox',
      id: 'inbox',
      rec_cnt: 0,
      new_feed_cnt: 0,
      hasNewFeeds: true,
      childs: [
        // {
        //   label: 'Test Search / Filter for Tasks',
        //   id: '1test1',
        //   rec_cnt: 2,
        //   new_feed_cnt: 1,
        //   hasNewFeeds: true,
        // },
        // {
        //   label: 'Test2',
        //   id: '1test2',
        //   rec_cnt: 5,
        //   new_feed_cnt: 1,
        //   hasNewFeeds: true,
        // },
      ],
    },
    {
      label: 'In progress',
      id: 'workflow',
      rec_cnt: 0,
      new_feed_cnt: 0,
      hasNewFeeds: true,
      childs: [],
    },
    // {
      // label: 'Rejected',
      // id: 'rejected',
      // rec_cnt: 0,
      // new_feed_cnt: 0,
      // hasNewFeeds: true,
      // childs: [
        // {
        //   label: 'Test1',
        //   id: '2test1',
        //   rec_cnt: 10,
        //   new_feed_cnt: 0,
        //   hasNewFeeds: false,
        // },
        // {
        //   label: 'Test2',
        //   id: '2test2',
        //   rec_cnt: 15,
        //   new_feed_cnt: 1,
        //   hasNewFeeds: true,
        // },
      // ],
    // },
    {
      label: 'Completed',
      id: 'completed',
      rec_cnt: 0,
      new_feed_cnt: 0,
      hasNewFeeds: false,
      childs: [],
    },
    // {
    //   label: 'Draft',
    //   id: 'draft',
    //   rec_cnt: 0,
    //   new_feed_cnt: 0,
    //   hasNewFeeds: false,
    //   childs: [],
    // },
  ];

  filteredTaskList: InboxNodesCount[] = this.mockTaskList;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  // added dummy data for sub menus
  _submenus = _submenus.map(d => Object.assign({}, d));

  selectedDataSet = 0;
  isTooltipReady = false;
  fetchCount = 20;
  fetchSize = 1;

  /**
   * Variable for store the current page for pagination
   */
  _page = 0;

  /**
   * Search the report list based on search string with debounce time
   */
  searchReportWithDebounce = debounce((append, searchStr) => {
    this._page = 0;
    const isClearSearch = !!this.schemaSearchString && !!searchStr;
    this.schemaSearchString = searchStr;
    this.getreportList(append, searchStr, isClearSearch);
  }, 400);

  /**
   * Interval for Update schema list API call
   */
  updateSchemaInterval;

  // selectedDataSet = 0;
  // searchVirtualDataWithDebounce = debounce((append, searchStr) => {
  //   this._page = 0;
  //   this.virtualSearchString = searchStr;
  //   this.getVirtualDataList(append, searchStr);
  // }, 400)
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private schemaListService: SchemalistService,
    private schemaService: SchemaService,
    private reportService: ReportService,
    private sharedService: SharedServiceService,
    private userService: UserService,
    private listService: ListService,
    private taskListService: TaskListService,
    private matSnackBar: MatSnackBar,
    private coreService: CoreService,
    private matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  get stdObjectTypeObs() {
    return this.objectTypeObs.pipe(
      map(items => items.filter(item => item.type === 'STD'))
    );
  }

  get sysObjectTypeObs() {
    return this.objectTypeObs.pipe(
      map(items => items.filter(item => item.type === 'SYS'))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.activatedPrimaryNav &&
      changes.activatedPrimaryNav.previousValue !== changes.activatedPrimaryNav.currentValue
      // changes.activatedPrimaryNav.previousValue !== undefined
    ) {
      this.activatedPrimaryNav = changes.activatedPrimaryNav.currentValue;
      this.isPageReload = false;
      if (this.schemaSearchInput) {
        this.schemaSearchInput.clearSearch();
      }
      switch (changes.activatedPrimaryNav.currentValue) {
        case 'welcome':
          // this.getSchemaList();
          this.activatedPrimaryNav = 'welcome';
          break;

        case 'schema':
          // this.getSchemaList();
          this.activatedPrimaryNav = 'schema';
          this.getAllDataSets();
          break;

        case 'report':
          this.activatedPrimaryNav = 'report';
          this.getreportList(false, '');
          break;

        case 'list':
          this.activatedPrimaryNav = 'list';
          // For data tab reload
          if (this.router.url.indexOf('datatable') > -1 || this.router.url.indexOf('list/fields') > -1) {
            this.getCurrentSelectedModule();
          }
          this.initialLoadingState = true;
          this.getAllObjectType();
          break;
      }
      /**
       * Update schema unread and running state
       */
      // if(this.updateSchemaInterval) {
      //   clearInterval(this.updateSchemaInterval);
      // }
      // if (changes.activatedPrimaryNav.currentValue === 'welcome') {
      //   this.updateSchemaInterval = setInterval(() => {
      //     this.updateSchemaList();
      //   }, 10000);
      // }
    }
  }

  getCurrentSelectedModule(): void {
    this.selectedDataSet = +this.router.url.split('?')[0].split('/').pop();
    this.isPageReload = true;
  }

  ngOnInit(): void {
    this.initSearchControl();
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.sharedService.getOpenDataset().subscribe((res) => {
      if (res) {
        this.openDatasetPopup();
      }
    });
    this.sharedService.getReportListData().subscribe((res) => {
      if (res) {
        this.isPageReload = res.isPageReload;
        if (res.isFromDeleteorEdit) {
          this._page = 0;
        }
        this.getreportList(false, '');
      }
    });

    this.sharedService.getReloadDatasetModulesTrigger().subscribe((res) => {
      if (res) { this.getAllObjectType(); }
    })

    this.sharedService.isSecondaryNavRefresh().subscribe((refreshDetails: SecondaryNavRefresh) => {
      if (refreshDetails.activeMenu === SecondaynavType.schema) {
        if (refreshDetails.moduleId && refreshDetails.schemaId && refreshDetails.schemaName) {
          this.updateSchemaDescription(refreshDetails.moduleId, refreshDetails.schemaId, refreshDetails.schemaName);
        } else {
          this.activeMenuItemId = refreshDetails.activeMenuItemId || '';
          this.isPageReload = refreshDetails.isPageReload;
          this.getSchemaList();
        }
      }
    });

    this.sharedService.getTogglePrimaryEmit().subscribe((res) => {
      if (res) {
        this.toggleSideBar(true);
      }
    });

    this.sharedService.getSchemaRunningState().subscribe((response) => {
      this.updateSchemaStateById(response?.schemaId, response?.state);
    });

    this.subscribeToCurrentModuleId();
    const orderList = localStorage.getItem('tasklist-feeds-order');
    if (orderList) {
      this.setTaskListOrder(orderList);
    }

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        const url = this.router.url;
        if (url.includes('home/task')) {
          this.showTasksList = true;
        } else {
          this.showTasksList = false;
          this.selectedTask = '';
          this.selectedTaskFilter = '';
        }
      }
    });

    this.sharedService.refresSchemaListTrigger
      .subscribe((res: boolean) => {
        if (res) { this.getSchemaList(); }
      });
    if (this.activatedPrimaryNav === 'welcome') {
      // this.getInboxNodesCount();
    }

    const subscription = this.schemaSearchSub.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchString) => {
      this.schemaSearchString = searchString;
      this.filteredTaskList = this.mockTaskList.filter((item) => item.label.toLowerCase().includes(searchString));
    });
    this.subscriptions.push(subscription);
    this.updateDatasetInfo();
  }

  updateDatasetInfo() {
    this.coreService.updateDatasetInfoSubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: EditDataSetInfo) => {
      if (resp) {
        this.objectTypeList.forEach((object: any) => {
          if (object.moduleId === +resp.objectId) {
            object.objectdesc = resp.objectName;
          }
        })
        this.objectTypeObs = of(this.objectTypeList);
        console.log(this.objectTypeList);
        this.coreService.nextUpdateDataSetInfoSubject(null);
      }
    });
  }

  ngAfterViewInit() {
    this.expandSearchFilterInCurrentUrl();
    setTimeout(() => {
      // TODO look at removing this setTimeout on a later date
      this.isTooltipReady = true;
    }, 5000);
  }

  subscribeToCurrentModuleId() {
    this.coreService.currentModuleIdSubject$.subscribe(resp => {
      if (resp) {
        this.selectedDataSet = resp;
        this.expanded(resp);
      }
    })
  }
  /**
   * Sets order of tasks and child search / filter feeds
   * @param list task order list
   */
  setTaskListOrder(list) {
    try {
      const decodedList = atob(list);
      const parsedList = decodedList ? JSON.parse(decodedList) : '';
      if (Object.keys(parsedList).length) {
        this.taskList = this.sortTaskById(this.taskList, parsedList);
        this.taskList.forEach((x, i) => {
          if (x.childs && x.childs.length) {
            this.taskList[i].childs = this.sortTaskById(x.childs, parsedList);
          }
        });
        this.mockTaskList = this.taskList;
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Expands search / filter from tasks
   */
  expandSearchFilterInCurrentUrl() {
    try {
      this.activatedRoute.queryParams.subscribe((param) => {
        const url = this.router.url;
        if (url.includes('/home/task')) {
          this.showTasksList = true;
          const urlParts = url.split('?')[0].split('/');
          urlParts.forEach((x, i) => {
            if (x === 'task') {
              this.selectedTask = urlParts[i + 1] || '';
            }
          });
          this.selectedTaskFilter = param.s || undefined;
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Sorts Tasks By ID
   * @param list task list
   * @param orderList task order list
   */
  sortTaskById(list, orderList) {
    try {
      list.sort((a, b) => {
        const val1 = a.id ? (orderList[a.id] || orderList[a.id] === 0 ? orderList[a.id] : Infinity) : Infinity;
        const val2 = b.id ? (orderList[b.id] || orderList[b.id] === 0 ? orderList[b.id] : Infinity) : Infinity;
        if (val1 < val2) {
          return -1;
        }
      });
    } catch (e) {
      console.log(e);
    }

    return list;
  }

  /**
   * Get all schema along with variants ..
   */
  getDataIntilligence() {
    const subscription = this.schemaService.getSchemaWithVariants().subscribe(
      (res) => {
        this.dataIntillegences.length = 0;
        this.dataIntillegences.push(...res);
        this.searchSchemaResults = this.dataIntillegences;
      },
      (error) => console.error(`Error : ${error.message}`)
    );
    this.subscriptions.push(subscription);
  }

  /**
   * Get all schemas ..
   */
  public getSchemaList() {
    const subscription = this.schemaListService.getSchemaList().subscribe((moduleList) => {
      this.moduleList = moduleList;
      this.searchModuleResults = this.moduleList;
      if (this.moduleList && this.activatedPrimaryNav === 'schema') {
        if (!this.isPageReload) {
          this.activeMenuItemId = this.moduleList[0]?.moduleId || 'new';
          this.router.navigate(['/home/schema', this.activeMenuItemId]);
        }
        else {
          const activeModule = this.moduleList.find(module => this.router.url.includes(module.moduleId));
          if (activeModule) {
            this.activeMenuItemId = activeModule.moduleId;
            this.scrollPanelToTop(activeModule.moduleId);
          }
        }
      }
    }, error => {
      console.error(`Error : ${error.message}`);
    });
    this.subscriptions.push(subscription);
  }

  /**
   * Function updating schema unread and running state in an interval
   */
  updateSchemaList() {
    const obsv = this.schemaListService.getAllSchemaList(0, this.schemaSearchString, this.schemaList.length);
    const subscription = obsv.subscribe((schemaList) => {
      schemaList.forEach((updatedSchema) => {
        const existingSchema = this.schemaList.find((schema) => schema.schemaId === updatedSchema.schemaId);
        if (existingSchema) {
          Object.assign(existingSchema, {
            running: updatedSchema.running,
            viewed: updatedSchema.viewed
          });
        }
      });
    }, (error) => {
      console.log('Error while getting all schema list', error);
    });
    this.subscriptions.push(subscription);
    return obsv;
  }

  updateSchemaBadgeInfo(schema: SchemaRunningDetails) {
    this.schemaListService.updateSchemaBadgeInfo(schema.schemaId).subscribe(() => {
      const idx = this.schemaList.findIndex(f => f.schemaId === schema.schemaId);
      if (idx !== -1) {
        this.schemaList[idx].viewed = true;
      }
    }, (err) => {
      console.error('Error while updating schema batch info', schema.schemaId, err);
    })
  }

  /**
   * Function to get report list
   */
  public getreportList(append = false, searchStr: string, isClearSearch: boolean = false) {
    const subscription = this.userService.getUserDetails().pipe(filter(x => x.userName !== null || x.userName.trim().length !== 0), distinctUntilChanged()).subscribe(user => {
      if (user?.plantCode && user?.currentRoleId) {
        const subs = this.reportService.reportList(user.plantCode, user.currentRoleId, searchStr, this._page ? this._page : 0, 40).subscribe(reportList => {
          this.reportList = append ? this.reportList.concat(reportList) : reportList;
          this.reportOb = of(this.reportList);
          if (this.reportList.length > 0 && !this.isPageReload && !searchStr && !isClearSearch) {
            const firstReportId = this.reportList[0].reportId;
            this.router.navigate(['home/report/view', firstReportId]);
          } else if (this.reportList.length === 0 && !this.isPageReload && !searchStr && !isClearSearch) {
            this.router.navigate(['home/report/view/new']);
          }
        }, error => {
          console.error(`Error : ${error}`);
          this.reportList = [];
          this.reportOb = of(this.reportList);
          // navigate to report if having any issue to get the report list with error
          this.router.navigate(['home/report/view/new'], { queryParams: { e: `${error?.error?.status}` } });
        });
        this.subscriptions.push(subs);
      } else {
        this.router.navigate(['home/report/view/new']);
      }
    });
    this.subscriptions.push(subscription);
  }

   /**
   * called when scroll reaches end of page
   */
  onScrollEnd(event): void {
    this.fetchSize = this.fetchSize + 1;
    this.getAllObjectType()
  }

  /**
   * Function to get all list modules
   */
  public getAllObjectType(moduleId?: number) {
    try {
      if (moduleId) {
        this.objectTypeList = [];
        this.objectTypeObs = of(this.objectTypeList);
      }
      // To make sure the loader is only shown for the first time
      this.dataSetSearchLoader = this.fetchSize === 1;
      this.coreService.getAllObjectType(this.locale, 20, this.fetchSize - 1).subscribe(
        (modules: ObjectType[]) => {
          this.dataSetSearchLoader = false;
          this.initialLoadingState = false;
          // empty the array only if it's the first request otherwise push into the same result
          if (this.fetchSize === 1) {
            this.objectTypeList = [];
            this.objectTypeObs = of(this.objectTypeList);
          }
          modules.forEach((module: any) => {
            module.objectid = module.moduleId;
            const objectDesc = get(module, 'moduleDescriptionRequestDTO.information', 'Untitled');
            module.objectdesc =  objectDesc ? objectDesc : get(module, 'moduleDescriptionRequestDTO.description', 'Untitled');
            module.submenus = this._submenus.map(d=> Object.assign({}, d));
          });
          this.objectTypeList.push(...modules);
          this.objectTypeObs = of(this.objectTypeList);
          if (moduleId && !this.isPageReload) {
            this.selectedDataSet = moduleId;
            this.router.navigate(['/home/list/fields', moduleId]);
          } else if (moduleId && this.isPageReload) {
            this.router.navigate(['/home/list/fields', moduleId], { queryParamsHandling: 'preserve' });
          } else {
            if (modules && modules.length && !this.isPageReload) {
              const firstModuleId = this.objectTypeList[0].objectid;
              this.router.navigate(['/home/list/datatable', firstModuleId]);
              this.selectedDataSet = firstModuleId;
              this.cdr.detectChanges();
            } else if (modules && modules.length && this.isPageReload) {
              this.router.navigate(['/home/list/fields', moduleId], { queryParamsHandling: 'preserve' });
              this.cdr.detectChanges();
            } else {
              this.router.navigate(['/home/list/datatable/new']);
              this.cdr.detectChanges();
            }
          }
        },
        (error) => {
          this.dataSetSearchLoader = false;
          this.initialLoadingState = false;
          console.error(`Error:: ${error.message}`);
          this.router.navigate(['/home/list/datatable/new']);
          this.cdr.detectChanges();
        }
      );

      return true;
    } catch (e) {
      console.log(e);
      this.router.navigate(['/home/list/datatable/new', this.selectedDataSet]);
      this.cdr.detectChanges();
      return false;
    }
  }

  initSearchControl() {
    this.searchControl.valueChanges
      .pipe(
        tap((searchText) => {
          if (searchText) {
            this.dataSetSearchLoader = true;
            this.objectTypeObs = of([]);
          }
        }),
        debounceTime(500),
        distinctUntilChanged())
      .subscribe(searchText => {
        this.searchSchema(searchText);
      })
  }

  /**
   * Search from dataset modules
   * @param searchStr pass search string
   */
  searchDatasetModules(searchStr: string) {
    this.fetchCount = 0;
    // this.fetchSize = 1;
    this.objectTypeObs = of([]);
    this.dataSetSearchLoader = true;
    this.coreService.searchAllObjectType({
      fetchcount: this.fetchCount,
      fetchsize: 20,
      lang: this.locale,
      description: searchStr
    }).subscribe(
      (modules: ObjectType[]) => {
        this.dataSetSearchLoader = false;
        if (modules?.length) {
          modules.forEach((module: any) => {
            if (!this.objectTypeList.find(f => f.objectid.toString() === module.moduleId.toString())) {
              this.objectTypeList.push({
                objectid: module.moduleId,
                objectdesc: module.moduleDesc,
                objectInfo: module.moduleDesc,
                submenus: []
              })
            }
          });

          this.objectTypeObs = of(this.objectTypeList.filter(f => f.objectdesc?.toLowerCase().includes(searchStr)));
        }
      }, (error) => {
        this.dataSetSearchLoader = false;
        console.error(`Error:: ${error.message}`);
      }
    );
  }

  /**
   * Get routed descriptions ..
   */
  get getRoutedDescription(): string {
    let res = 'Unknown';
    switch (this.activatedPrimaryNav) {
      case 'welcome':
        res = 'Home';
        break;
      case 'schema':
        res = 'Schema';
        break;
      case 'report':
        res = 'Dashboards';
        break;
      case 'list':
        res = 'Data';
        break;
    }
    return res;
  }

  /**
   * Navigate to particular page ..
   */
  globalCreate() {
    switch (this.activatedPrimaryNav) {
      case 'welcome':
        break;
      case 'schema':
        this.router.navigate(['', { outlets: { sb: 'sb/schema/create-schema/new' } }]);
        break;
      case 'list':
        this.openDatasetPopup();
        break;
      case 'report':
        this.toggleSideBar(true);
        // this.router.navigate(['home/report/dashboard-builder/new']);

        // Report V2
        const userSub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
          const request: ReportDashboardReq = new ReportDashboardReq();
          request.reportId = '';
          request.reportName = 'Untitled';
          request.widgetReqList = [];
          const createUpdateSub = this.reportService.createUpdateReport(request, user.plantCode).subscribe(res => {
            this.router.navigate([`home/report/edit/${res}/new`]);
          });
          this.subscriptions.push(createUpdateSub);
        });
        this.subscriptions.push(userSub);
        break;
      case 'list':
        this.openDatasetPopup();
        break;
      default:
        break;
    }
  }

  // will be called on clicking plus icon from secondary navbar dataset
  openDatasetPopup() {
    const dialogRef = this.matDialog.open(DatasetComponent, {
      height: '600px',
      width: '1100px',
      disableClose: true,
      autoFocus: false,
    });
    // eslint-disable-next-line import/no-deprecated
    dialogRef.afterClosed().subscribe((result: {toRefreshApis: boolean, moduleId?: number}) => {
      this.selectedDataSet = result.moduleId;
      if (result.toRefreshApis) {
        this.getAllObjectType(result.moduleId);
      }
    });
  }

  /**
   * function to toggle the icon
   * and emit the toggle event
   */
  toggleSideBar(hidePrimary = false) {
    this.toggleEmitter.emit(hidePrimary)
  }

  /**
   * Function to search schema from home primary nav
   * @param searchString schema string to be searched
   */
  searchSchema(searchString: string) {
    if (searchString) {
      searchString = searchString.toLowerCase().trim();
    }
    if (this.activatedPrimaryNav === 'welcome') {
      this.schemaSearchSub.next(searchString);
    }
    if (this.activatedPrimaryNav === 'schema') {
      if (searchString === null) {
        return (this.searchModuleResults = this.moduleList);
      }
      this.searchModuleResults = [];
      this.moduleList.forEach((module) => {
        module.moduleDesc = module.moduleDesc ? module.moduleDesc : 'untitled';
        if (module.moduleDesc.toLowerCase().includes(searchString)) {
          this.searchModuleResults.push(module);
        } else {
          const schemaLists = this.searchForSchema(module, searchString);
          if (schemaLists.length) this.searchModuleResults.push({ ...module, schemaLists });
        }
      });
    }
    if (this.activatedPrimaryNav === 'report') {
      this.searchReportWithDebounce(false, searchString);
    }
    if (this.activatedPrimaryNav === 'list') {
      if (searchString) {
        this.searchDatasetModules(searchString);
      } else {
        this.dataSetSearchLoader = false;
        this.initialLoadingState = false;
        this.objectTypeObs = of(this.objectTypeList);
      }
    }
  }

  /**
   * function to search for varient inside schema
   * @param schema schema object
   * @param searchString string to be searched
   */
  searchForVarient(schema: SchemaListDetails, searchString: string) {
    let flag = false;
    schema.variants.forEach((variant) => {
      if (variant.variantName.toLowerCase().includes(searchString.toLowerCase())) {
        return (flag = true);
      }
    });
    return flag;
  }

  /**
   * function to search for schema inside module
   * @param module module obj
   * @param searchString string to be searched
   */
  searchForSchema(module: SchemaListModuleList, searchString: string): SchemaListDetails[] {
    const searchResult: SchemaListDetails[] = [];
    if (module.schemaLists) {
      module.schemaLists.forEach((schema) => {
        schema.schemaDescription = schema.schemaDescription ? schema.schemaDescription : 'untitled';
        if (schema.schemaDescription.toLowerCase().includes(searchString.toLowerCase())) {
          searchResult.push(schema);
        }
      });
    }
    return searchResult;
  }

  /**
   * Function to search modules from global search
   * @param searchString: string to be searched for modules.
   */
  filterModulesMenu(searchString) {
    if (!searchString) {
      this.filteredModulesMenu = of(this.dataSets);
      return;
    }
    this.filteredModulesMenu = of(this.dataSets.filter(module => {
      module.moduleDesc = module.moduleDesc ? module.moduleDesc : 'untitled';
      return module.moduleDesc.toLowerCase().includes(searchString.toLowerCase());
    }));
  }

  /**
   * Function to create new schema
   * @param moduleId: ID of module for which schema needs to be created.
   */
  createNewSchema(moduleId: string) {
    const schemaReq: CreateUpdateSchema = new CreateUpdateSchema();
    schemaReq.schemaId = '';
    schemaReq.moduleId = moduleId;
    schemaReq.schemaThreshold = '0';
    schemaReq.discription = this.checkNewSchemaCount(moduleId);

    const subscription = this.schemaService.createUpdateSchema(schemaReq).subscribe(
      (response) => {
        const schemaId: string = response;
        this.matSnackBar.open('Schema created successfully.', 'Okay', {
          duration: 2000,
        });

        this.sharedService.setRefreshSecondaryNav(SecondaynavType.schema, true, moduleId);

        // navigate to the schema-info page of new-schema;
        this.router.navigate([`home/schema/schema-info/${moduleId}/${schemaId}`]);
      },
      (error) => {
        this.matSnackBar.open('Something went wrong.', 'Okay', {
          duration: 2000,
        });
      }
    );
    this.subscriptions.push(subscription);
  }

  /**
   * Function to check new schema count
   * @param moduleId module id
   */
  checkNewSchemaCount(moduleId: string) {
    const findModule: SchemaListModuleList = this.moduleList.filter((module) => module.moduleId === moduleId)[0];
    let newSchemaArr = [];
    if (findModule && findModule.schemaLists) {
      newSchemaArr = findModule.schemaLists.filter((schema) => {
        schema.schemaDescription = schema.schemaDescription ? schema.schemaDescription : 'untitled';
        return schema.schemaDescription.toLocaleLowerCase().startsWith('new schema');
      });
    }
    return newSchemaArr.length > 0 ? `New schema ${newSchemaArr.length + 1}` : `New schema`;
  }

  scrollPanelToTop(panelId) {
    setTimeout(() => {
      const activeMenuItem = document.getElementById(panelId);
      activeMenuItem.scrollIntoView();
    }, 300);
  }

  isActiveLink(link) {
    return this.router.url.includes(link);
  }

  /**
   * ANGULAR LIFECYCLE HOOK
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    clearInterval(this.updateSchemaInterval);
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

  /**
   * While drag and drop on list elements
   * @param event dragable element
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  /**
   * Drag and drop for task list
   * @param ev draggable element
   * @param ind parent index of dragged child
   */
  dropTask(ev: CdkDragDrop<string[]>, ind?) {
    if (ev.previousContainer === ev.container && ev.previousIndex !== ev.currentIndex) {
      if (ind) {
        moveItemInArray(this.taskList[ind].childs, ev.previousIndex, ev.currentIndex);
      } else {
        moveItemInArray(this.taskList, ev.previousIndex, ev.currentIndex);
      }
      this.updateTaskListInStorage(this.taskList);
    }
  }

  /**
   * Update task list order in local storage
   * @param list updated tasks list
   */
  updateTaskListInStorage(list) {
    try {
      const newOrderList = {};
      list.forEach((x, i) => {
        if (x.id) {
          newOrderList[x.id] = i;
        }
        if (x.childs && x.childs.length) {
          x.childs.forEach((y, j) => {
            if (y.id) {
              newOrderList[y.id] = j;
            }
          });
        }
      });
      localStorage.setItem('tasklist-feeds-order', btoa(JSON.stringify(newOrderList)));
      this.setTaskListOrder(btoa(JSON.stringify(newOrderList)));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Updates task state to unread
   * @param taskId selected task id
   * @param subTaskId selected search / filter id
   */
  updateTaskState(taskId, subTaskId?) {
    let currTask;
    if (subTaskId) {
      this.selectedTask = taskId;
      this.selectedTaskFilter = subTaskId;
      currTask = this.taskList.find((x) => x.id === taskId).childs.find((y) => y.id === subTaskId);
    } else {
      this.selectedTask = taskId;
      this.selectedTaskFilter = '';
      currTask = this.taskList.find((x) => x.id === taskId);
    }

    if (currTask?.hasNewFeeds) {
      setTimeout(() => {
        currTask.hasNewFeeds = false;
      }, 3000);
    }

    return true;
  }

  /**
   * get the proper search placeholder for selected menu item
   * @returns string
   */
  getPlaceholderText(): string {
    const baseText = 'Search';

    if(this.activatedPrimaryNav === 'report') {
      return `${baseText} dashboards`
    }
    if(this.activatedPrimaryNav === 'list') {
      return `${baseText} data`
    }
    if(this.activatedPrimaryNav === 'welcome') {
      return `${baseText} home`
    }

    return baseText;
  }

  getInboxNodesCount() {
    this.taskListService
      .getInboxNodesCount()
      .pipe(take(1))
      .subscribe(
        (resp) => {
          this.taskList = resp;
          console.log(this.taskList);
          const orderList = localStorage.getItem('tasklist-feeds-order');
          if (orderList) {
            this.setTaskListOrder(orderList);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  selectDataSet(objectId) {
    this.selectedDataSet = objectId;
    this.coreService.nextUpdateDatasetView(true);
  }

  expanded(moduleId: number) {
    this.coreService.getFormsCount(moduleId.toString()).pipe(take(1)).subscribe(resp => {
      this.updateSubmenuCount(moduleId, resp);
    });
  }


  /**
   * Get all available modules / datasets
   */
  getAllDataSets() {
    this.subscriptions.push(this.schemaService.getAllDataSets().subscribe((res: ModuleInfo[]) => {
      this.dataSets = res;
      console.log(this.dataSets);
      this.filteredModulesMenu = of(res);
    }, err => { console.error(`Exception : ${err.message}`) }));
  }

  /**
   * Open dialog for import a report
   */
  importReport() {
    const dialogRef = this.matDialog.open(ImportComponent, {
      width: '600px',
      minHeight: '250px',
      disableClose: false,
    });

    // Reload once import is successfull
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getreportList(false, this.schemaSearchString);
      }
    });
  }

  /**
   * set individual schema running state
   * @param schemaId pass the schema id
   * @param state pass the state value
   */
  updateSchemaStateById(schemaId: string, state: boolean) {
    if (!this.schemaList?.length || !schemaId) { return };

    const index = this.schemaList.findIndex((schema) => schema.schemaId === schemaId);
    if (this.schemaList[index]) {
      this.schemaList[index].running = state;
    }
  }

  /**
   * Function to update schema name locally by using module id and schema id
   * @param moduleId Module ID
   * @param schemaId Schema ID
   * @param schemaDescription New schema name to update
   */
  updateSchemaDescription(moduleId: string, schemaId: string, schemaDescription: string) {
    const schemaDetails = this.moduleList.find(moduleObj => moduleObj.moduleId === moduleId)
      ?.schemaLists.find(schema => schema.schemaId === schemaId);
    if (schemaDetails) {
      schemaDetails.schemaDescription = schemaDescription;
    }
  }

  updateSubmenuCount(moduleId: number, resp: { count: number }) {
    this.objectTypeList = this.objectTypeList.map(d => {
      if (d.objectid === moduleId) {
        d.submenus = d.submenus.map(s => {
          if (s.id === 'forms') {
            s.count = resp.count;
          }
          return s;
        });
      }
      return d;
    });

    if(!this.searchControl.value) {
      this.objectTypeObs = of(this.objectTypeList);
    }
  }

  openPackageSideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/conneckthubPackage` }}], {
      queryParams: {openLoc: 'home'}
    });
  }
}
