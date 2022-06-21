import { MdoUiLibraryModule } from 'mdo-ui-library';
import { Subject, of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';

import { TaskListFilterComponent } from './task-list-filter.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GlobaldialogService } from '@services/globaldialog.service';
import { By } from '@angular/platform-browser';
import { CoreService } from '@services/core/core.service';
import { FieldControlType, FilterFieldModel } from '@models/list-page/listpage';
import { SchemaService } from '@services/home/schema.service';

describe('TaskListFilterComponent', () => {
  let component: TaskListFilterComponent;
  let fixture: ComponentFixture<TaskListFilterComponent>;
  let router: Router;
  let globalDialogService: GlobaldialogService;
  let coreService: CoreService;
  let schemaService: SchemaService;
  let queryParams: Subject<Params>;
  const params = { node: 'inbox' };

  beforeEach(async(() => {
    queryParams = new Subject<Params>();
    TestBed.configureTestingModule({
      declarations: [TaskListFilterComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams, params: of(params) },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListFilterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    coreService = fixture.debugElement.injector.get(CoreService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    // fixture.detectChanges();
    spyOn(coreService, 'getDataSets').withArgs('').and.callFake(() => of([{
      moduleDesc: 'test',
      moduleId: '1',
      tenantId: '1'
    }]));
    spyOn(schemaService, 'getFieldDropValues').withArgs('1', '1', '').and.callFake(() => of([{
      CODE: 'test',
      TEXT: '1',
      PLANTCODE: '',
      SNO: '',
      FIELDNAME: '',
      LANGU: 'en'
    }]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getLazyData', (done: DoneFn) => {
    // component.ngOnInit();
    component.moduleData = [{
      moduleDesc: 'test',
      moduleId: '1',
      tenantId: '1'
    }];
    component.getLazyData(0, 10).subscribe((resp) => {
      expect(resp.data.length).toEqual(1);
      done();
    });
  });

  it('searchInput valuechange', async(() => {
    spyOn(component, 'resetPageEvent');
    component.ngOnInit();
    const field = fixture.debugElement.query(By.css('lib-search:first-of-type'));
    const input = field.query(By.css('input')).nativeElement;
    input.value = 'someValue';
    input.dispatchEvent(new Event('keyup'));
    // fixture.detectChanges();
    expect(input.value).toBe('someValue');
  }));

  it('scroll($event) with loadmore false', () => {
    spyOn(component, 'loadData');
    component.resetPageEvent();
    component.infinteScrollLoading = false;
    // const event = { target: { offsetHeight: 450, scrollTop: 20, scrollHeight: 480 } };
    component.scroll(false);
    expect(component.loadData).toHaveBeenCalled();
  });

  it('scroll($event) with loadmore true', () => {
    spyOn(component, 'loadData');
    component.resetPageEvent();
    component.infinteScrollLoading = false;
    component.scroll(true);
    expect(component.infinteScrollLoading).toBe(false);
    expect(component.loadData).not.toHaveBeenCalled();
  });

  it('loadData()', () => {
    spyOn(component, 'getLazyData').and.returnValue(of({ data: [], totalCount: 0 }));
    component.ngOnInit();
    component.searchKey = 'cust';
    component.loadData([]);
    expect(component.infinteScrollLoading).toBeFalse();
  });

  it('resetPageEvent()', () => {
    component.ngOnInit();
    component.resetPageEvent();
    expect(component.pageEvent.pageIndex).toEqual(0);
    expect(component.pageEvent.pageSize).toEqual(20);
    expect(component.pageEvent.totalCount).toEqual(0);
  });

  it('should have queryParam', fakeAsync(() => {
    const settings = [
      {
        fldId: 'Bookmarked',
        value: ['2'],
        startvalue: [],
        endvalue: [],
        operator: 'equal',
        parentnode: '',
      },
    ];
    const f = btoa(JSON.stringify(settings));
    // fixture.detectChanges();
    component.ngOnInit();
    queryParams.next({ s: 'inbox', f });

    // tick to make sure the async observable resolves
    tick();
    discardPeriodicTasks();
    expect(component.listPageStaticFilters.length).toBe(1);
  }));

  it('close()', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], {
      queryParams: {},
    });

    const filterdata = [{
      fieldId: 'Bookmarked',
      operator: 'equal',
      values: ['true'],
      filterType: 'Bookmarked'
    }];
    component.suggestedFilters = filterdata;
    component.close();

    const filterStr = btoa(JSON.stringify(filterdata));
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], {
      queryParams: { f: filterStr },
    });
  });

  it('clearAllFilters()', async () => {
    spyOn(globalDialogService, 'confirm');
    component.clearAllFilters();

    expect(globalDialogService.confirm).toHaveBeenCalled();
  });

  it('should getFieldControlType', () => {
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'CHAR',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.TEXT);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'PASS',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.PASSWORD);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'EMAIL',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.EMAIL);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '22',
      dataType: 'CHAR',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.TEXT_AREA);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'NUMC',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.NUMBER);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '4',
      dataType: 'CHAR',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.SINGLE_SELECT);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '1',
      dataType: 'CHAR',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.MULTI_SELECT);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'DATS',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.DATE);
    expect(component.getFieldControlType({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'TIMS',
      filterType: 'dynamic'
    })).toEqual(FieldControlType.TIME);
  });

  it('should updateFilterValue', () => {
    component.activeFilter = new FilterFieldModel();
    component.updateFilterValue('new value');
    expect(component.activeFilter.values).toEqual(['new value']);
  });

  it('should upsertFilter', () => {
    // component.moduleFieldsMetatdata = [{ fieldId: 'MTL_GROUP', fieldDescri: 'Material groupe' }] as FieldMetaData[];
    component.suggestedFilters = [];
    component.upsertFilter({
      fieldId: 'test',
      operator: 'equal',
      values: ['true'],
      picklist: '0',
      dataType: 'TIMS',
      filterType: 'dynamic'
    });
    expect(component.activeFilter.fieldId).toEqual('test');
  });

  it('should updateFilterValue', () => {
    component.activeFilter = new FilterFieldModel();
    component.updateFilterValue('new value');
    expect(component.activeFilter.values).toEqual(['new value']);
  });
  it('should applyFilter', () => {
    component.activeFilter = new FilterFieldModel();
    component.activeFilter.fieldId = 'test';

    component.applyFilter();
    expect(component.suggestedFilters.length).toEqual(1);
  });

  it('should getFilterFieldOptions()', () => {
    component.getFilterFieldOptions('1', '1');
    expect(component.filteredDropdownValues.length).toEqual(1);
  });

  it('should filterOptionSearch()', () => {
    component.activeFilter = new FilterFieldModel();
    component.getFilterFieldOptions('1', '1');
    component.filterOptionSearch('test 1', 'key', true);
    expect(component.filteredDropdownValues.length).toEqual(0);

    component.filterOptionSearch('test', 'key', true);
    expect(component.filteredDropdownValues.length).toEqual(1);
  });

  it('should onSelectDeselect()', () => {
    component.activeFilter = new FilterFieldModel();
    component.getFilterFieldOptions('1', '1');
    component.onSelectDeselect(false);
    expect(component.activeFilter.values.length).toEqual(0);

    component.activeFilter.serchString = '1';
    component.onSelectDeselect(true);
    expect(component.filteredDropdownValues.length).toEqual(1);
  });
});
