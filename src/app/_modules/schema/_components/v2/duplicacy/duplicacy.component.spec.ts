import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ModuleInfo, SchemaDashboardPermission, SchemaListDetails, SchemaStaticThresholdRes, SchemaVariantsModel } from '@models/schema/schemalist';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { GroupDataTableComponent } from '@modules/schema/_components/v2/duplicacy/group-data-table/group-data-table.component';
import { SchemaService } from '@services/home/schema.service';
import { Observable, of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { CatalogCheckService } from '@services/home/schema/catalog-check.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FieldInputType, FilterCriteria, MetadataModel, MetadataModeleResponse, SchemaTableAction, SchemaTableData, SchemaTableViewFldMap, SchemaTableViewRequest, STANDARD_TABLE_ACTIONS, TableActionViewType } from '@models/schema/schemadetailstable';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MasterRecordChangeRequest, RECORD_STATUS, RECORD_STATUS_KEY, RequestForCatalogCheckData } from '@models/schema/duplicacy';
import { DuplicacyDataSource } from './duplicacy-data-source';
import { DuplicacyComponent } from './duplicacy.component';
import { Router } from '@angular/router';
import { Userdetails } from '@models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { SimpleChanges, ViewContainerRef } from '@angular/core';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { AddFilterOutput } from '@models/schema/schema';
import { MatSortable } from '@angular/material/sort';
import { GlobalCountComponent } from '../_builder/global-count/global-count.component';
import { BadgeStatus } from '@services/home/schema/badge.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { CoreService } from '@services/core/core.service';

describe('DuplicacyComponent', () => {
  let component: DuplicacyComponent;
  let fixture: ComponentFixture<DuplicacyComponent>;
  let schemaService: SchemaService;
  let coreService: CoreService;
  let schemaVariantService: SchemaVariantService;
  let schemaDetailService: SchemaDetailsService;
  let catalogService: CatalogCheckService;
  let snackBar: TransientService;
  let router: Router;
  let sharedService: SharedServiceService;

  const dataSourceSpy= {
    getRow: jasmine.createSpy('getRow')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DuplicacyComponent, SearchInputComponent, GroupDataTableComponent, GlobalCountComponent, SkeletonLoaderComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, HttpClientTestingModule, SharedModule],providers:[
        {
          provide: DuplicacyDataSource,
          useValue: dataSourceSpy
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicacyComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    coreService = fixture.debugElement.injector.get(CoreService);
    component.schemaId = '1';
    component.variantId = '0';
    component.moduleId = '1';
    component.schemaInfo = { runId: '123' } as SchemaListDetails;

    schemaVariantService = fixture.debugElement.injector.get(SchemaVariantService);
    schemaDetailService = fixture.debugElement.injector.get(SchemaDetailsService);
    catalogService = fixture.debugElement.injector.get(CatalogCheckService);
    snackBar = fixture.debugElement.injector.get(TransientService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);

    component.dataSource = new DuplicacyDataSource(catalogService, snackBar, null);

    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get schema statistics', async(() => {

    spyOn(schemaService, 'getSchemaThresholdStaticsV2').withArgs(component.schemaId, component.variantId, [], [])
      .and.returnValues(of({ schemaId: component.schemaId } as SchemaStaticThresholdRes), throwError({status: 500}));
    jasmine.clock().install();
    component.getSchemaStatics();
    jasmine.clock().tick(1001);
    expect(schemaService.getSchemaThresholdStaticsV2).toHaveBeenCalledWith(component.schemaId, component.variantId, [], []);

    // error response
    spyOn(console, 'error');
    component.getSchemaStatics();
    jasmine.clock().tick(1001);
    expect(console.error).toHaveBeenCalled();
    jasmine.clock().uninstall();
  }));

  it('should get variant details', async(() => {

    const searchInput = TestBed.createComponent(SearchInputComponent);
    component.tableSearchInput = searchInput.componentInstance;

    spyOn(component.filterCriteria, 'next');

    component.userDetails = {
      currentRoleId: 'AD',
      userName: 'harshit',
      plantCode: '0'
    } as Userdetails
    spyOn(schemaVariantService, 'getVariantdetailsByvariantId').withArgs(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName).and.returnValues(of({
      schemaId: component.schemaId,
      filterCriteria: [
        { fieldId: 'MATL_TYPE', type: 'DROPDOWN', values: ['67', '2'] },
        { fieldId: 'id', type: 'INLINE', values: ['search text'] }
      ]
    } as SchemaVariantsModel), of(null), throwError({status: 500}));

    component.getVariantDetails();
    component.getVariantDetails();
    expect(schemaVariantService.getVariantdetailsByvariantId).toHaveBeenCalledWith(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName);
    expect(component.filterCriteria.next).toHaveBeenCalledTimes(1);

    spyOn(console, 'error');
    component.getVariantDetails();
    expect(console.error).toHaveBeenCalled();

  }));


  it('loadDropValues(), load current field .. ', async(() => {

    component.loadDropValues(null);
    expect(component.loadDopValuesFor).toBeFalsy();
    // mock data
    const data: FilterCriteria = { fieldId: 'MATL_TYPE', type: 'DROPDOWN', values: ['ZMRO', 'ALT'] } as FilterCriteria;
    component.loadDropValues(data);
    expect(component.loadDopValuesFor.checkedValue.length).toEqual(2);
  }));

  it('updateFilterCriteria(), update filter criteria .. ', async(() => {
    const dropValue: DropDownValue[] = [{
      CODE: 'ZMRO',
      FIELDNAME: 'MATL_TYPE',
      LANGU: 'en',
      PLANTCODE: '0',
      SNO: '872372',
      TEXT: 'Zmro Text'
    }];


    const exitingFilter: FilterCriteria[] = [{
      fieldId: 'MATL_TYPE',
      type: 'DROPDOWN',
      values: ['TEST'],
      fldCtrl: { fieldId: 'MATL_TYPE' } as MetadataModel,
      filterCtrl: { fldCtrl: { fieldId: 'MATL_TYPE' } as MetadataModel, selectedValues: [] }
    }];

    component.filterCriteria.next(exitingFilter);
    component.loadDopValuesFor = { fieldId: 'MATL_TYPE', checkedValue: [] };

    component.updateFilterCriteria(dropValue);
    const res = component.filterCriteria.getValue();
    expect(res.values.length).toEqual(0);

    component.updateFilterCriteria([]);
    expect(component.filterCriteria.getValue().length).toEqual(1);

    component.filterCriteria.next(null);
    spyOn(component.filterCriteria, 'next');
    component.updateFilterCriteria(dropValue);
    expect(component.filterCriteria.next).toHaveBeenCalledTimes(0);

  }));


  it('should get data table headers', (async () => {
    const response = '7466345563';
    const metadataModeleResponse = { headers: [{ fieldId: 'MATL', fieldDescri: 'material location' }] } as MetadataModeleResponse;

    spyOn(coreService, 'getMetadataFieldsByModuleId').withArgs([component.moduleId], '')
      .and.returnValues(of(metadataModeleResponse));

    spyOn(schemaDetailService, 'getSelectedFieldsByNodeIds').withArgs(component.schemaId, component.variantId, ['header'])
      .and.returnValues(of([{fieldsList: []}]));
    spyOn(schemaDetailService,'updateSchemaTableView').and.returnValue(of(response));
    spyOn(component,'calculateDisplayFields');
    spyOn(component,'getSchemaStatics');

    const orderFld: SchemaTableViewFldMap[] = [];

    const mockOrderFld = {
      editable: true,
      fieldId: "0",
      nodeId: "header",
      nodeType: "HEADER",
      order: 0
    } as SchemaTableViewFldMap;

    component.getTableHeaders();

    orderFld.push(mockOrderFld);

    const schemaTableViewRequest: SchemaTableViewRequest = new SchemaTableViewRequest();
    schemaTableViewRequest.schemaId = component.schemaId;
    schemaTableViewRequest.variantId = component.variantId;
    schemaTableViewRequest.schemaTableViewMapping = orderFld;

    expect(coreService.getMetadataFieldsByModuleId).toHaveBeenCalledWith([component.moduleId], '');
    expect(schemaDetailService.getSelectedFieldsByNodeIds).toHaveBeenCalledWith(component.schemaId, component.variantId, ['header']);
    expect(component.metadataFldLst).toEqual(metadataModeleResponse);
    expect(schemaDetailService.updateSchemaTableView).toHaveBeenCalledTimes(1);
    expect(component.selectedFields.length).toEqual(1);
    expect(component.calculateDisplayFields).toHaveBeenCalled();
    expect(component.getSchemaStatics).toHaveBeenCalledWith(false);
  }));


  it('should fetch table data', async(() => {

    spyOn(component.dataSource, 'reset');
    component.getData();
    expect(component.dataSource.reset).toHaveBeenCalled();

    component.groupKey = 'fuzzy';
    component.groupId = '1701';

    const request = new RequestForCatalogCheckData();
    request.schemaId = component.schemaId;
    request.groupId = component.groupId;
    request.page = 0;
    request.size = 40;
    request.key = component.groupKey;
    request.runId = '123';
    request.filterCriterias = [];
    request.plantCode = '0';
    request.sort = {};
    request.requestStatus = component.activeTab;

    const response = {doc: [{id: '1701', masterRecord: '1', isReviewed: true, hdvs: { region: {vc: ['Asia'], oc: null, ls: 'Region'}}},
        {id: '1702', DEL_FLAG: '1', hdvs: { priority: {vc: null , oc: 'High'}}}, {id: '1703'}]}

    spyOn(catalogService, 'getCatalogCheckRecords').and.returnValues(of(response), of(response), throwError({status: 500}));

    component.getData();
    expect(catalogService.getCatalogCheckRecords).toHaveBeenCalledWith(request);
    expect(component.dataSource.docLength()).toEqual(3);

    request.page = 1;
    component.getData(true);
    expect(catalogService.getCatalogCheckRecords).toHaveBeenCalledWith(request);
    expect(component.dataSource.docLength()).toEqual(6);

    request.runId = '';
    request.page = 0;
    component.schemaInfo = null;
    spyOn(console, 'error');
    component.getData();
    expect(catalogService.getCatalogCheckRecords).toHaveBeenCalledWith(request);
    expect(console.error).toHaveBeenCalled();

  }));

  it('should check static columns', () => {
    expect(component.isStaticColumn('select')).toEqual(true);
  });

  it('should refresh table data on new variantId', (async () => {
    component.userDetails = {
      currentRoleId: 'AD',
      userName: 'harshit',
      plantCode: '0'
    } as Userdetails
    spyOn(schemaVariantService, 'getVariantdetailsByvariantId').withArgs('1', component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName).and.returnValue(of({
      schemaId: component.schemaId,
      filterCriteria: [
        {
          fieldId: 'MATL_TYPE',
          type: 'DROPDOWN',
          values: ['67', '2']
        } as FilterCriteria
      ]
    } as SchemaVariantsModel));

    component.schemaInfo = {
      schemaId: component.schemaId, runId: '123',
      variants: [{ variantId: '1', schemaId: component.schemaId, variantName: 'first variant' } as SchemaVariantsModel]
    } as SchemaListDetails;

    component.dataScope = [{ variantId: '1', schemaId: component.schemaId, variantName: 'first variant' } as SchemaVariantsModel];

    component.groupKey = 'fuzzy';
    component.groupId = '1701';

    const request = new RequestForCatalogCheckData();
    request.schemaId = component.schemaId;
    request.groupId = component.groupId;
    request.schemaId = component.schemaId;
    request.groupId = component.groupId;
    request.page = 0;
    request.size = 20;
    request.key = component.groupKey;
    request.runId = '123';
    request.filterCriterias = [];
    request.plantCode = '0';
    request.sort = {};
    request.requestStatus = component.activeTab;

    spyOn(catalogService, 'getCatalogCheckRecords').withArgs(request)
      .and.returnValue(of());
    spyOn(component, 'getSelectedTableColumns');

    component.variantChange('1');
    expect(component.variantName).toEqual('first variant');

    component.variantChange('1');
    component.variantChange('0');
    expect(schemaVariantService.getVariantdetailsByvariantId).toHaveBeenCalledTimes(1);


  }));

  it('should add/remove an inline filter', () => {

    component.inlineSearch('material');

    expect(component.filterCriteria.getValue().length).toEqual(1);

    component.inlineSearch('');
    expect(component.filterCriteria.getValue().length).toEqual(0);

    spyOn(component.filterCriteria, 'next');
    component.inlineSearch('material');
    expect(component.filterCriteria.next).toHaveBeenCalledTimes(1);

    component.filterCriteria.next([{fieldId: 'region', type: 'INLINE', values: ['search text']}]);
    component.inlineSearch('new search text');
    expect(component.filterCriteria.getValue()[0].values).toEqual(['new search text']);

  });

  it('should return all rows selected', () => {
    expect(component.isAllSelected()).toEqual(true);
  });

  it('should clear selection', () => {
    spyOn(component.selection, 'clear');
    component.masterToggle();
    expect(component.selection.clear).toHaveBeenCalled();

    component.dataSource.docValue().push ({fieldId: 'objnumber', fieldData: '1701'} as SchemaTableData);
    component.masterToggle();
    expect(component.isAllSelected()).toBeTrue();
  });

  it('should remove an applied filter', () => {

    component.inlineSearch('material');

    const filterCriteria = {
      fieldId: 'id',
      type: 'INLINE',
      values: ['material']
    } as FilterCriteria;


    component.removeAppliedFilter(filterCriteria);
    expect(component.filterCriteria.getValue().length).toEqual(0);

    component.removeAppliedFilter(filterCriteria);
    expect(component.filterCriteria.getValue().length).toEqual(0);

  });

  it('should update table data after group change', () => {

    const group = {
      groupId: 'group1',
      groupKey: 'exact',
      groupDesc: 'Group 1'
    }

    spyOn(component, 'getData');

    component.updateSelectedGroup(group);
    expect(component.groupId).toEqual(group.groupId);
    expect(component.groupKey).toEqual(group.groupKey);

    component.updateSelectedGroup(group);

    expect(component.getData).toHaveBeenCalledTimes(1);


  });

  it('should load more data on table scroll end', () => {

    const event = {
      target: {
        clientHeight: 20,
        scrollTop: 70,
        scrollHeight: 100
      }
    }

    spyOn(component, 'getData');

    component.onScroll(event);
    expect(component.lastScrollTop).toEqual(event.target.scrollTop);

    event.target.scrollTop = 80;

    component.onScroll(event);

    expect(component.getData).toHaveBeenCalledTimes(1);

  });

  it('should reset applied filter', () => {

    component.inlineSearch('material');
    expect(component.filterCriteria.getValue().length).toEqual(1);

    component.resetAppliedFilter();
    expect(component.filterCriteria.getValue().length).toEqual(0);

  });

  it('should change tab status', () => {

    spyOn(component, 'getData');
    spyOn(router, 'navigate');

    component.changeTabStatus(component.activeTab);
    component.changeTabStatus('warning');
    expect(component.activeTab).toEqual('warning');


  });

  it('should get checkbox label', () => {
    expect(component.checkboxLabel()).toContain('select');
  });

  it('openSummarySideSheet(), should navigate to schema summary side sheet', () => {
    component.moduleId = '1005';
    component.schemaId = '2563145';

    spyOn(router, 'navigate');
    component.openSummarySideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/check-data/${component.moduleId}/${component.schemaId}` } }], {queryParamsHandling: 'preserve'})
  })

  it('getDataScope(), should return all variants of a schema', async () => {
    component.schemaId = '1005';
    const body = {
      from: 0,
      size: 10,
      variantName: null
    };
    spyOn(schemaVariantService, 'getDataScopesList').withArgs(component.schemaId, 'RUNFOR', body)
      .and.returnValues(of([]), of([]), throwError({status: 500}))

    component.getDataScope();
    expect(schemaVariantService.getDataScopesList).toHaveBeenCalledWith(component.schemaId, 'RUNFOR', body);

    spyOn(component, 'variantChange');
    component.getDataScope('1');
    expect(component.variantChange).toHaveBeenCalledWith('1');

    spyOn(console, 'error');
    component.getDataScope('2');
    expect(console.error).toHaveBeenCalled();
  })

  it('openSummarySideSheet(), should navigate to schema summary side sheet', () => {
    spyOn(router, 'navigate');
    component.openSummarySideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/check-data/${component.moduleId}/${component.schemaId}` } }], {queryParamsHandling: 'preserve'})
  })

  it('openDataScopeSideSheet(), should navigate to data scope side sheet', () => {
    spyOn(router, 'navigate');
    component.openDataScopeSideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/data-scope/${component.moduleId}/${component.schemaId}/new/sb` } }], {queryParamsHandling: 'preserve'})
  });

  it('should get input type', () => {

    const metadataField = {
      headers: {
        MATL_TYPE: {
          picklist: '0',
          dataType: 'NUMC',
          isCheckList: 'false'
        }
      }
    }

    component.metadataFldLst = metadataField;
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.NUMBER);

    component.metadataFldLst.headers.MATL_TYPE.dataType = 'DATS';
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.DATE);
    component.metadataFldLst.headers.MATL_TYPE.dataType = 'DTMS';
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.DATE);

    component.metadataFldLst.headers.MATL_TYPE = { picklist: '1', isCheckList: 'false' };
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.SINGLE_SELECT);
    component.metadataFldLst.headers.MATL_TYPE = { picklist: '30', isCheckList: 'false' };
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.SINGLE_SELECT);
    component.metadataFldLst.headers.MATL_TYPE = { picklist: '37', isCheckList: 'false' };
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.SINGLE_SELECT);

    component.metadataFldLst.headers.MATL_TYPE = { picklist: '1', isCheckList: 'true' };
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.MULTI_SELECT);
    component.metadataFldLst.headers.MATL_TYPE = { picklist: '30', isCheckList: 'true' };
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.MULTI_SELECT);
    component.metadataFldLst.headers.MATL_TYPE = { picklist: '37', isCheckList: 'true' };
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.MULTI_SELECT);

    component.metadataFldLst.headers.MATL_TYPE = {};
    expect(component.getFieldInputType('MATL_TYPE')).toEqual(FieldInputType.TEXT);

  });

  it('should get record status class', async(() => {

    const record = {};
    record[RECORD_STATUS_KEY] = { fieldData: RECORD_STATUS.MASTER };

    expect(component.getRecordStatusClass(record)).toEqual('success-status');

    record[RECORD_STATUS_KEY].fieldData = RECORD_STATUS.NOT_DELETABLE;
    expect(component.getRecordStatusClass(record)).toEqual('warning-status');

    record[RECORD_STATUS_KEY].fieldData = RECORD_STATUS.DELETABLE;
    expect(component.getRecordStatusClass(record)).toEqual('unselected');

  }));

  it('should format cell data', () => {
    const metadataFldLst = {
      headers: {
        diw_15: {
          isCheckList: 'false',
          picklist: '1',
          value: 'USA'
        }
      }
    }

    component.metadataFldLst = metadataFldLst;
    let result = component.formatCellData('diw_15', 'USA');
    expect(result).toEqual('USA');

    metadataFldLst.headers.diw_15.isCheckList = 'true';
    result = component.formatCellData('diw_15', ['USA', 'France']);
    expect(result).toEqual('USA,France');

  });

  it('openTableColumnSettings(), open table column setting ', async(() => {
    spyOn(router, 'navigate');
    component.openTableColumnSettings();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: 'sb/schema/table-column-settings' } }], {queryParamsHandling: 'preserve'});
  }));

  it('markAsMasterRecord(), markAsMasterRecord ', async(() => {

    const row = {
      OBJECTNUMBER: { fieldData: 'diw_15' }
    };

    const request = new MasterRecordChangeRequest();
    request.id = row.OBJECTNUMBER.fieldData;
    request.schemaId = component.schemaId;
    request.runId = component.schemaInfo.runId;
    request.oldId = '';

    spyOn(catalogService, 'markAsMasterRecord').withArgs(request)
      .and.returnValue(of('success'));

    component.markAsMasterRecord(row);
    expect(catalogService.markAsMasterRecord).toHaveBeenCalledWith(request);


  }));

  it('openExecutionTrendSideSheet ', async(() => {
    spyOn(router, 'navigate');
    component.openExecutionTrendSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/schema/execution-trend/${component.moduleId}/${component.schemaId}/${component.variantId}` } }], {queryParamsHandling: 'preserve'});
  }));

  it('should get schema permissions', () => {

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321'} as SchemaListDetails;
    expect(component.isEditer).toBeFalsy();
    expect(component.isReviewer).toBeFalsy();
    expect(component.isApprover).toBeFalsy();
    component.schemaInfo  = {schemaId: 'schema1', runId:'889321', collaboratorModels: {
      isEditer: true
    }} as SchemaListDetails;
    expect(component.isEditer).toBeTruthy();
  });

  it('should filter primary and secondary actions', () => {
    expect(component.primaryActions.length).toEqual(3);
    expect(component.secondaryActions.length).toEqual(0);

  });

  it('should do table action', () => {
    spyOn(component, 'approveRecords');
    spyOn(component, 'rejectRecords');
    spyOn(component, 'markForDeletion');

    component.userDetails = new Userdetails();
    component.schemaInfo  = {schemaId: 'schema1', runId:'889321',
      collaboratorModels: {isAdmin: true} as SchemaDashboardPermission} as SchemaListDetails;

    component.doAction(component.tableActionsList[0], {});
    expect(component.approveRecords).toHaveBeenCalledWith('inline', {});

    component.schemaInfo.collaboratorModels.isReviewer = true;

    component.doAction(component.tableActionsList[0], {});
    expect(component.approveRecords).toHaveBeenCalledWith('inline', {});

    component.doAction(component.tableActionsList[1], {});
    expect(component.rejectRecords).toHaveBeenCalledWith('inline', {});

    component.doAction(component.tableActionsList[2], {});
    expect(component.markForDeletion).toHaveBeenCalledWith({});

  });

  it('should check if global actions are enabled', () => {
    expect(component.isGlobalActionsEnabled).toEqual(false);
  });

  it('should check if user has action permission', async (() => {

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321'} as SchemaListDetails;

    const action = {schemaId: component.schemaId, isPrimaryAction: false, actionCode: STANDARD_TABLE_ACTIONS.APPROVE,
      actionViewType: TableActionViewType.TEXT, isCustomAction: true, createdBy: 'admin'} as SchemaTableAction;

    expect(component.hasActionPermission(action)).toBeFalsy();

    action.actionCode = STANDARD_TABLE_ACTIONS.REJECT;
    expect(component.hasActionPermission(action)).toBeFalsy();

    action.actionCode = 'other actions';
    expect(component.hasActionPermission(action)).toBeTruthy();


  }));

  it('should update on inputs changes', () => {

    const obsv: any = new Observable();
    spyOn(component, 'getDataScope').and.returnValue(of(obsv));
    spyOn(component, 'getSchemaStatics');
    spyOn(component, 'getSchemaTableActions');
    spyOn(component, 'getModuleInfo').and.returnValue(of(obsv));
    spyOn(component, 'refreshView').and.callThrough();
    // spyOn(component, 'getVariantDetails');

    let changes: SimpleChanges = {moduleId:{currentValue:'1005', previousValue: '', firstChange:null, isFirstChange:null},
        schemaId:{currentValue:'schema1', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.isRefresh).toBeTrue();
    expect(component.getModuleInfo).toHaveBeenCalledWith('1005');

    changes = {isInRunning:{currentValue:true, previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.isInRunning).toBeTrue();
    expect(component.refreshView).toHaveBeenCalled();
  });

  it('should init component', () => {

    component.ngOnInit();
    expect(component.userDetails).toBeDefined();

    spyOn(component, 'getDataScope');
    sharedService.setDataScope(null);
    sharedService.setDataScope({});
    expect(component.getDataScope).toHaveBeenCalledTimes(1);

    spyOn(component, 'getData');
    component.filterCriteria.next([]);
    expect(component.getData).toHaveBeenCalledTimes(1);

    component.selection.select({objctNumber: '1701'});
    expect(component.tableHeaderActBtn.length).toEqual(1);
    component.selection.clear();
    expect(component.tableHeaderActBtn.length).toEqual(0);


    sharedService.setChooseColumnData(null);

    spyOn(component, 'getSelectedTableColumns');
    const columnsData = {selectedFields: [], tableActionsList: [] };
    sharedService.setChooseColumnData(columnsData);
    expect(component.getSelectedTableColumns).toHaveBeenCalled();

    columnsData.tableActionsList.push({ actionText: 'Approve'} as SchemaTableAction);
    sharedService.setChooseColumnData(columnsData);
    expect(component.tableActionsList.length).toEqual(1);

  });

  /* it('should downloadExecutionDetails', () => {
    // TO DO
    component.downloadExecutionDetails();
    expect(component.groupId).toBeFalsy();
  }); */

  it('should makeFilterControl', () => {

    fixture.detectChanges();
    /* const trigger = TestBed.createComponent(MatMenuTrigger);
    component.trigger = trigger.componentInstance; */

    const criteria = {selectedValues: [{CODE: 'USA'}], fldCtrl: {fieldId: 'region'},  fieldId: 'region'} as AddFilterOutput;

    component.makeFilterControl(criteria);
    expect(component.filterCriteria.getValue().length).toEqual(1);

    criteria.selectedValues[0].CODE = 'Asia';

    component.makeFilterControl(criteria);
    expect(component.filterCriteria.getValue()[0].values).toEqual(['Asia']);

   });

   it('prepateTextToShow(), should prepare text to show over mat-chips', async () => {
    const ctrl: FilterCriteria = {
      fieldId: 'MaterialType',
      values: ['123', '456'],
      type: 'DROPDOWN',
      filterCtrl: {
        selectedValues: [
          {
            CODE: 'ABC',
            FIELDNAME: 'MaterialType'
          } as DropDownValue
        ]
      } as AddFilterOutput
    }

    const result = component.prepareTextToShow(ctrl);
    expect(result).toEqual('ABC');

    ctrl.filterCtrl.selectedValues[0].TEXT = 'first value';
    expect(component.prepareTextToShow(ctrl)).toEqual('first value');

    component.filterCriteria.next([ctrl]);
    ctrl.filterCtrl.selectedValues.push({ CODE: 'DEF', FIELDNAME: 'MaterialType'} as DropDownValue);
    expect(component.prepareTextToShow(ctrl)).toEqual('2');

    component.filterCriteria.next([]);
    expect(component.prepareTextToShow(ctrl)).toEqual('Unknown');

    ctrl.filterCtrl.selectedValues = [];
    expect(component.prepareTextToShow(ctrl)).toEqual('Unknown');

  });

  it('it should markForDeletion()', async(() => {

    const row = {
      OBJECTNUMBER: { },
      record_status: {fieldData: RECORD_STATUS.NOT_DELETABLE}
    };

    spyOn(catalogService, 'markForDeletion').and.returnValue(of('success'));

    component.markForDeletion(row);

    row.OBJECTNUMBER = {fieldData: 'diw_15'};
    component.markForDeletion(row);
    expect(catalogService.markForDeletion).toHaveBeenCalledTimes(1);

  }));

  it('should newInlineSearchText', () => {
    spyOn(component.inlineSearchSubject, 'next');
    component.newInlineSearchText('search text');
    expect(component.inlineSearchSubject.next).toHaveBeenCalledWith('search text');
  });

  it('should getTableRowClass', () => {

    const row = {record_status: { fieldData: RECORD_STATUS.DELETABLE}};
    expect(component.getTableRowClass(row)).toEqual(['not-master-row', 'row-deletable']);

    row.record_status.fieldData = RECORD_STATUS.MASTER;
    expect(component.getTableRowClass(row)).toEqual([]);

  });

  it('should getSchemaTableActions', () => {

    spyOn(schemaDetailService, 'getTableActionsBySchemaId').and.returnValues(of([]), of([{ actionText: 'Approve'} as SchemaTableAction]));

    component.getSchemaTableActions();
    expect(component.tableActionsList.length).toEqual(3);

    component.getSchemaTableActions();
    expect(component.tableActionsList.length).toEqual(1);

  });

  it('should approveRecords', () => {

    spyOn(catalogService, 'approveDuplicacyCorrection')
      .and.returnValues(of('success'), throwError({status:500}), of('success'), throwError({status:500}));

    component.userDetails = { userName: 'admin'} as Userdetails;

    const row = { OBJECTNUMBER: {fieldData: 'diw_15', isReviewed: false}, record_status: {fieldData: RECORD_STATUS.NOT_DELETABLE} };
    component.approveRecords('inline', row);
    expect(row.OBJECTNUMBER.isReviewed).toBeTrue();

    spyOn(console, 'error');
    row.OBJECTNUMBER.isReviewed = false;
    component.approveRecords('inline', null);
    expect(row.OBJECTNUMBER.isReviewed).toBeFalse();
    expect(console.error).toHaveBeenCalled();

    component.selection.select(row);
    component.approveRecords('global');
    expect(row.OBJECTNUMBER.isReviewed).toBeTrue();

    row.OBJECTNUMBER.isReviewed = false;
    component.selection.clear();
    component.approveRecords('global');
    expect(row.OBJECTNUMBER.isReviewed).toBeFalse();
    expect(console.error).toHaveBeenCalled();

  });

  it('should rejectRecords', () => {

    spyOn(catalogService, 'rejectDuplicacyCorrection')
      .and.returnValues(of('success'), throwError({status:500}), of('success'), throwError({status:500}));
    spyOn(component, 'getData');

    component.userDetails = { userName: 'admin'} as Userdetails;

    const row = { OBJECTNUMBER: {fieldData: 'diw_15', isReviewed: false}, record_status: {fieldData: RECORD_STATUS.NOT_DELETABLE} };

    component.rejectRecords('inline', row);
    expect(component.getData).toHaveBeenCalled();

    spyOn(console, 'error');
    component.rejectRecords('inline', null);
    expect(console.error).toHaveBeenCalled();

    component.selection.select(row);
    component.rejectRecords('global');
    expect(component.getData).toHaveBeenCalled();

    component.selection.clear();
    component.rejectRecords('global');
    expect(console.error).toHaveBeenCalled();

  });

  it('should get data on sort change', () => {

    spyOn(component, 'getData');

    fixture.detectChanges();
    component.sort.sort({id: 'status'} as MatSortable);
    expect(component.sortOrder).toEqual({status: 'asc'});

    component.sort.sort({id: 'status'} as MatSortable);
    expect(component.sortOrder).toEqual({status: 'desc'});

    component.sort.sort({id: 'status'} as MatSortable);
    expect(component.sortOrder).toEqual({});

  });

  it('should calculateDisplayFields', () => {
    component.metadataFldLst = {headers: {region: {fieldDescri: 'region'}, priority: {fieldDescri: 'priority'}}};
    component.selectedFields = [{fieldId: 'region', order: 1, editable: true, isEditable: true}];
    component.calculateDisplayFields();
    expect(component.displayedFields.getValue()).toEqual([...component.startColumns, 'region']);

  })

  it('updateDataScopeList(), should update datascope list', async(() => {
    component.currentDatascopePageNo = 1;
    const body = {
      from: 2,
      size: 10,
      variantName: null
    };
    component.schemaId = '1005';

    spyOn(schemaVariantService, 'getDataScopesList').withArgs(component.schemaId, 'RUNFOR', body)
      .and.returnValues(of([]), of([]), throwError({status: 500}))

    component.updateDataScopeList();
    expect(schemaVariantService.getDataScopesList).toHaveBeenCalledWith('1005', 'RUNFOR', body);
  }));

  it('downloadExecutionDetails() ', async(() => {

    spyOn(catalogService, 'downloadExecutionDetails').
      and.returnValues(of({}), throwError({status: 500}));

    spyOn(snackBar, 'open');

    component.downloadExecutionDetails();

    component.groupId = '1701';
    component.downloadExecutionDetails();
    expect(catalogService.downloadExecutionDetails).toHaveBeenCalledTimes(1);

    spyOn(console, 'error');
    component.downloadExecutionDetails();
    expect(console.error).toHaveBeenCalled();
  }));

  it('getModuleInfo should get the module details', () => {
    const data: ModuleInfo[] = [
      {
        moduleDesc: 'Test Module',
        moduleId: '1002',
        datasetCount: 123,
        tenantId: '1'
      },
      {
        moduleDesc: 'Test Module',
        moduleId: '1003',
        datasetCount: 456,
        tenantId: '1'
      },
    ];
    spyOn(coreService, 'searchAllObjectType' ).and.returnValue(of(data));
    spyOn(component, 'getDataScope' );
    component.getModuleInfo(1002);
    expect(coreService.searchAllObjectType).toHaveBeenCalledWith({lang: 'en',fetchsize: 1,fetchcount: 0,description: ''},[1002]);
    expect(component.moduleInfo).toEqual(data[0]);
    expect(component.totalVariantsCnt).toEqual(123);
    expect(component.loader.moduleDetails).toBeFalsy();
    expect(component.getDataScope).toHaveBeenCalled();
  });

  it('getSelectedTableColumns(), should get table columns', () => {
    const data = [ { fieldList: [], editable: false }];
    spyOn(schemaDetailService, 'getSelectedFieldsByNodeIds').and.returnValue(of(data));
    spyOn(component, 'calculateDisplayFields');
    component.schemaId = '1002';
    component.variantId = '1'
    component.getSelectedTableColumns();
    expect(schemaDetailService.getSelectedFieldsByNodeIds).toHaveBeenCalledWith('1002', '1', ['header']);
    expect(component.selectedFields).toEqual([]);
    expect(component.calculateDisplayFields).toHaveBeenCalled();
  });

  it('getParentVal()', async(() => {
    const fld = new SchemaTableViewFldMap();
    fld.fieldId = 'TEST';
    fld.parentField = ['PAR_TEST'];
    component.selectedFields = [fld];

    const row = {PAR_TEST: {fieldCode: '0001'}};
    const res = component.getParentVal('TEST', row);
    expect(res.length).toEqual(1);

    component.selectedFields = [];
    const res1 = component.getParentVal('TEST', row);
    expect(res1.length).toEqual(0);
  }));

  it('activeCellPosition()', () => {
    component.activeCellPosition('test', 1);
    expect(component.activeCell.column).toEqual('test');
    expect(component.activeCell.rowIndex).toEqual(1);
  });

  it('isDeleted()', () => {
    expect(component.isDeleted({OBJECTNUMBER: {delFlag: true}})).toBeTrue();
    expect(component.isDeleted({OBJECTNUMBER: {delFlag: false}})).toBeFalse();
  });

  it('onRunCompleted() should hide the progress bar', () => {
    spyOn(component.runCompleted,'emit');
    spyOn(component,'getSchemaStatics');
    component.onRunCompleted({});
    expect(component.statics).toEqual(undefined);
    expect(component.runCompleted.emit).toHaveBeenCalledWith({});
    expect(component.getSchemaStatics).toHaveBeenCalledWith(true);
  });

  it('isActive()', () => {
    component.activeCellPosition('test', 1);
    expect(component.isActive('test', 1)).toBeTrue();
    expect(component.isActive('', 1)).toBeFalse();
  });

  it('approveaction and rejectactions should get correct object', () => {
    component.tableActionsList = [{
      actionCode: STANDARD_TABLE_ACTIONS.APPROVE
    }, {
      actionCode: STANDARD_TABLE_ACTIONS.REJECT
    }] as any;
    expect(component.approveAction).toBeTruthy();
    expect(component.rejectAction).toBeTruthy();
    component.tableActionsList = [{
      actionCode: STANDARD_TABLE_ACTIONS.APPROVE
    }] as any;
    expect(component.approveAction).toBeTruthy();
    expect(component.rejectAction).toBeFalsy();
    component.tableActionsList = [{
      actionCode: STANDARD_TABLE_ACTIONS.REJECT
    }] as any;
    expect(component.rejectAction).toBeTruthy();
    expect(component.approveAction).toBeFalsy();
  });

  it('getMasterRuleStatus() should get the status object from the doc', () => {
    const row = {
      masterRule: []
    };
    expect(component.getMasterRuleStatus(row)).toBeTruthy();
    delete row.masterRule;
    expect(component.getMasterRuleStatus(row)).toBeTruthy();
  });

  it('toggleSideBar() should close and open the side bar', () => {
    component.arrowIcon = '';
    component.toggleSideBar();
    expect(component.arrowIcon).toEqual('chevron-left');
    component.toggleSideBar();
    expect(component.arrowIcon).toEqual('chevron-right');
  });

  it('badge()', () => {
    component.activeCellPosition('test', 1);
    component.requestStatus = BadgeStatus.PENDING;

    let result = component.badge('test', 1);

    expect(result.icon).toEqual('clock');
    expect(result.type).toEqual(null);
    expect(result.font).toEqual('light');

    component.requestStatus = BadgeStatus.SUCCESS;
    result = component.badge('test', 1);

    expect(result.icon).toEqual('check');
    expect(result.type).toEqual(BadgeStatus.SUCCESS);

    component.requestStatus = BadgeStatus.ERROR;
    result = component.badge('test', 1);

    expect(result.icon).toEqual('exclamation-circle');
    expect(result.type).toEqual(BadgeStatus.ERROR);
    expect(result.font).toEqual('solid');

    result = component.badge('test', 2);
    expect(result.icon).toEqual(null);
  });

  it('getBadgeState()', async(() => {
    component.fieldsInUpdate = [{fldId: '1234', rIndex: '0', badge: BadgeStatus.SUCCESS}];
    const result = component.getBadgeState('1234', '0');
    expect(result.icon).toEqual('check');

    const result1 = component.getBadgeState('123', '0');
    expect(result1.icon).toEqual(null);
  }));

  it('setBadgeState()', async(() => {
    component.fieldsInUpdate = [{fldId: '1234', rIndex: '0', badge: BadgeStatus.SUCCESS}];
    expect(component.setBadgeState('1234', '0', 'error')).toBeUndefined();
    expect(component.setBadgeState('123', '0', 'error')).toBeUndefined();
  }));

  it('isEditEnabled(), check whether cell is editable or not ', async()=>{
    // mock data
    component.selectedFields = [{editable:false,isEditable:false,fieldId:'test'} as SchemaTableViewFldMap];
    expect(component.isEditEnabled('test', {},0)).toBeFalse();

    const ele =  document.createElement('div');
    ele.setAttribute('id','inpctrl_test_0');
    ele.style.display = 'block';
    (fixture.nativeElement as HTMLElement).append(ele);
    component.selectedFields = [{editable:true,isEditable:true,fieldId:'test'} as SchemaTableViewFldMap];
    expect(component.isEditEnabled('test', {},0)).toBeTrue();

    ele.remove();

    component.selectedFields = [{editable:true,isEditable:true,fieldId:'test'} as SchemaTableViewFldMap];
    expect(component.isEditEnabled('test', {},0)).toBeFalse();

  });

  it('emitEditBlurChng(), emit and editable cell and call api for validation and do-correction', async(()=>{
    // mock data
    dataSourceSpy.getRow.withArgs('OBJ001').and.returnValue({hdvs:{test:{}}});
    const inpctrl = document.createElement('div');
    inpctrl.setAttribute('id','inpctrl_test_0');

    (fixture.nativeElement as HTMLElement).append(inpctrl);

    const viewctrl = document.createElement('span');
    viewctrl.setAttribute('id','viewctrl_test_0');

    (fixture.nativeElement as HTMLElement).append(viewctrl);

    const row = {OBJECTNUMBER:{fieldData:'OBJ001'}, test:{fieldData:'hello'}};

    const viewContainerRef: ViewContainerRef = {clear:()=>{console.log('crear log !!')}} as ViewContainerRef;

    component.emitEditBlurChng('test','hell',row,0, viewContainerRef);
    inpctrl.remove();
    viewctrl.remove();

    expect(component.requestStatus).toEqual(BadgeStatus.PENDING);

  }));

  it('openRuleStatusMenu(), should open rule status menu', async(()=>{
    component.menuTriggers = {
      _results: [{
        menuOpen: false,
        closeMenu: () => {}
      }]
    };
    const menuTrigger = {
      openMenu: () => {}
    };
    spyOn(menuTrigger, 'openMenu');
    component.toggleRuleStatusMenu(menuTrigger as any);
    component.menuTriggers = {
      _results: [{
        menuOpen: true,
        closeMenu: () => {}
      }]
    };
    component.toggleRuleStatusMenu(menuTrigger as any);
    delete component.menuTriggers;
    component.toggleRuleStatusMenu(menuTrigger as any);
    expect(menuTrigger.openMenu).toHaveBeenCalledTimes(3);
  }));
  it('isMasterRecord(), should check if it is a master record', async(()=>{
    const row:any = {
    }
    row[RECORD_STATUS_KEY] = {
      fieldData:  RECORD_STATUS.MASTER
    }
    expect(component.isMasterRecord(row)).toBeTruthy();
    row[RECORD_STATUS_KEY] = {

    };
    expect(component.isMasterRecord(row)).toBeFalsy();
  }));
});
