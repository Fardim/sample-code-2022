import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { PageEvent } from '@angular/material/paginator';
import { of, Subject } from 'rxjs';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TaskListDatatableComponent } from './task-list-datatable.component';
import { SharedModule } from '@modules/shared/shared.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { TaskListService } from '@services/task-list.service';
import { TaskListFilter } from '@models/list-page/listpage';

describe('TaskListDatatableComponent', () => {
  let component: TaskListDatatableComponent;
  let fixture: ComponentFixture<TaskListDatatableComponent>;
  let router: Router;
  let sharedServices: SharedServiceService;
  let taskListService: TaskListService;
  let activatedRoute: ActivatedRoute;
  let transientService: TransientService;
  // const queryParams = { s: 'inbox', f: '' };
  let queryParams: Subject<Params>;
  const params = { node: 'inbox' };

  beforeEach(async(() => {
    queryParams = new Subject<Params>();
    // queryParams.next({ s: 'inbox', f: 'W29iamVjdCBPYmplY3Rd' });
    TestBed.configureTestingModule({
      declarations: [TaskListDatatableComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams, params: of(params), snapshot: { queryParams: { f: 'test' } } },
        }
      ],
    })
      .compileComponents()
      .then(() => {
        activatedRoute = TestBed.inject(ActivatedRoute);
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListDatatableComponent);
    component = fixture.componentInstance;
    sharedServices = fixture.debugElement.injector.get(SharedServiceService);
    taskListService = fixture.debugElement.injector.get(TaskListService);
    transientService = fixture.debugElement.injector.get(TransientService);
    router = TestBed.inject(Router);
    const fieldList = [
      { fldId: 'description', order: 1 },
      { fldId: 'labels', order: 2 },
      { fldId: 'sent', order: 3 },
      { fldId: 'dueby', order: 4 },
      { fldId: 'requestby', order: 5 },
      { fldId: 'sentby', order: 6 },
    ];
    const recordsList = {
      total: 2,
      _doc: [{
        Records: 'Hydrogen',
        setting: 1,
        description: '1.0079',
        labels: ['Pending'],
        sent: 'L',
        dueby: 'L',
        requestby: 'L',
        sentby: 'L',
        isImp: false,
        isRead: false,
        isBmk: false,
        moduleId: '1'
      },
      {
        Records: 'Helium',
        setting: 2,
        description: '4.0026',
        labels: ['Forwarded'],
        sent: 'L',
        dueby: 'L',
        requestby: 'L',
        sentby: 'L',
        isImp: false,
        isRead: false,
        isBmk: false,
        moduleId: '2'
      },],
      req_at: 1620206786475,
      to: 10,
      res_at: 1620206786489
    };
    const filterData: TaskListFilter = {
      from: 0,
      searchString: '',
      size: component.pageEvent.pageSize,
      sort: {},
      taskFilterCriteria: []
    }
    spyOn(taskListService, 'getHeadersForNode')
      .withArgs('inbox')
      .and.callFake(() => of(fieldList));
    spyOn(taskListService, 'saveTasklistVisitByUser').and.callFake(() => of({}));
    spyOn(taskListService, 'getTaskListData').and.callFake(() => of(recordsList));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have node inbox', () => {
    component.ngOnInit();
    expect(component.node).toEqual('inbox');
  });
  it('should have param', fakeAsync(() => {
    spyOn(component, 'filterLabels');
    component.ngOnInit();
    expect(activatedRoute.snapshot.queryParams.f).toEqual('test');

    component.labelSearchFieldSub.next('forwarded');
    tick(1500);
    expect(component.filterLabels).toHaveBeenCalledWith('forwarded');
  }));
  it('should have param and called other methods', async(() => {
    spyOn(component, 'saveTasklistVisitByUser');
    spyOn(component, 'updateNodeChips');
    component.ngOnInit();
    activatedRoute.params.subscribe((resp) => {
      expect(component.saveTasklistVisitByUser).toHaveBeenCalled();
      expect(component.updateNodeChips).toHaveBeenCalled();
    });
  }));

  it('updateTableColumns()', fakeAsync(() => {
    spyOn(component, 'updateTableColumns');
    spyOn(component, 'updateNodeChips');
    spyOn(sharedServices, 'gettaskinboxViewDetailsData').and.returnValue(of({ node: 'inbox', viewDetails: [] }));
    component.ngOnInit();

    // expect(component.updateNodeChips).toHaveBeenCalled();
    expect(sharedServices.gettaskinboxViewDetailsData).toHaveBeenCalled();

    expect(component.updateTableColumns).toHaveBeenCalled();
  }));

  it('updateNodeChips()', () => {
    component.node = 'inbox';
    component.updateNodeChips();

    expect(component.currentNodeFilterChips.length).toBeGreaterThan(1);
  });
  it('updateNodeChips() with parameter', () => {
    component.node = 'inbox';
    component.updateNodeChips([
      {
        fieldId: 'Bookmarked',
        values: ['true'],
        operator: 'equal',
        filterType: 'Bookmarked'
      },
    ]);
    const chip = component.currentNodeFilterChips.find((d) => d.fldId === 'Bookmarked');
    expect(chip.value).toEqual(['true']);
  });

  it('setChipValue()', () => {
    spyOn(component, 'updateQueryParameter');
    component.setChipValue(
      {
        fldId: 'Bookmarked',
        value: ['true'],
        icon: 'star',
        hasMenu: false,
      },
      'true'
    );
    expect(component.currentFilterSettings).toEqual([
      {
        fieldId: 'Bookmarked',
        values: ['true'],
        operator: 'EQUAL',
        filterType: 'BOOKMARKED'
      },
    ]);

  });

  it('updateQueryParameter()', () => {
    spyOn(router, 'navigate');
    component.node = 'inbox';
    component.currentFilterSettings = [
      {
        fieldId: 'Bookmarked',
        values: ['2'],
        operator: 'equal',
        filterType: 'Bookmarked'
      },
    ];

    component.updateQueryParameter();
    let f = btoa(JSON.stringify(component.currentFilterSettings));
    expect(router.navigate).toHaveBeenCalledWith([`/home/task/inbox/feed`], {
      queryParams: { f },
      queryParamsHandling: 'merge',
    });

    component.currentFilterSettings = [];
    component.updateQueryParameter();
    f = '';
    expect(router.navigate).toHaveBeenCalledWith([`/home/task/inbox/feed`], {
      queryParams: { f },
      queryParamsHandling: 'merge',
    });
  });

  it('filterModulesMenu()', () => {
    component.filterModulesMenu('he', 'Label');
    expect(component.filteredNodeChipsMenuItems.Label).toEqual(['He']);

    component.filterModulesMenu('he', 'UnknownChip');
    expect(component.filteredNodeChipsMenuItems.UnknownChip).toEqual([]);
  });

  it('openTableViewSettings()', () => {
    spyOn(router, 'navigate');
    component.node = 'inbox';

    component.openTableViewSettings();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/task/view/${component.node}` } }], {
      queryParamsHandling: 'preserve',
    });
  });
  it('openFilterSettingsPanel()', () => {
    spyOn(router, 'navigate');
    component.node = 'inbox';

    component.openFilterSettingsPanel();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/task/filter/${component.node}` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('getTableData())', () => {
    spyOn(component, 'getTableData');
    component.node = 'inbox';
    component.updateTableColumns();

    expect(component.getTableData).toHaveBeenCalled();
  });

  it('should check if a column is static', () => {
    expect(component.isStaticCol('select')).toBeTrue();
    expect(component.isStaticCol('other')).toBeFalse();
  });

  it('getFieldDesc()', () => {
    component.node = 'inbox';
    component.nodeColumns = [{ fldId: 'dueby', fldDesc: 'Due by' }];
    expect(component.getFieldDesc('dueby')).toEqual('Due by');
    component.nodeColumns = [{ fldId: 'dueby', fldDesc: '' }];
    expect(component.getFieldDesc('dueby')).toEqual('Unknown');
    component.nodeColumns = [];
    expect(component.getFieldDesc('dueby')).toEqual('dueby');
    component.nodeColumns = [];
    expect(component.getFieldDesc('')).toEqual('Unknown');

  });

  it('onPageChange()', () => {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = 1;

    expect(component.pageEvent.pageIndex).toBe(1);
  });
  it('saveTasklistVisitByUser()', async(() => {
    component.saveTasklistVisitByUser('inbox');
    expect(taskListService.saveTasklistVisitByUser).toHaveBeenCalled();
    taskListService.saveTasklistVisitByUser('inbox').subscribe((actualResponse) => {
      expect(actualResponse).toBeTruthy();
    });
  }));

  it('getHeadersForNode()', fakeAsync(() => {
    component.node = 'inbox';
    spyOn(component, 'updateTableColumns');
    component.getHeadersForNode('inbox');

    expect(taskListService.getHeadersForNode).toHaveBeenCalled();

    expect(component.nodeColumns.length).toBeGreaterThan(1);
    expect(component.updateTableColumns).toHaveBeenCalled();
  }));

  it('filterLabels(event)', () => {
    component.ngOnInit();
    component.filterLabels('forwarded');
    expect(component.filteredLabels.length).toBeGreaterThan(0);
  });

  it('removeLabel(element: PeriodicElement, label)', () => {
    component.ngOnInit();
    const element = {
      setting: 3,
      Records: 'Lithium',
      description: '6.941',
      labels: ['Delegated', 'Forwarded'],
      sent: 'L',
      dueby: 'L',
      requestby: 'L',
      sentby: 'L',
      moduleId: '1'
    };
    component.removeLabel(element, 'Forwarded');
    expect(element.labels.length).toEqual(1);
  });

  it('applyLabel(element: PeriodicElement, label)', () => {
    component.ngOnInit();
    const element = {
      setting: 3,
      Records: 'Lithium',
      description: '6.941',
      labels: ['Delegated', 'Forwarded'],
      sent: 'L',
      dueby: 'L',
      requestby: 'L',
      sentby: 'L',
      moduleId: '1'
    };
    component.applyLabel(element, 'Forwarded');
    expect(element.labels.length).toEqual(2);
    component.applyLabel(element, 'Completed');
    expect(element.labels.length).toEqual(3);
  });

  it('should get table data', () => {
    component.node = 'inbox';
    component.getTableData();
    expect(taskListService.getTaskListData).toHaveBeenCalled();
    expect(component.dataSource.docLength()).toEqual(2);
  });

  it('masterToggle() Select this page', () => {
    component.node = 'inbox';
    component.getTableData();
    expect(taskListService.getTaskListData).toHaveBeenCalled();
    component.masterToggle({
      value: 'select_this_page'
    });
    expect(component.selectedRecordsList.length).toEqual(2);
  });

  it('masterToggle() select none', () => {
    spyOn(component.selection, 'clear');
    component.node = 'inbox';
    component.getTableData();
    expect(taskListService.getTaskListData).toHaveBeenCalled();
    component.masterToggle({
      value: 'select_none'
    });
    expect(component.selection.clear).toHaveBeenCalled();
    expect(component.selectedRecordsList.length).toEqual(0);
  });

  it('masterToggle() select all page', () => {
    spyOn(component.selection, 'clear');
    component.node = 'inbox';
    component.getTableData();
    expect(taskListService.getTaskListData).toHaveBeenCalled();
    component.masterToggle({
      value: 'select_all_page'
    });
    expect(component.selection.clear).toHaveBeenCalled();
    expect(component.selectedPages).toEqual(['all']);
  });

  it('checkboxLabel()', () => {
    component.node = 'inbox';
    component.getTableData();
    let label = component.checkboxLabel(null);
    expect(label).toEqual('deselect all');
    component.masterToggle({
      value: 'select_this_page'
    });
    label = component.checkboxLabel(null);
    expect(label).toEqual('select all');
  });

  it('getFormatFilterData()', () => {
    component.currentFilterSettings = [{
      fieldId: 'BOOKMARKED',
      values: ['true'],
      operator: 'EQUAL',
      filterType: 'Bookmarked',
      moduleId: ''
    }];
    const returnVal = component.getFormatFilterData();
    expect(returnVal).toEqual([{
      moduleId: '',
      fieldId: 'BOOKMARKED',
      values: ['true'],
      operator: 'EQUAL',
      filterType: 'Bookmarked'
    }]);
  });

  it('openTransaction()', () => {
    spyOn(router, 'navigate');
    const moduelId = 'test';
    const layoutId = '48ce35c7-a8a9-44b1-a47c-dbd24bae6537';
    const rec_no = 1;
    const cr_id = 2;
    const processId = 'test';
    const processInstId = 'test';
    const taskid = 'test';
    const eventId = "1";
    const processFlowContainerId = 'test'
    component.openTransaction({
      id: rec_no,
      TASKID: taskid,
      staticFieldsVal: {
        MODULEID: moduelId,
        CRID: cr_id,
        PROCESS_ID: processId,
        PRC_INST_ID: processInstId,
        OBJECT_NUMBER: rec_no,
        EVENTID: eventId,
        PROCESSFLOWCONTAINERID: processFlowContainerId
      }
    }, layoutId);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/transaction/${moduelId}/approve/${processInstId}/${processFlowContainerId}/${processId}/${taskid}/${layoutId}/${rec_no}/${cr_id}/${eventId}` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('getOptions()', () => {
    spyOn(taskListService, 'getRequestedByList');
    component.locale = 'en';
    component.node = 'inbox';
    component.getOptions('Requestedby');
    expect(taskListService.getRequestedByList).toHaveBeenCalled();

    component.getOptions('Sent');
    expect(taskListService.getRequestedByList).toHaveBeenCalled();

    component.getOptions('Label');
    expect(component.requestedByList).toBeUndefined();
  });

  it('handleRowStatusDetail()', () => {
    spyOn(taskListService, 'saveTaskListStatus').and.returnValue(of({ acknowledge: true }));
    component.locale = 'en';
    component.handleRowStatusDetail('rowClick', {
      Records: '1',
      setting: 1,
      description: 'string',
      labels: [''],
      sent: 'string',
      dueby: 'string',
      requestby: 'string',
      sentby: 'string',
      isImp: false,
      isRead: true,
      isBmk: false,
      moduleId: '1'
    });
    expect(taskListService.saveTaskListStatus).not.toHaveBeenCalled();

    component.handleRowStatusDetail('rowClick', {
      Records: '1',
      setting: 1,
      description: 'string',
      labels: [''],
      sent: 'string',
      dueby: 'string',
      requestby: 'string',
      sentby: 'string',
      isImp: false,
      isRead: false,
      isBmk: false,
      moduleId: '1',
      staticFieldsVal:  {
        MODULEID: '1',
        CRID: 1,
      }
    });
    expect(taskListService.saveTaskListStatus).toHaveBeenCalled();

    component.handleRowStatusDetail('bookmark', {
      Records: '1',
      setting: 1,
      description: 'string',
      labels: [''],
      sent: 'string',
      dueby: 'string',
      requestby: 'string',
      sentby: 'string',
      isImp: false,
      isRead: false,
      isBmk: false,
      moduleId: '1',
      staticFieldsVal:  {
        MODULEID: '1',
        CRID: 1,
      }
    });
    expect(taskListService.saveTaskListStatus).toHaveBeenCalled();
  });

  it('saveTaskListFilter()', () => {
    spyOn(taskListService, 'saveTaskListFilter').and.returnValue(of({ acknowledge: true }));
    component.locale = 'en';
    component.node = 'inbox';
    component.saveTaskListFilter('Filter 1');
    expect(taskListService.saveTaskListFilter).toHaveBeenCalled();
  });

  it('deleteTaskListFilter()', () => {
    spyOn(transientService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(taskListService, 'deleteTaskListFilter').and.returnValue(of({ acknowledge: true }));
    component.locale = 'en';
    component.deleteTaskListFilter('1');
    expect(taskListService.deleteTaskListFilter).toHaveBeenCalled();
  });

  it('setActiveFilter()', () => {
    spyOn(taskListService, 'getFilterDetail').and.returnValue(of({
      taskFilterCriteria: [{
        fieldId: '123',
        operator: 'equal',
        values: ['true'],
        filterType: 'dynamic',
        moduleId: '123'
      }, {
        fieldId: '123',
        operator: 'equal',
        values: ['true'],
        filterType: 'dynamic'
      }]
    }));
    component.setActiveFilter('');
    expect(taskListService.getFilterDetail).not.toHaveBeenCalled();

    component.setActiveFilter('1');
    expect(taskListService.getFilterDetail).toHaveBeenCalled();
    expect(component.activeFilterId).toEqual('1');
    expect(component.sideSheetFilterData.length).toEqual(1);
    expect(component.currentFilterSettings.length).toEqual(1);
  });

  it('resetFilter()', () => {
    spyOn(component, 'updateQueryParameter');
    component.node = 'inbox';
    component.resetFilter();
    expect(component.activeFilterId).toEqual('');
    expect(component.sideSheetFilterData.length).toEqual(0);
    expect(component.currentFilterSettings.length).toEqual(0);
    expect(component.updateQueryParameter).toHaveBeenCalled();
  });

  it('selectAllChipValue()', () => {
    spyOn(component, 'updateQueryParameter');
    component.currentFilterSettings = [{
      fieldId: 'sent',
      operator: 'EQUAL',
      values: ['true'],
      filterType: 'SENT'
    }, {
      fieldId: 'RequestedBy',
      operator: 'EQUAL',
      values: ['true'],
      filterType: 'REQUESTEDBY'
    }];
    component.selectAllChipValue({
      fldId: 'sent',
      value: [],
      hasMenu: false
    });

    expect(component.currentFilterSettings).toEqual([{
      fieldId: 'RequestedBy',
      operator: 'EQUAL',
      values: ['true'],
      filterType: 'REQUESTEDBY'
    }]);
    expect(component.updateQueryParameter).toHaveBeenCalled();
  });

  it('ngOnDestroy()', () => {
    spyOn(component.unsubscribeAll$, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.unsubscribeAll$.unsubscribe).toHaveBeenCalled();
  });
});
