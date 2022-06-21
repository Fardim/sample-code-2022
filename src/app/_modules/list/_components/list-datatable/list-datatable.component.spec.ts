import { FilterSaveModalComponent } from './../filter-save-modal/filter-save-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobaldialogService } from '@services/globaldialog.service';
import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ListService } from '@services/list/list.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ListDatatableComponent } from './list-datatable.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { PageEvent } from '@angular/material/paginator';
import { SharedModule } from '@modules/shared/shared.module';
import { ColumnSortDirection, FilterCriteria, ListPageFilters, ListPageViewDetails, ListPageViewFldMap, ViewsPage } from '@models/list-page/listpage';
import { FieldMetaData } from '@models/core/coreModel';
import { CoreService } from '@services/core/core.service';
import { FormControl } from '@angular/forms';
import { NgZone } from '@angular/core';

export class MockNgZone extends NgZone {
  constructor() {
    super({ enableLongStackTrace: false });
  }
}

describe('ListDatatableComponent', () => {
  let component: ListDatatableComponent;
  let fixture: ComponentFixture<ListDatatableComponent>;
  let listService: ListService;
  let coreService: CoreService;
  let router: Router;
  let sharedServices: SharedServiceService;
  let transientService: TransientService;
  let globalDialogService: GlobaldialogService;
  const routeParams = { moduleId: '1005' };
  const queryParams = { f: '' };
  let dialog: MatDialog;
  const mockDialogRef = { close: jasmine.createSpy('close'), open: jasmine.createSpy('open'), };
  const mockFilterList = {
    filterId: '1',
    description: 'chip test',
    isDefault: false,
    moduleId: '1005',
    filterOrder: 0,
    filterCriteria: [
      {
        endValue: '',
        esFieldPath: 'Region',
        fieldId: 'region',
        operator: 'equal',
        startValue: '',
        unit: 'date_range',
        values: ['TN'],
      },
    ] as FilterCriteria[],
  };
  const mockSavedFilters = [
    {
      filterId: '1',
      description: 'chip test',
      isDefault: false,
      moduleId: '1005',
      filterOrder: 0,
      filterCriteria: [
        {
          endValue: '',
          esFieldPath: 'Region',
          fieldId: 'region',
          operator: 'equal',
          startValue: '',
          unit: 'date_range',
          values: ['TN']
        },
        {
          endValue: '',
          esFieldPath: 'Start Date',
          fieldId: 'start_date',
          operator: 'equal',
          startValue: '',
          unit: 'static_date',
          values: [],
        }
      ] as FilterCriteria[]
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListDatatableComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams) } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDatatableComponent);
    component = fixture.componentInstance;

    listService = fixture.debugElement.injector.get(ListService);
    sharedServices = fixture.debugElement.injector.get(SharedServiceService);
    transientService = fixture.debugElement.injector.get(TransientService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    router = TestBed.inject(Router);
    coreService = fixture.debugElement.injector.get(CoreService);
    dialog = TestBed.inject(MatDialog);
    // fixture.detectChanges();

    spyOn(listService, 'getSavedFilters').withArgs('1005', 0).and.callFake(() => of(mockSavedFilters));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init component', () => {
    spyOn(component, 'getViewsList');
    spyOn(component, 'getTotalCount');
    spyOn(sharedServices, 'getViewDetailsData').and.returnValues(of({ isUpdate: true, viewDetails: new ListPageViewDetails() }), of({ isUpdate: false, viewDetails: new ListPageViewDetails() }));
    spyOn(component, 'getTableData');
    spyOn(component, 'getObjectTypeDetails');
    spyOn(component, 'getSearchHistory');

    component.ngOnInit();
    expect(component.getViewsList).toHaveBeenCalled();

    const filters = new ListPageFilters();
    filters.filterCriteria.push({ fieldId: 'region', values: ['TN'] } as FilterCriteria);

    queryParams.f = btoa(JSON.stringify(filters));
    component.ngOnInit();
    expect(component.filtersList.filterCriteria[0].fieldId).toEqual('region');
  });

  it('getViewsList() ', async(() => {
    component.moduleId = '1005';
    spyOn(component, 'updateTableColumns');

    spyOn(listService, 'getAllListPageViews').and.returnValues(of(new ViewsPage()), throwError({ message: 'api error' }));

    component.getViewsList();
    expect(listService.getAllListPageViews).toHaveBeenCalled();
    expect(component.currentView).toEqual(component.defaultView);
    expect(component.updateTableColumns).toHaveBeenCalled();

    // api error
    spyOn(console, 'error');
    component.getViewsList();
    expect(console.error).toHaveBeenCalled();
  }));

  it('should openTableViewSettings for new view', () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';

    component.openTableViewSettings();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/table-view-settings/${component.moduleId}/new` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('should getTableViewSettingURL for getting url', () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';

    component.currentView = {
      viewId: '1701',
      viewName: 'abc',
      moduleId: '1005',
      isDefault: false,
      isSystemView: false,
      fieldsReqList: []
    }
    const url = component.getTableViewSettingURL(true);
    expect(url).toEqual([{ outlets: { sb: `sb/list/table-view-settings/${component.moduleId}/1701` } }]);
  });

  it('sould get each view category list', () => {
    expect(component.systemViews.length).toEqual(0);
    expect(component.userViews.length).toEqual(0);
  });

  it('should check if a column is static', () => {
    expect(component.isStaticCol('_select')).toBeTrue();
    expect(component.isStaticCol('other')).toBeFalse();
  });

  it('should get total records count', () => {
    spyOn(listService, 'getDataCount').and.returnValues(of(100), throwError({ message: 'api error' }));

    component.getTotalCount();
    expect(component.totalCount).toEqual(100);
    expect(listService.getDataCount).toHaveBeenCalledWith(component.moduleId, []);

    // api error
    spyOn(console, 'error');
    component.getTotalCount();
    expect(console.error).toHaveBeenCalled();
  });

  it('should get table data', () => {
    const recordsList = [
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060856' },
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060857' },
    ];
    spyOn(listService, 'getTableData').and.returnValues(of(recordsList), throwError({ message: 'api error' }));

    component.getTableData();
    expect(component.dataSource.docLength()).toEqual(2);
    expect(listService.getTableData).toHaveBeenCalledWith(component.moduleId, '', component.recordsPageIndex, []);

    // api error
    spyOn(console, 'error');
    component.getTableData();
    expect(console.error).toHaveBeenCalled();
  });

  it('should get table page records', () => {
    spyOn(component.dataSource, 'getData');

    const pageEvent = new PageEvent();
    pageEvent.pageIndex = 5;

    component.onPageChange(pageEvent);
    component.onPageChange(pageEvent);
    expect(component.dataSource.getData).toHaveBeenCalledTimes(1);
  });

  it('should updateTableColumns', () => {
    // spyOn(component, 'getTableData');
    spyOn(component, 'getFldMetadata');

    component.updateTableColumns();

    component.currentView = null;
    component.updateTableColumns();

    // expect(component.getTableData).toHaveBeenCalledTimes(1);
    expect(component.getFldMetadata).toHaveBeenCalledTimes(1);
  });

  it('should get table width', () => {
    const width = component.staticColumns.length * 100;
    expect(component.tableWidth).toEqual(width);

    component.currentView.fieldsReqList.push(
      { fieldId: 'MATL_TYPE', width: '200' } as ListPageViewFldMap
    );
    component.currentView.fieldsReqList.push(
      { fieldId: 'NO_WIDTH', width: '' } as ListPageViewFldMap
    );
    expect(component.tableWidth).toEqual(width + 200 + 100);
  });

  it('should get table column width', () => {
    component.currentView.fieldsReqList.push({ fieldId: 'MATL_TYPE', width: '200' } as ListPageViewFldMap);

    expect(component.getColumnWidth('MATL_TYPE')).toEqual(200);
    expect(component.getColumnWidth('default')).toEqual(100);

    component.currentView.fieldsReqList.push(
      { fieldId: 'NO_WIDTH', width: '' } as ListPageViewFldMap
    );
    expect(component.getColumnWidth('NO_WIDTH')).toEqual(100);

  });

  it('should getDefaultViewId', () => {
    component.viewsList = {
      userViews: [
        { viewId: '1701', default: false },
        { viewId: '1702', default: true },
      ],
    } as ViewsPage;

    expect(component.getDefaultViewId()).toEqual('1702');

    component.viewsList.userViews[1].default = false;
    expect(component.getDefaultViewId()).toEqual('1701');
  });

  it('should getFieldDesc', () => {

    component.metadataFldLst = [
      { fieldId: 'MTL_GRP', fieldDescri: 'Material group' },
      { fieldId: 'NO_DESC', fieldDescri: '' }
    ] as FieldMetaData[];

    expect(component.getFieldDesc('MTL_GRP')).toEqual('Material group');
    expect(component.getFieldDesc('Other')).toEqual('Other');
    expect(component.getFieldDesc('NO_DESC')).toEqual('Unkown');
    expect(component.getFieldDesc('')).toEqual('Unkown');

  });

  it('showFilterValue, should display filter unit value in filter chip', () => {
    const filter = {
      endValue: '1643308199999',
      esFieldPath: 'hdvs.FLD_1642404134961',
      fieldId: 'FLD_1642404134961',
      fieldType: 'date',
      operator: 'EQUAL',
      startValue: '1643221800000',
      unit: 'Today'
    };

    const filterValue = component.showFilterValue(filter);
    expect(filterValue).toBeTruthy();
  })

  it('showFilterValue, should display filter specific date value in filter chip', () => {
    const filter = {
      esFieldPath: 'hdvs.FLD_1642404134961',
      fieldId: 'FLD_1642404134961',
      fieldType: 'date',
      operator: 'EQUAL',
      startValue: '1643308200000',
      unit: 'static_date',
      values: []
    };

    const filterValue = component.showFilterValue(filter);
    expect(filterValue).toEqual('01/28/2022');
  })

  it('showFilterValue, should display filter range date value in filter chip', () => {
    const filter = {
      endValue: '1643653799999',
      esFieldPath: 'hdvs.FLD_1642404134961',
      fieldId: 'FLD_1642404134961',
      fieldType: 'date',
      operator: 'EQUAL',
      startValue: '1643308200000',
      unit: 'static_range',
      values: []
    };

    const filterValue = component.showFilterValue(filter);
    expect(filterValue).toBeTruthy();
  })

  it('showFilterValue, should display time value in filter chip', () => {
    const filter = {
      endValue: '3600000',
      esFieldPath: 'hdvs.FLD_1642666851006',
      fieldId: 'FLD_1642666851006',
      fieldType: 'time',
      operator: 'EQUAL',
      startValue: '0',
      values: []
    };

    const filterValue = component.showFilterValue(filter);
    expect(filterValue).toBeTruthy();
  })

  it('addFilterChipValues, should return filter chip value based on filter values for text field', () => {
    const filterChipValue = component.addFilterChipValues(['test', 'abc']);
    expect(filterChipValue).toEqual('test + 1');
  })

  // it('removeAppliedFilter, remove filter from filter chip list', () => {
  //   component.filtersList.filterCriteria = mockSavedFilters[0].filterCriteria;
  //   spyOn(component,'mapFilterValues');
  //   spyOn(component,'getTableData');
  //   component.removeAppliedFilter(1);
  //   expect(component.filtersList.filterCriteria).toEqual([mockSavedFilters[0].filterCriteria[0]]);
  //   expect(component.mapFilterValues).toHaveBeenCalled();
  //   expect(component.getTableData).toHaveBeenCalled();
  // })

  it('applyFilterChanged, should apply filter changed values', () => {
    const filter = {
      endValue: '1643308199999',
      esFieldPath: 'hdvs.FLD_1642404134961',
      fieldId: 'FLD_1642404134961',
      fieldType: 'date',
      operator: 'EQUAL',
      startValue: '1643049000000',
      unit: 'Last 3 days',
      values: [],
      type: ''
    };
    component.filtersList.filterCriteria = [filter];
    spyOn(component, 'removedBlankFilterValues');
    component.applyFilterChanged();
    expect(component.filtersList.filterCriteria).toEqual([filter]);
    expect(component.removedBlankFilterValues).toHaveBeenCalled();
  })


  it('should openFiltersSideSheet', () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openFiltersSideSheet();

    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/filter-settings/${component.moduleId}` } }]);

    component.filtersList = mockFilterList;
    component.openFiltersSideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/filter-settings/${component.moduleId}` } }]);
  });

  it('should openDataListObjectSetting', () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openDataListObjectSetting();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/dataset-settings/${component.moduleId}` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('openFieldEditPopup() , should open field edit popup', () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openFieldEditPopup();
    expect(router.navigate).toHaveBeenCalledWith(['/home/list/fields', component.moduleId]);
  });

  it('openTransaction() , should open transaction popup', () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openTransaction('_0.MaterialCreationprocess', '48ce35c7-a8a9-44b1-a47c-dbd24bae6537', 'create', '', false);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/transaction/${component.moduleId}/create/_0.MaterialCreationprocess/48ce35c7-a8a9-44b1-a47c-dbd24bae6537/new` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('should resetAllFilters', () => {
    spyOn(router, 'navigate');
    component.resetAllFilters();
    expect(router.navigate).toHaveBeenCalledWith([], { queryParams: {} });
  });

  it('should getFldMetadata', () => {
    component.getFldMetadata([]);
    expect(component.metadataFldLst).toEqual([]);

    const response = [
      { fieldDescri: 'Material Type', dataType: 'CHAR', picklist: '1', maxChar: '50', strucId: '1', fieldId: 'MATL_TYPE4' },
    ];

    component.moduleId = '4';
    spyOn(coreService, 'getMetadataByFields')
      .and.returnValues(of(response), throwError({ message: 'api error' }));

    component.getFldMetadata(['name']);
    expect(coreService.getMetadataByFields).toHaveBeenCalled();
    expect(JSON.stringify(component.metadataFldLst)).toEqual(JSON.stringify(response));

    // api error
    spyOn(console, 'error');
    component.getFldMetadata(['name']);
    expect(console.error).toHaveBeenCalled();
  });

  it('should getObjectTypeDetails', () => {
    const response: any = {
      moduleid: 1005,
      description: 'Material',
      moduleDescriptionMap: {
        en: [
          { information: 'Material', description: 'Material' }
        ]
      }
    };
    component.locale = 'en';

    component.moduleId = '1005';
    spyOn(coreService, 'getEditObjectTypeDetails')
      .withArgs(component.moduleId)
      .and.returnValues(of(response), throwError({ message: 'api error' }));

    component.getObjectTypeDetails();
    expect(coreService.getEditObjectTypeDetails).toHaveBeenCalledWith(component.moduleId);
    expect(component.objectType.objectInfo).toEqual('Material');
    expect(component.objectType.objectdesc).toEqual('Material');

    // api error
    spyOn(console, 'error');
    component.getObjectTypeDetails();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle columns sort', () => {

    expect(component.isSortable('any')).toBeFalsy();

    spyOn(listService, 'upsertListPageViewDetails').and.returnValue(of(new ListPageViewDetails()));
    spyOn(component, 'getTableData');

    component.currentView = {
      viewId: 'test_view',
      fieldsReqList: [{ fieldId: 'MAT_GRP', sortDirection: ColumnSortDirection.asc }] as ListPageViewFldMap[]
    } as ListPageViewDetails;

    expect(component.getColumnActiveSortIcon('MAT_GRP')).toEqual('sort-up');

    component.sortDirChanged('MAT_GRP');
    expect(component.getColumnActiveSortIcon('MAT_GRP')).toEqual('sort-down');

    component.sortDirChanged('MAT_GRP');
    expect(component.getColumnActiveSortIcon('MAT_GRP')).toEqual('sort');

  });

  it('should isLargeHeader', () => {
    component.metadataFldLst = [
      { fieldId: 'header', fieldDescri: 'large header description with more than 50 chars length' },
    ] as FieldMetaData[];

    expect(component.isLargeHeader('header')).toBeTrue();
    expect(component.isLargeHeader('other')).toBeFalsy();
  });

  it('should isLargeCell', () => {
    const row = { region: { fieldData: 'large table cell content with more than 50 chars length' } };

    expect(component.isLargeCell(row, 'region')).toBeTrue();
    expect(component.isLargeCell(row, 'other')).toBeFalsy();
  });

  it('getSearchHistory() ', async(() => {

    component.moduleId = '1005';

    spyOn(listService, 'getUserSearchHistory')
      .and.returnValues(of([]), throwError({ message: 'api error' }));

    component.getSearchHistory();
    expect(listService.getUserSearchHistory).toHaveBeenCalledWith(component.moduleId);

    // api error
    spyOn(console, 'error');
    component.getSearchHistory();
    expect(console.error).toHaveBeenCalled();

  }));

  it('saveSearchEntry() ', async(() => {

    component.moduleId = '1005';
    const searchStr = 'ES1701';

    spyOn(listService, 'saveSearchHistory')
      .and.returnValues(of({}), throwError({ message: 'api error' }));

    component.saveSearchEntry(searchStr);
    expect(listService.saveSearchHistory).toHaveBeenCalledWith(component.moduleId, searchStr);
    expect(component.searchHistory.length).toEqual(1);

    // api error
    spyOn(console, 'error');
    component.saveSearchEntry(searchStr);
    expect(console.error).toHaveBeenCalled();

  }));

  // it('should clearSearchHistory() ', async(() => {

  //   spyOn(listService, 'clearSearchHistory')
  //     .and.returnValues(of({}), throwError({ message: 'api error'}));

  //   spyOn(component, 'getSearchHistory');
  //   component.clearSearchHistory();
  //   expect(listService.clearSearchHistory).toHaveBeenCalled();

  //   // api error
  //   spyOn(console, 'error');
  //   component.clearSearchHistory();
  //   expect(console.error).toHaveBeenCalled();
  // }));

  it('deleteFilter(), confirmation dialog returns yes', fakeAsync(() => {
    component.filtersList = mockFilterList;
    spyOn(component, 'deleteFilterById');
    spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });

    const result = component.deleteFilter();
    expect(result).toBeFalsy();

    component.deleteFilter();
    expect(component.deleteFilterById).toHaveBeenCalled();
  }));

  it('deleteFilter(), confirmation dialog returns no', fakeAsync(() => {
    spyOn(component, 'deleteFilterById');
    spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });

    component.filtersList = mockFilterList;
    const result = component.deleteFilter();
    expect(result).toBeFalsy();
  }));

  it('deleteFilterById(), delete filterList by FilterId', async(() => {
    const successResponse: any = {
      acknowledge: true,
      filterId: '',
      errorMsg: null,
    };

    const failResponse: any = {
      acknowledge: false,
      filterId: '',
      errorMsg: null,
    };


    spyOn(listService, 'deleteFilter').and.returnValues(of(successResponse), of(failResponse), throwError({ message: 'api error' }));
    spyOn(transientService, 'open');
    component.filtersList = mockFilterList;

    component.deleteFilterById(component.filtersList.filterId);
    expect(listService.deleteFilter).toHaveBeenCalledWith(component.filtersList.filterId);

    component.deleteFilterById(component.filtersList.filterId);
    expect(transientService.open).toHaveBeenCalled();

    // api error
    spyOn(console, 'error');
    component.deleteFilterById(component.filtersList.filterId);
    expect(console.error).toHaveBeenCalled();
  }));

  it('isAllSelected(), check all the tags are selected', () => {
    const recordsList = [
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060856' },
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060857' }
    ]
    spyOn(listService, 'getTableData').and.returnValues(of(recordsList), throwError({ message: 'api error' }));

    component.getTableData();
    let result = component.isAllSelected();
    expect(result).toBeFalse();
    component.masterToggle();
    result = component.isAllSelected();
    expect(result).toBeTrue();

  });

  it('masterToggle(), check all the tags are selected', () => {

    const recordsList = [
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060856' },
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060857' }
    ]
    spyOn(listService, 'getTableData').and.returnValues(of(recordsList), throwError({ message: 'api error' }));
    component.getTableData();

    component.masterToggle();
    expect(component.selection.selected.length).toEqual(2);

    component.masterToggle();
    expect(component.selection.selected.length).toEqual(0);
  });

  it('checkboxLabel()', () => {
    const recordsList = [
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060856' },
      { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060857' }
    ]
    spyOn(listService, 'getTableData').and.returnValues(of(recordsList), throwError({ message: 'api error' }));
    component.getTableData();

    let label = component.checkboxLabel(null);
    expect(label).toEqual('deselect all');
    component.masterToggle();
    label = component.checkboxLabel(null);
    expect(label).toEqual('select all');

    const result = component.checkboxLabel({});
    expect(result).toBeFalsy();
  });

  it('onChangeSelectedSavedFilter(), selected a saved filter from menu', () => {
    spyOn(component, 'getTotalCount');
    spyOn(component, 'getTableData');
    component.isPageRefresh = false;
    component.onChangeSelectedSavedFilter(mockSavedFilters[0]);
    // expect(component.getTotalCount).toHaveBeenCalled();
    // expect(component.getTableData).toHaveBeenCalled();
    expect(component.isPageRefresh).toEqual(false);
  });

  it('resetSavedFilter(), set the selectedSavedFilters and filtersList filterCriteria to empty array', () => {
    component.isPageRefresh = false;

    const result = component.resetSavedFilter();
    expect(result).toBeFalsy();

    component.selectedSavedFilters = mockSavedFilters[0];
    component.resetSavedFilter();
    expect(component.selectedSavedFilters.filterCriteria.length).toEqual(0);
    expect(component.filtersList.filterCriteria.length).toEqual(0);
    expect(component.isPageRefresh).toEqual(false);
  });

  it('should rowHasWarning()', () => {

    let row = { purchase: 150 };
    expect(component.rowHasWarning(row)).toBeTrue();
    row = { purchase: 500 };
    expect(component.rowHasWarning(row)).toBeFalse();
    row = { purchase: 500 };
    expect(component.rowHasError(row)).toBeFalse();
    row = { purchase: 850 };
    expect(component.rowHasError(row)).toBeTrue();

  });

  // it('should displayedRecordsRange()', () => {
  //   spyOn(listService, 'getDataCount').and.returnValues(of(100), throwError({message: 'api error'}));
  //   component.getTotalCount();
  //   expect(component.totalCount).toEqual(100);

  //   expect(component.displayedRecordsRange).toEqual('1 to 50 of 100');

  //   component.totalCount = 0;
  //   expect(component.displayedRecordsRange).toEqual('');
  // });

  it('should saveFilterCriterias()', () => {
    const obj = {
      afterClosed: () => {
        return of('New Filter Name');
      }
    };
    const emptyObj = {
      afterClosed: () => {
        return of('');
      }
    };
    spyOn(listService, 'upsertListFilters').and.returnValues(of({ filterId: 'NewId' }), throwError({ message: 'api error' }));;
    spyOn(dialog, 'open').and.returnValues(obj as MatDialogRef<FilterSaveModalComponent>, emptyObj as MatDialogRef<FilterSaveModalComponent>);
    component.saveFilterCriterias();

    expect(dialog.open).toHaveBeenCalled();
    expect(listService.upsertListFilters).toHaveBeenCalled();
    expect(component.subscriptionsList.length).toBeGreaterThan(0);

    const result = component.saveFilterCriterias();
    expect(result).toBeFalsy();
  });

  it('should saveFilterCriterias(), upsertListFilters throws error', async(() => {
    const obj = {
      afterClosed: () => {
        return of('New Filter Name');
      }
    };
    spyOn(listService, 'upsertListFilters').and.returnValues(throwError({ message: 'api error' }));
    spyOn(dialog, 'open').and.returnValues(obj as MatDialogRef<FilterSaveModalComponent>);
    spyOn(console, 'error');

    // api error
    component.saveFilterCriterias();
    expect(console.error).toHaveBeenCalled();
  }));

  it('should onColumnsResize()', async(() => {
    const listPageViewDetails = new ListPageViewDetails();
    spyOn(listService, 'upsertListPageViewDetails').and.returnValues(of(listPageViewDetails));
    spyOn(console, 'log');
    component.currentView.fieldsReqList.push(
      { fieldId: 'MATL_TYPE', width: '200' } as ListPageViewFldMap
    );
    component.currentView.fieldsReqList.push(
      { fieldId: 'NO_WIDTH', width: '' } as ListPageViewFldMap
    );

    const result = component.onColumnsResize({ columnId: 'MATL_TYPE', width: '' });
    expect(result).toBeFalsy();
  }));

  it('should deleteView(), globalDialog returns yes', fakeAsync(() => {
    const result = component.deleteView('default');
    expect(result).toBeFalsy();

    const listPageViewDetails = new ListPageViewDetails();
    spyOn(transientService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });
    spyOn(listService, 'deleteListPageView').and.returnValues(of(listPageViewDetails), throwError({ message: 'api error' }));
    spyOn(console, 'error');

    component.deleteView('SomeViewId');

    expect(listService.deleteListPageView).toHaveBeenCalled();

    component.deleteView('SomeViewId');
    expect(console.error).toHaveBeenCalled();
  }));

  it('should deleteView(), globalDialog returns no', fakeAsync(() => {
    spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });

    const result = component.deleteView('SomeViewId');

    expect(result).toBeFalsy();
  }));

  it('should mapFilerValues()', () => {
    const filters = new ListPageFilters();
    filters.filterCriteria.push(
      { fieldId: 'region', values: ['TN'], unit: 'single_value' } as FilterCriteria
    );

    queryParams.f = btoa(JSON.stringify(filters));
    component.ngOnInit();

    const result = component.mapFilerValues();
    console.log(result);
    // expect(result.length).toBeGreaterThan(0);
    expect(component.mapFilerValues).toBeTruthy();
  });

  it('should getViewDetails()', () => {
    component.moduleId = '1005';
    component.currentView.viewId = '1701';
    const result = component.getViewDetails('1701');
    expect(result).toBeFalsy();

    // need to finish the method with rxjs concate
  });

  it('scroll(), should get more saved filters on scroll down', async(() => {
    spyOn(component, 'getSavedFilters');
    // component.ngOnInit();
    component.scroll(true);
    expect(component.savedSearchPageIndex).toEqual(1);
    expect(component.getSavedFilters).toHaveBeenCalled();

    component.infinteScrollLoading = false;
    component.scroll(false);
    expect(component.savedSearchPageIndex).toEqual(0);

    const result = component.scroll(true);
    expect(result).toBeNull();
  }));

  it('openDependencyRuleSideSheet()', async () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openDependencyRuleSideSheet();

    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/dependency-rule/${component.moduleId}` } }], { queryParamsHandling: 'preserve' });
  });

  // it('removeAppliedFilter(), to remove applied filter', async() =>{
  //   const recordsList = [
  //     { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060856' },
  //     { hdvs: { DATEMODIFIED: { vc: [{ c: '1598857068858' }] } }, id: '20060857' },
  //   ];
  //   component.filtersList = mockFilterList;
  //   spyOn(listService, 'getDataCount').and.returnValues(of(100), throwError({ message: 'api error' }));
  //   spyOn(listService, 'getTableData').and.returnValues(of(recordsList), throwError({ message: 'api error' }));
  //   component.removeAppliedFilter(0);
  //   expect(component.filtersList.filterCriteria.length).toEqual(0);
  // });

  it('openTransaction, to open transaction', async () => {
    spyOn(router, 'navigate');
    const flowId = '1';
    const layoutId = '101';
    component.moduleId = '1005';
    component.openTransaction(flowId, layoutId, 'create', '', false);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/transaction/${component.moduleId}/create/${flowId}/${layoutId}/new` } }], { queryParamsHandling: 'preserve' });
  });

  it('openDataListObjectSetting, to open datalist object settings', async () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openDataListObjectSetting();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/dataset-settings/${component.moduleId}` } }], { queryParamsHandling: 'preserve' });
  });

  it('openFieldEditPopup(), open field edit popup', async () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openFieldEditPopup();
    expect(router.navigate).toHaveBeenCalledWith(['/home/list/fields', component.moduleId]);
  });

  it('isCheckboxSelected(), to check checkbox selected', async () => {
    const element = { OBJECTNUMBER: { fieldData: '101' } };
    component.selectedData = [{ id: '101' }];
    component.isFromSideSheet = 'true';
    component.isCheckboxSelected(element);
    expect(component.isCheckboxSelected).toBeTruthy();
  });

  it('openFieldReadOnlyPopup(), Open the fields into display  mode', async () => {
    spyOn(router, 'navigate');
    component.moduleId = '1005';
    component.openFieldReadOnlyPopup();
    expect(router.navigate).toHaveBeenCalledWith(['/home/list/fields', component.moduleId, 'read-only']);
  });

  // it('viewRecord()', async()=>{
  //   spyOn(router, 'navigate');
  //   component.moduleId = '1005';
  //   const doc_id = '101';
  //   component.viewRecord(doc_id);

  //   expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/transaction/${component.moduleId}/view/_0.MaterialCreationprocess/48ce35c7-a8a9-44b1-a47c-dbd24bae6537/${doc_id}` } }], { queryParamsHandling: 'preserve' });
  // });

  // it('editRecord(), to delete the records', async() => {
  //   spyOn(router, 'navigate');
  //   component.moduleId = '1005';
  //   const doc_id = '101';
  //   component.editRecord(doc_id);
  //   expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/transaction/${component.moduleId}/change/_0.MaterialCreationprocess/48ce35c7-a8a9-44b1-a47c-dbd24bae6537/${doc_id}` } }], { queryParamsHandling: 'preserve' });
  // });

  it('close(), to close sidesheet', async () => {
    component.selection.isSelected({});
    spyOn(sharedServices, 'setModuleListData').withArgs({ fromType: 'datatable', data: [] });
    component.close();
    expect(component.selectedData.length).toEqual(0);
  });

  it('upsertFilterCriteria(), upsert a global search filter criteria', async () => {
    fixture.detectChanges();
    component.filtersList = mockFilterList;
    const filter = {
      endValue: '',
      esFieldPath: 'Region',
      fieldId: 'region',
      operator: 'equal',
      startValue: '',
      unit: 'date_range',
      values: ['TN'],
    } as FilterCriteria;

    component.upsertFilterCriteria(filter);
    expect(component.filtersList.filterCriteria.length).toEqual(1);

    const filter1 = {
      endValue: '',
      esFieldPath: 'Region',
      fieldId: 'new',
      operator: 'equal',
      startValue: '',
      unit: 'date_range',
      values: ['TN'],
    } as FilterCriteria;

    component.upsertFilterCriteria(filter1);
    expect(component.filtersList.filterCriteria.length).toEqual(2);
  });

  it('applyFilter()', async () => {
    component.globalSearchControl.setValue({});
    spyOn(listService, 'saveSearchHistory')
      .and.returnValues(of({}), throwError({ message: 'api error' }));
    component.applyFilter();
    expect(component.showGlobalFilter).toBeFalse();
  });

  it('applyHistoryEntry(), global search apply history entry', async () => {
    component.globalSearchControl = new FormControl();
    component.applyHistoryEntry('new');
    expect(component.globalSearchControl.value).toEqual('new');
  });

  // it('applyInlineFilter(), apply an inline column filter', async() => {
  //   fixture.detectChanges();
  //   component.filtersList = mockFilterList;
  //   const filter = {
  //     endValue: '',
  //     esFieldPath: 'Region',
  //     fieldId: 'region',
  //     operator: 'equal',
  //     startValue: '',
  //     unit: 'date_range',
  //     values: ['TN'],
  //   } as FilterCriteria;

  //   component.applyInlineFilter(filter);
  //   expect(component.filtersList.filterCriteria.length).toEqual(1);

  //   const filter1 = {
  //     endValue: '',
  //     esFieldPath: 'Region',
  //     fieldId: 'new',
  //     operator: 'equal',
  //     startValue: '',
  //     unit: 'date_range',
  //     values: ['TN'],
  //   } as FilterCriteria;

  //   component.applyInlineFilter(filter1);
  //   expect(component.filtersList.filterCriteria.length).toEqual(2);
  // });
});
