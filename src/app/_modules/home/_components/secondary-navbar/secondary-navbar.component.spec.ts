import { MdoUiLibraryModule } from 'mdo-ui-library';
import { TaskListService } from '@services/task-list.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondaryNavbarComponent } from './secondary-navbar.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SchemaListDetails, SchemaListModuleList, SchemaRunningDetails } from '@models/schema/schemalist';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SharedModule } from '@modules/shared/shared.module';
import { UserService } from '@services/user/userservice.service';
import { ReportService } from '@modules/report/_service/report.service';
import { Userdetails } from '@models/userdetails';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SecondaryNavRefresh, SecondaynavType } from '@models/menu-navigation';
import { ReportList } from '@modules/report/report-list/report-list.component';
import { ImportComponent } from '@modules/report/view/import/import.component';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { _submenus } from './secondary-navbar.constants';


describe('SecondaryNavbarComponent', () => {
  let component: SecondaryNavbarComponent;
  let fixture: ComponentFixture<SecondaryNavbarComponent>;
  let schemaServiceSpy: SchemaService;
  let schemaListService: SchemalistService;
  let userService: UserService;
  // let coreService: CoreService;
  let reportService: ReportService;
  let sharedService: SharedServiceService;
  let taskListService: TaskListService;
  let router: Router;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
  const moduleList = [
    {
      moduleId: '1005',
      moduleDesc: 'Material'
    } as SchemaListModuleList
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecondaryNavbarComponent, SearchInputComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, HttpClientTestingModule, SharedModule]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondaryNavbarComponent);
    component = fixture.componentInstance;
    schemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
    // coreService = fixture.debugElement.injector.get(CoreService);
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
    userService = fixture.debugElement.injector.get(UserService);
    reportService = fixture.debugElement.injector.get(ReportService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    taskListService = fixture.debugElement.injector.get(TaskListService);
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnchanges(), should call ngOnChanges', async () => {
    let changes = {
      activatedPrimaryNav: {
        currentValue: 'welcome',
        previousValue: 'schema',
        firstChange: true,
      } as SimpleChange
    } as SimpleChanges
    spyOn(router, 'navigate');
    component.ngOnChanges(changes);
    expect(component.activatedPrimaryNav).toEqual('welcome');

    changes = {
      activatedPrimaryNav: {
        currentValue: 'schema',
        previousValue: 'welcome',
        firstChange: true,
      } as SimpleChange
    } as SimpleChanges
    spyOn(component, 'getAllDataSets');
    component.ngOnChanges(changes);
    expect(component.activatedPrimaryNav).toEqual('schema');
    expect(component.getAllDataSets).toHaveBeenCalled();

    changes = {
      activatedPrimaryNav: {
        currentValue: 'report',
        previousValue: 'schema',
        firstChange: true,
      } as SimpleChange
    } as SimpleChanges

    spyOn(component, 'getreportList')
    component.ngOnChanges(changes);
    expect(component.getreportList).toHaveBeenCalled();

    changes = {
      activatedPrimaryNav: {
        currentValue: 'list',
        previousValue: 'report',
        firstChange: true,
      } as SimpleChange
    } as SimpleChanges

    // spyOn(component, 'getVirtualDataList')
    component.ngOnChanges(changes);
    // expect(component.getVirtualDataList).toHaveBeenCalled();
  })

  it('getDataIntilligence() should return schema with varients', async(() => {
    spyOn(schemaServiceSpy, 'getSchemaWithVariants').and.returnValue(of({} as SchemaListDetails[]));
    component.getDataIntilligence();

    expect(schemaServiceSpy.getSchemaWithVariants).toHaveBeenCalled();
  }))

  it('globalCreate(), should navigate according active primary nav to the report', async () => {
    component.activatedPrimaryNav = 'report';
    fixture.detectChanges();
    const userDetails = {
      currentRoleId: 'AD',
      plantCode: '0'
    } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService, 'createUpdateReport').and.returnValue(of('111'));
    spyOn(router, 'navigate');
    component.globalCreate();

    expect(router.navigate).toHaveBeenCalledWith(['home/report/edit/111/new']);
  })

  it('globalCreate(), should navigate according to active primary nav to schema', async () => {
    component.activatedPrimaryNav = 'schema';
    fixture.detectChanges();
    spyOn(router, 'navigate');
    component.globalCreate();

    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: 'sb/schema/create-schema/new' } }]);

    component.activatedPrimaryNav = 'welcome';
    component.globalCreate();
    expect(component.globalCreate).toBeTruthy();

    component.activatedPrimaryNav = 'goyalashish';
    component.globalCreate();
    expect(component.globalCreate).toBeTruthy();
  })

  it('globalCreate(), should navigate according active primary nav to the report', async () => {
    component.activatedPrimaryNav = 'list';
    fixture.detectChanges();
    spyOn(component,'openDatasetPopup');
    component.openDatasetPopup();
    expect(component.openDatasetPopup).toHaveBeenCalled();
  })

  it('toggleSideBar(), should toggle the icon of secondary nav', () => {
    const hidePrimary = false;
    spyOn(component.toggleEmitter, 'emit');
    component.toggleSideBar(hidePrimary);

    expect(component.toggleEmitter.emit).toHaveBeenCalledWith(false);
  })

  it('getRoutedDescription(), should get route desc', async () => {
    component.activatedPrimaryNav = 'welcome';
    expect(component.getRoutedDescription).toEqual('Home');

    component.activatedPrimaryNav = 'schema';
    expect(component.getRoutedDescription).toEqual('Schema');

    component.activatedPrimaryNav = 'report';
    expect(component.getRoutedDescription).toEqual('Analytics');

    component.activatedPrimaryNav = 'list';
    expect(component.getRoutedDescription).toEqual('Data');
  });


  it('searchSchema(), global search  ', async(() => {
    component.activatedPrimaryNav = 'report';
    spyOn(component,'searchReportWithDebounce').withArgs(false,'t');

    component.searchSchema('t');
    expect(component.searchReportWithDebounce).toHaveBeenCalledWith(false,'t');
  }));

  // it('checkDescOnReload(), should check Desc of secondary nav on page reload', async () => {
  //   spyOn(component, 'getSchemaList');
  //   let url = 'https://beta.mdoondemand.com/MDOSF/fuze/ngx-mdo/index.html#/home/dash/welcome';
  //   component.checkDescOnReload(url);
  //   expect(component.activatedPrimaryNav).toEqual('welcome');

  //   url = 'https://beta.mdoondemand.com/MDOSF/fuze/ngx-mdo/index.html#/home/report/dashboard/914055233326997382';
  //   component.checkDescOnReload(url);
  //   expect(component.activatedPrimaryNav).toEqual('report');

  //   url = 'https://beta.mdoondemand.com/MDOSF/fuze/ngx-mdo/index.html#/home/schema/1005';
  //   component.checkDescOnReload(url);
  //   expect(component.getSchemaList).toHaveBeenCalled();
  //   expect(component.activatedPrimaryNav).toEqual('schema');

  //   // spyOn(component, 'getVirtualDataList');
  //   url = 'https://beta.mdoondemand.com/MDOSF/fuze/ngx-mdo/index.html#/home/list';
  //   component.checkDescOnReload(url);
  //  // expect(component.getVirtualDataList).toHaveBeenCalled();
  //   expect(component.activatedPrimaryNav).toEqual('list');
  // })

  it('getSchemaList(), should get all schema list', async () => {
    spyOn(router, 'navigate');
    spyOn(schemaListService, 'getSchemaList').and.returnValue(of(moduleList));
    component.activatedPrimaryNav = 'schema';
    component.isPageReload = false;
    component.getSchemaList();
    expect(schemaListService.getSchemaList).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema', '1005'])
  })

  it('getReportList(), should get all reports', async () => {
    const userDetails = {
      currentRoleId: 'AD',
      plantCode: '0'
    } as Userdetails;

    const mockReportRes = [
      {
        reportId: '123'
      }
    ] as ReportList[];
    component.isPageReload = false;

    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService, 'reportList').withArgs(userDetails.plantCode, userDetails.currentRoleId,'',0,40).and.returnValue(of(mockReportRes));
    spyOn(router, 'navigate');

    component.isPageReload = false;
    component.getreportList(false,'');
    expect(userService.getUserDetails).toHaveBeenCalled();
    expect(reportService.reportList).toHaveBeenCalledWith(userDetails.plantCode, userDetails.currentRoleId,'',0,40);
  });

  it('searchForVarient(), should search for varient', async () => {
    const schema: SchemaListDetails =
      {
        schemaId: '1234545',
        schemaDescription: 'Material',
        variants: [
          {
            variantId: '123A',
            variantName: 'USA varient'
          },
          {
            variantId: 'UK',
            variantName: 'UK variant'
          }
        ]
      } as SchemaListDetails
    const searchString = 'USA';
    const result = component.searchForVarient(schema, searchString);
    expect(result).toEqual(true);
  })

  it('searchForSchema(), should search for schema', () => {
    const module = {
      moduleId: '123654',
      moduleDesc: 'Module1',
      schemaLists: [
        {
          schemaId: '1005',
          schemaDescription: 'CustomerDIw'
        }
      ]
    } as SchemaListModuleList

    let searchString = 'diw';
    let filteredSchemas = component.searchForSchema(module, searchString);

    expect(filteredSchemas.length).toEqual(1);

    searchString = 'Ashish';
    filteredSchemas = component.searchForSchema(module, searchString);

    expect(filteredSchemas.length).toEqual(0);
    module.schemaLists = [
      {
        schemaId: '1005',
        schemaDescription: ''
      }
    ] as SchemaListModuleList['schemaLists'];

    searchString = 'untitled';
    filteredSchemas = component.searchForSchema(module, searchString);

    expect(filteredSchemas.length).toEqual(1);
  })

  it('checkNewSchemaCount(), shoule check existing count of new schema', async () => {
    const moduleId = '1005';
    component.moduleList = [
      {
        moduleId: '1004',
        moduleDesc: 'Ashish Mode',
        schemaLists: []
      },
      {
        moduleId: '1005',
        moduleDesc: 'Ashish testing',
        schemaLists: [

        ]
      }
    ];
    const res = component.checkNewSchemaCount(moduleId);
    expect(res).toEqual('New schema');

    component.moduleList = [
      {
        moduleId: '1004',
        moduleDesc: 'Ashish Mode',
        schemaLists: []
      },
      {
        moduleId: '1005',
        moduleDesc: 'Ashish testing',
        schemaLists: [
          {
            schemaDescription: 'New schema'
          } as SchemaListDetails
        ]
      }
    ];
    const res2 = component.checkNewSchemaCount(moduleId);
    expect(res2).toEqual('New schema 2');
  });

  it('ngOnInit(), should called OnInit() after loading component', async () => {
    component.isPageReload = false;
    const mockNavRes = {
      activeMenu: SecondaynavType.schema,
      activeMenuItemId: '1',
      isPageReload: true
    } as SecondaryNavRefresh
    spyOn(sharedService, 'getReportListData').and.returnValue(of(true));
    spyOn(sharedService, 'isSecondaryNavRefresh').and.returnValue(of(mockNavRes));
    spyOn(sharedService, 'getTogglePrimaryEmit').and.returnValue(of(true));
    spyOn(component, 'getreportList');
    spyOn(component, 'toggleSideBar');
    spyOn(component, 'getSchemaList');

    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
    expect(component._submenus).toEqual(_submenus);
  });

  it('ngOnInit(), should called OnInit(), should call InboxNodesCount', async () => {
    let changes = {
      activatedPrimaryNav: {
        currentValue: 'welcome',
        previousValue: 'schema',
        firstChange: true,
      } as SimpleChange
    } as SimpleChanges;
    component.ngOnChanges(changes);
    spyOn(component, 'getInboxNodesCount');

    component.ngOnInit();
    expect(component.getInboxNodesCount).toHaveBeenCalled();
  });

  it('ngOnInit(), should set value for activemenuid', async () => {
    component.isPageReload = false;
    const mockNavRes = {
      activeMenu: SecondaynavType.schema,
      activeMenuItemId: '',
      isPageReload: true
    } as SecondaryNavRefresh
    spyOn(sharedService, 'isSecondaryNavRefresh').and.returnValue(of(mockNavRes));

    component.ngOnInit();
    expect(component.activeMenuItemId).toEqual('');
  });

  it('filterModulesMenu(), should filter modules according to search string', async () => {
    let searchString = 'goyal';
    component.moduleList = [
      {
        moduleId: '1002',
        moduleDesc: 'module_ashish'
      },
      {
        moduleId: '10023',
        moduleDesc: 'module_goyal'
      },
      {
        moduleId: '1004',
        moduleDesc: ''
      }
    ] as SchemaListModuleList[];

    component.filterModulesMenu('');
    component.filteredModulesMenu.subscribe(s=>{ expect(s.length).toEqual(0); });

    component.filterModulesMenu(searchString);
    component.filteredModulesMenu.subscribe(s=>{ expect(s.length).toEqual(0); });

    searchString = 'untitle'
    component.filterModulesMenu(searchString);
    component.filteredModulesMenu.subscribe(s=>{ expect(s.length).toEqual(0); });
  });

  it('createNewSchema(), should create new schema', async () => {
    const mockRes = '124554';
    const moduleId = '1004';
    component.moduleList = [
      {
        moduleId: '1004',
        moduleDesc: 'Ashish Mode',
        schemaLists: []
      },
      {
        moduleId: '1005',
        moduleDesc: 'Ashish testing',
        schemaLists: []
      }
    ];

    spyOn(component, 'checkNewSchemaCount');
    spyOn(router, 'navigate')
    spyOn(schemaServiceSpy, 'createUpdateSchema').and.returnValue(of(mockRes));

    component.createNewSchema(moduleId);
    expect(component.checkNewSchemaCount).toHaveBeenCalled();
    expect(schemaServiceSpy.createUpdateSchema).toHaveBeenCalled();
  });

  it('searchSchema(), should search for schema according to searchString', async () => {
    let searchString = null;
    component.activatedPrimaryNav = 'schema'
    component.moduleList = [{
      moduleId: '1002',
      moduleDesc: 'module_AshishG'
    },
    {
      moduleId: '1004',
      moduleDesc: ''
    }] as SchemaListModuleList[];

    component.searchSchema(searchString);
    expect(component.searchModuleResults.length).toEqual(2);

    searchString = 'ashish';
    component.searchSchema(searchString);
    expect(component.searchModuleResults.length).toEqual(1);

    searchString = 'unti';
    component.searchSchema(searchString);
    expect(component.searchModuleResults.length).toEqual(1);
  });

  it('getReportList(), should get all reports', async () => {
    const userDetails = {
      currentRoleId: 'AD',
      plantCode: '0'
    } as Userdetails;

    const mockReportRes = [

    ] as ReportList[];
    component.isPageReload = false;

    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService, 'reportList').withArgs(userDetails.plantCode, userDetails.currentRoleId,'',0,40).and.returnValue(of(mockReportRes));
    spyOn(router, 'navigate');

    component.isPageReload = false;
    component.getreportList(false,'');
    expect(userService.getUserDetails).toHaveBeenCalled();
    expect(reportService.reportList).toHaveBeenCalledWith(userDetails.plantCode, userDetails.currentRoleId,'',0,40);
  })

  it('setTaskListOrder(), should order tasks list', async() => {
    component.taskList = component.mockTaskList;
    const taskOrderList = 'eyJpbmJveCI6MSwiMXRlc3QxIjoxLCIxdGVzdDIiOjAsImluX3dvcmtmbG93IjowfQ==';

    expect(component.setTaskListOrder(taskOrderList)).toBeTruthy();
  });

  it('updateTaskListInStorage(), should update tasks list in local storage', async() => {
    component.taskList = component.mockTaskList;

    expect(component.updateTaskListInStorage(component.taskList)).toBeTruthy();
  });

  // it('getVirtualDataList(), Should fetch all list modules', async() => {
  //   expect(component.getVirtualDataList(false, '')).toBeTruthy();
  // });

  it('updateTaskState(), Should update task and search/filter state', async() => {
    component.taskList = component.mockTaskList;
    const task = component.updateTaskState('inbox');
    expect(component.selectedTask).toEqual('inbox');
    expect(component.selectedTaskFilter).toEqual('');
    expect(task).toBeTruthy();
  });

  it('updateTaskState(), Should update task and subtask and search/filter state', async() => {
    component.taskList = component.mockTaskList;
    const task = component.updateTaskState('inbox', '1test2');
    expect(component.selectedTask).toEqual('inbox');
    expect(component.selectedTaskFilter).toEqual('1test2');
    expect(task).toBeTruthy();
  });

  it('getInboxNodesCount()', async(() => {
    const nodeCount = [
      {label:'Inbox',id:'inbox',rec_cnt:0,new_feed_cnt:0,hasNewFeeds:false},
      {label:'In workflo',id:'workflow',rec_cnt:0,new_feed_cnt:0,hasNewFeeds:false},
      {label:'Rejected',id:'rejected',rec_cnt:0,new_feed_cnt:0,hasNewFeeds:false},
      {label:'Completed',id:'completed',rec_cnt:0,new_feed_cnt:0,hasNewFeeds:false},
      {label:'Draft',id:'draft',rec_cnt:0,new_feed_cnt:0,hasNewFeeds:false},
      {label:'Error',id:'error',rec_cnt:0,new_feed_cnt:0,hasNewFeeds:false}
    ];
    spyOn(taskListService, 'getInboxNodesCount').and.returnValue(of(nodeCount));
    component.getInboxNodesCount();
    expect(taskListService.getInboxNodesCount).toHaveBeenCalled();
    taskListService.getInboxNodesCount().subscribe((actualResponse) => {
      expect(actualResponse).toEqual(nodeCount);
      expect(component.taskList).toEqual(nodeCount);
    });
  }));

  it('importReport(), open dialog', () => {
    component.importReport();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogSpy).toHaveBeenCalledWith(ImportComponent, { disableClose: false, width: '600px', minHeight: '250px' });
  });

  // it('getAllSchemaList should have infinite scroll and call schema list API ', async () => {
  //   component.activatedPrimaryNav = 'welcome';
  //   const schemaListDetails: Array<SchemaRunningDetails> = [{} as SchemaRunningDetails];
  //   component.schemaList = [{} as SchemaRunningDetails];
  //   const allSchemaSpy = spyOn(schemaListService, 'getAllSchemaList').and.returnValue(of(schemaListDetails));
  //   component.getAllSchemaList(true);
  //   expect(component.schemaList.length).toEqual(1);
  //   component.getAllSchemaList();
  //   expect(component.schemaList.length).toEqual(2);
  //   allSchemaSpy.and.returnValue(throwError({ message: 'error' }));
  //   expect(allSchemaSpy).toHaveBeenCalled();
  // });
  it('updateSchemaBatchInfo should update the schema batch info ', async () => {
    const schemaId = 'test';
    const schemaBatchSpy = spyOn(schemaListService, 'updateSchemaBadgeInfo').and.returnValue(of(null));
    component.updateSchemaBadgeInfo({schemaId} as SchemaRunningDetails);
    expect(schemaBatchSpy).toHaveBeenCalled();
    schemaBatchSpy.and.returnValue(throwError({ message: 'error' }));
    component.updateSchemaBadgeInfo({schemaId} as SchemaRunningDetails);
    expect(schemaBatchSpy).toHaveBeenCalled();
  });
  // it('getAllReportBasedOnScroll , should call api with _page to load more ', async () => {
  //   component.activatedPrimaryNav = 'report';
  //   component.schemaSearchString = 'r';
  //   spyOn(component,'getreportList').withArgs(true, component.schemaSearchString);
  //   // component.getAllSchemaList(true);
  //   expect(component.getreportList).toHaveBeenCalledWith(true, component.schemaSearchString);
  // });

  it('updateSchemaDescription should update the schema description', async () => {
    component.moduleList = [{
      moduleId: '1',
      schemaLists: [{
        schemaId: '2',
        schemaDescription: ''
      }]
    }] as any;
    component.updateSchemaDescription('1', '2', 'Test');
    expect(component.moduleList[0].schemaLists[0].schemaDescription).toEqual('Test');
  });

  // it('getAllReportBasedOnScroll , should call api with _page to load more ', async () => {
  //   component.activatedPrimaryNav = 'report';
  //   component.schemaSearchString = 'r';
  //   spyOn(component,'getreportList').withArgs(true, component.schemaSearchString);
  //   // component.getAllSchemaList(true);
  //   expect(component.getreportList).toHaveBeenCalledWith(true, component.schemaSearchString);
  // });

  it('updateSchemaStateById', async() =>{
    component.schemaList = [{schemaId:'1234', running: false} as SchemaRunningDetails];
    component.updateSchemaStateById('1234',true);
    expect(component.schemaList[0].running).toBeTrue();
  });
});
