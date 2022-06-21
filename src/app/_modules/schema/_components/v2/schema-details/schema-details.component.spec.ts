import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SchemaDetailsComponent } from './schema-details.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FilterValuesComponent } from '@modules/shared/_components/filter-values/filter-values.component';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { AddFilterMenuComponent } from '@modules/shared/_components/add-filter-menu/add-filter-menu.component';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { Observable, of, throwError } from 'rxjs';
import { ModuleInfo, SchemaDashboardPermission, SchemaListDetails, SchemaStaticThresholdRes, SchemaVariantsModel } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { FilterCriteria, Heirarchy, MetadataModel, MetadataModeleResponse, RequestForSchemaDetailsWithBr, SchemaTableAction, SchemaTableViewFldMap, STANDARD_TABLE_ACTIONS, TableActionViewType } from '@models/schema/schemadetailstable';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { CoreSchemaBrInfo, DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaDataSource } from '../../schema-details/schema-datatable/schema-data-source';
import { ParamMap, Router } from '@angular/router';
import { SimpleChanges, ViewContainerRef } from '@angular/core';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { Userdetails } from '@models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { AddFilterOutput } from '@models/schema/schema';
import { MatSortable } from '@angular/material/sort';
import { SchemaExecutionNodeType, SchemaExecutionTree } from '@models/schema/schema-execution';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { GlobalCountComponent } from '../_builder/global-count/global-count.component';
import { BadgeStatus } from '@services/home/schema/badge.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { CoreService } from '@services/core/core.service';

describe('SchemaDetailsComponent', () => {
  let component: SchemaDetailsComponent;
  let fixture: ComponentFixture<SchemaDetailsComponent>;
  let schemaListService: SchemalistService;
  let schemaService: SchemaService;
  let schemaVariantService: SchemaVariantService;
  let schemaDetailService: SchemaDetailsService;
  let router: Router;
  let sharedService: SharedServiceService;
  let coreServiceSpy: CoreService;

  const dataSourceSpy= {
    getTableData: jasmine.createSpy('getTableData'),
    getRow: jasmine.createSpy('getRow')
  };
  let endpointService: EndpointsClassicService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaDetailsComponent, FilterValuesComponent, SearchInputComponent, AddFilterMenuComponent, GlobalCountComponent, SkeletonLoaderComponent ],
      imports:[
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule,
        MdoUiLibraryModule
      ],providers:[
        {
          provide: SchemaDataSource,
          useValue: dataSourceSpy
        }
      ]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaDetailsComponent);
    component = fixture.componentInstance;
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaVariantService = fixture.debugElement.injector.get(SchemaVariantService);
    schemaDetailService = fixture.debugElement.injector.get(SchemaDetailsService);
    endpointService = fixture.debugElement.injector.get(EndpointsClassicService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    component.dataSource = new SchemaDataSource(schemaDetailService, endpointService, '274751', sharedService);
    coreServiceSpy = fixture.debugElement.injector.get(CoreService);

    // fixture.detectChanges();...

    component.schemaId = '274751';
    component.variantId = '0';
    component.moduleId = '1005';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', async(() => {
    component.isRefresh = true;
    component.ngOnInit();
    component.appliedBrList = [];
    spyOn(schemaDetailService, 'updateSchemaTableView').and.returnValue(throwError(null));
    component.selectedFieldsOb.next(true);
    expect(schemaDetailService.updateSchemaTableView).toHaveBeenCalled();
  }));

  it('selectedNodeChange()', async(() => {
    const params: ParamMap = component.activatedRouter.snapshot.queryParamMap;
    expect(component.selectedNodeChange(params)).toBeUndefined();
  }));

  it('getSchemaStatics(), get schema statics .. ', async(()=>{

    component.appliedBrList = [{brIdStr:'342332'} as CoreSchemaBrInfo];
    spyOn(schemaService,'getSchemaThresholdStaticsV2').withArgs(component.schemaId, component.variantId,['342332'], [])
      .and.returnValues(of(new SchemaStaticThresholdRes()), throwError({message: 'api error'}));
    jasmine.clock().install();
    component.getSchemaStatics();
    jasmine.clock().tick(1001);
    expect(schemaService.getSchemaThresholdStaticsV2).toHaveBeenCalledWith(component.schemaId, component.variantId,['342332'], []);

    spyOn(console, 'error');
    component.getSchemaStatics();
    jasmine.clock().tick(1001);
    expect(console.error).toHaveBeenCalled();
    jasmine.clock().uninstall();
  }));


  it('getVariantDetails(), get variant detaails ', async(()=>{
    component.userDetails = {
      currentRoleId: 'AD',
      userName: 'harshit',
      plantCode: '0'
    } as Userdetails

    spyOn(schemaVariantService,'getVariantdetailsByvariantId').withArgs(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName)
      .and.returnValues(of({
      schemaId: component.schemaId,
      filterCriteria: [
        { fieldId: 'MATL_TYPE', type: 'DROPDOWN', values: ['67', '2'] },
        { fieldId: 'id', type: 'INLINE', values: ['search text'] }
      ]
    } as SchemaVariantsModel), of(null), throwError({message: 'api error'}));

    component.getVariantDetails();
    component.getVariantDetails();
    expect(schemaVariantService.getVariantdetailsByvariantId).toHaveBeenCalledWith(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName);

    spyOn(console, 'error');
    component.getVariantDetails();
    expect(console.error).toHaveBeenCalled();
  }));

  it('getVariantDetails(), get variant detaails ', async(()=>{
    component.userDetails = {
      currentRoleId: 'AD',
      userName: 'harshit',
      plantCode: '0'
    } as Userdetails

    spyOn(schemaVariantService,'getVariantdetailsByvariantId').withArgs(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName)
      .and.returnValues(of({
      schemaId: component.schemaId,
      filterCriteria: []
    } as SchemaVariantsModel), of(null), throwError({message: 'api error'}));

    component.getVariantDetails();

    expect(schemaVariantService.getVariantdetailsByvariantId).toHaveBeenCalledWith(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName);
  }));

  it('getVariantDetails(), get variant detaails ', async(()=>{
    component.userDetails = {
      currentRoleId: 'AD',
      userName: 'harshit',
      plantCode: '0'
    } as Userdetails

    spyOn(schemaVariantService,'getVariantdetailsByvariantId').withArgs(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName)
      .and.returnValues(of({
      schemaId: component.schemaId,
      filterCriteria: [
        { fieldId: 'MATL_TYPE', type: 'DROPDOWN', values: [] },
        { fieldId: 'id', type: 'INLINE' }
      ]
    } as SchemaVariantsModel), of(null), throwError({message: 'api error'}));

    component.getVariantDetails();

    expect(schemaVariantService.getVariantdetailsByvariantId).toHaveBeenCalledWith(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName);
  }));

  it('getFldMetadata(), get field metadata ', async(()=>{
    // no api call for falsy moduleId
    component.moduleId = '';
    expect(() => component.getFldMetadata()).toThrowError('Module id cant be null or empty');

    component.moduleId = '1005';
    const metadataModeleResponse = { headers: [{ fieldId: 'MATL', fieldDescri: 'material location' }] } as MetadataModeleResponse;
    spyOn(coreServiceSpy, 'getMetadataFieldsByModuleId').and.returnValue(of(metadataModeleResponse));
    spyOn(component.metadata,'next');
    component.getFldMetadata();
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalledWith([component.moduleId], '');
    expect(component.metadata.next).toHaveBeenCalledWith(metadataModeleResponse);
  }));

  it('getFldMetadata(), get field metadata error ', async(()=>{
    // error response
    spyOn(coreServiceSpy,'getMetadataFieldsByModuleId')
      .and.returnValues(throwError({status: 500}));
    spyOn(console, 'error');
    component.getFldMetadata();
    expect(console.error).toHaveBeenCalled();
  }));

  it('loadDropValues(), load current field .. ', async(()=>{

      component.loadDropValues(null);
      expect(component.loadDopValuesFor).toBeFalsy();

      // mock data
      const data: FilterCriteria = {fieldId:'MATL_TYPE',type:'DROPDOWN', values:['ZMRO','ALT']} as FilterCriteria;
      component.loadDropValues(data);
      expect(component.loadDopValuesFor.checkedValue.length).toEqual(2);
  }));

  it('updateFilterCriteria(), update filter criteria .. ', async(()=>{
    const dropValue: DropDownValue[] = [{
      CODE:'ZMRO',
      FIELDNAME:'MATL_TYPE',
      LANGU:'en',
      PLANTCODE:'0',
      SNO:'872372',
      TEXT:'Zmro Text'
    }];


    const exitingFilter: FilterCriteria[] = [{
      fieldId:'MATL_TYPE',
      type:'DROPDOWN',
      values:['TEST'],
      fldCtrl:{fieldId:'MATL_TYPE'} as MetadataModel,
      filterCtrl:{fldCtrl:{fieldId:'MATL_TYPE'} as MetadataModel,selectedValues:[]}
    }];

    component.filterCriteria.next(exitingFilter);

    component.loadDopValuesFor = {fieldId:'MATL_TYPE',checkedValue:[]};

    component.updateFilterCriteria(dropValue);

    const res = component.filterCriteria.getValue();

    expect(res.values.length).toEqual(0);

    expect(component.updateFilterCriteria(null)).toBeUndefined();

    component.filterCriteria.next(null);
    expect(component.updateFilterCriteria(null)).toBeUndefined();
  }));

  /* it('should format date to MM/DD/YYYY', () => {
    const date = new Date(2020, 1, 15);
    const result = component.formatDate(date);
    expect(result).toEqual('02/15/2020');
  }) */

  it('should format cell data', () => {
    const metadataFldLst = {
        diw_15 : {
          isCheckList : 'false',
          picklist: '1',
          value : 'USA'
        }
      }

    component.metadataFldLst = metadataFldLst;
    let result = component.formatCellData('diw_15', 'USA');
    expect(result).toEqual('USA');

    metadataFldLst.diw_15.isCheckList = 'true';
    result = component.formatCellData('diw_15', ['USA', 'France']);
    expect(result).toEqual('USA,France');

    result = component.formatCellData('diw_15', 'null');
    expect(result).toEqual('');
  })

  /* it('should filter field options', () => {

    component.selectFieldOptions = [
      {CODE : 'option1', TEXT:'first option'} as DropDownValue,
      {CODE : 'option2', TEXT:'second option'} as DropDownValue
    ];

    const result = component.filterSelectFieldOptions('first');
    expect(result.length).toEqual(1);
    expect(result[0].CODE).toEqual('option1');
  }) */

  it('should get the input type', () => {

    const metadataFldLst = {
      diw_15 : {
        isCheckList : 'false',
        picklist: '0',
        dataType: 'NUMC'
      }
    }

  component.metadataFldLst = metadataFldLst;

  let result = component.getFieldInputType('diw_15');
  expect(result).toEqual(component.FIELD_TYPE.NUMBER);

  metadataFldLst.diw_15.dataType = 'DATS';
  result = component.getFieldInputType('diw_15');
  expect(result).toEqual(component.FIELD_TYPE.DATE);
  component.metadataFldLst.diw_15.dataType = 'DTMS';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.DATE);


  metadataFldLst.diw_15.picklist = '1';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.SINGLE_SELECT);
  metadataFldLst.diw_15.picklist = '30';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.SINGLE_SELECT);
  metadataFldLst.diw_15.picklist = '37';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.SINGLE_SELECT);


  metadataFldLst.diw_15.isCheckList = 'true';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.MULTI_SELECT);
  metadataFldLst.diw_15.picklist = '30';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.MULTI_SELECT);
  metadataFldLst.diw_15.picklist = '1';
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.MULTI_SELECT);

  component.metadataFldLst.diw_15 = {};
  expect(component.getFieldInputType('diw_15')).toEqual(component.FIELD_TYPE.TEXT);


  });

  it('should add/remove an inline filter', () => {

    component.inlineSearch('material');

    expect(component.filterCriteria.getValue().length).toEqual(1);

    component.inlineSearch('');
    expect(component.filterCriteria.getValue().length).toEqual(0);


    spyOn(component.filterCriteria, 'next');
    component.inlineSearch('material');
    expect(component.filterCriteria.next).toHaveBeenCalledTimes(1);
  });

  it('should return all rows selected', () => {
    expect(component.isAllSelected()).toEqual(true);
  });

  it('should clear selection', () => {
    spyOn(component.selection, 'clear');
    component.masterToggle();
    expect(component.selection.clear).toHaveBeenCalled();
  });

  it('should remove an applied filter', () => {

    component.inlineSearch('material');

    const filterCriteria = {
        fieldId: 'id',
        type: 'INLINE',
        values: ['material']
      } as FilterCriteria ;


    component.removeAppliedFilter(filterCriteria);
    expect(component.filterCriteria.getValue().length).toEqual(0);

    spyOn(component.filterCriteria, 'next');
    component.removeAppliedFilter(filterCriteria);
    expect(component.filterCriteria.next).toHaveBeenCalledTimes(0);
  });

  it('removeAppliedFilter() should remove an applied filter', () => {

    component.inlineSearch('material');

    const filterCriteria = {
        fieldId: 'id',
        type: 'INLINE'
      } as FilterCriteria ;
    spyOn(component.filterCriteria, 'next');
    component.removeAppliedFilter(filterCriteria);
    expect(component.filterCriteria.next).toHaveBeenCalledTimes(1);
  });

  it('removeAppliedFilter() should remove an applied filter', async(() => {
    const filterCriteria = {
      fieldId: 'id',
      type: 'INLINE'
    } as FilterCriteria ;
    component.filterCriteria.next(null);

    expect(component.removeAppliedFilter(filterCriteria)).toBeUndefined();
  }));

  it('should reset applied filter', () => {

    component.inlineSearch('material');
    expect(component.filterCriteria.getValue().length).toEqual(1);

    component.resetAppliedFilter();
    expect(component.filterCriteria.getValue().length).toEqual(0);
  });

  it('should change tab status', () => {

    component.userDetails = new Userdetails();
    component.userDetails.plantCode = 'test';
    component.userDetails.userName = 'test';

    spyOn(component, 'getData');
    spyOn(component, 'getSchemaExecutionTree');
    spyOn(component, 'calculateDisplayFields');
    spyOn(router, 'navigate');

    expect(component.changeTabStatus(component.activeTab)).toBeFalsy();

    component.changeTabStatus('success');
    expect(component.getData).toHaveBeenCalledWith(component.filterCriteria.getValue(), component.sortOrder);

    component.changeTabStatus('review');
    expect(component.getData).toHaveBeenCalled();

  });

  it('getData(), get data ', async(()=>{
    // mock data
    const request: RequestForSchemaDetailsWithBr = new RequestForSchemaDetailsWithBr();
    request.schemaId = component.schemaId;
    request.variantId = component.variantId;
    request.fetchCount = 0
    request.fetchSize = 20;
    request.requestStatus = component.activeTab;
    request.filterCriterias = [];
    request.sort = null;
    request.isLoadMore = true;
    component.dataSource = new SchemaDataSource(schemaDetailService, null, component.schemaId, sharedService);
    component.getData([], null, 0, true);

    expect(dataSourceSpy.getTableData).toBeTruthy();
    component.getData([], null, 1, true);
    expect(dataSourceSpy.getTableData).toBeTruthy();
  }));

  it('calculateDisplayFields(), calculate display fields based on user view', async(()=>{
    // mock data
    component.metadata.next({headers:{MATL_TYPE:{fieldId:'MATL_TYPE'}}} as MetadataModeleResponse);
    component.calculateDisplayFields();
    expect(component.calculateDisplayFields).toBeTruthy();
  }));


  it('changeTabStatus() , change the tab and get load data ', async(() =>{

    component.userDetails = new Userdetails();
    component.userDetails.plantCode = 'test';
    component.userDetails.userName = 'test';

    spyOn(component, 'getSchemaExecutionTree');
    // mock data
    component.activeTab = 'error';
    const res = component.changeTabStatus('error');
    expect(res).toEqual(false);

    spyOn(router, 'navigate');
    component.metadata.next({headers:{MATL_TYPE:{fieldId:'MATL_TYPE'}}} as MetadataModeleResponse);
    component.dataSource = new SchemaDataSource(schemaDetailService, null, component.schemaId, sharedService);
    component.changeTabStatus('success');
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema/list', component.schemaId], {
      queryParams: { status: component.activeTab }, queryParamsHandling: 'merge'
    } );

  }));

  it('openTableColumnSettings(), open table column setting ', async(()=>{
    spyOn(router, 'navigate');
    component.openTableColumnSettings();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: 'sb/schema/table-column-settings' } }], {queryParamsHandling: 'preserve'});
  }));

  it('inlineSearch(), inline search ', async(()=>{
    // mock data to be removed
    /* component.filterCriteria = new BehaviorSubject<FilterCriteria[]>([{fieldId:'MATL_TYPE', type:'INLINE'} as FilterCriteria]);
    component.inlineSearch('mat');
    expect(component.inlineSearch).toBeTruthy(); */

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

  }));

  it('ngOnChanges(), ngonchange component hooks ', async(()=>{
    const changes = {
      moduleId:{
        currentValue:'1005',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'1',
        firstChange:true,
        isFirstChange:null,
        previousValue:'0'
      }
    } as SimpleChanges;

    const sub: any = new Observable();
    spyOn(component, 'getDataScope').and.returnValue(of(sub));
    spyOn(component, 'getFldMetadata');
    spyOn(component, 'getSchemaStatics');
    spyOn(component, 'manageStaticColumns');
    spyOn(component, 'getData');
    spyOn(component, 'getVariantDetails');
    spyOn(component, 'getSchemaExecutionTree');

    component.userDetails = new Userdetails();
    component.userDetails.plantCode = '5454';
    component.userDetails.userName = 'Test';
    component.variantId = '1';
    component.ngOnChanges(changes);

    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    expect(component.getVariantDetails).toHaveBeenCalled();
    expect(component.getSchemaExecutionTree).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res=> {
      if(res) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes1 = {
      moduleId:{
        currentValue:'1005',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes1);
    expect(component.manageStaticColumns).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res2=> {
      if(res2) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes2 = {
      moduleId:{
        currentValue:'1005',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes2);
    component.userDetails = null;
    component.variantId = '0';
    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    expect(component.variantId).toEqual('0');
    expect(component.executionTreeHierarchy).toEqual(undefined);
    component.dataSource.brMetadata.subscribe(res2=> {
      if(res2) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes3 = {
      moduleId:{
        currentValue:'1005',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes3);
    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res3=> {
      if(res3) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes4 = {
      moduleId:{
        currentValue:'1005',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes4);
    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res4=> {
      if(res4) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes5 = {
      moduleId:{
        currentValue:'1005',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes5);
    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res5=> {
      if(res5) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes6 = {
      moduleId:{
        currentValue:'1005',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes6);
    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res6=> {
      if(res6) {
        expect(component.getData).toHaveBeenCalled();
      }
    });

    const changes7 = {
      moduleId:{
        currentValue:'1005',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      schemaId:{
        currentValue:'28467126471',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      },
      varinatId:{
        currentValue:'0',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;
    component.ngOnChanges(changes7);
    expect(component.getFldMetadata).toHaveBeenCalled();
    expect(component.manageStaticColumns).toHaveBeenCalled();
    component.dataSource.brMetadata.subscribe(res7=> {
      if(res7) {
        expect(component.getData).toHaveBeenCalled();
      }
    });
  }));

  it('ngOnChanges()', async(() => {
    const changes = {
      variantId: {
        currentValue:'0',
        firstChange:undefined,
        isFirstChange:null,
        previousValue: '1'
      },
      isInRunning: {
        currentValue: false,
        firstChange:undefined,
        isFirstChange:null,
        previousValue: true
      },
      activeTab: {
        currentValue: '0',
        firstChange:undefined,
        isFirstChange:null,
        previousValue: '1'
      }
    } as SimpleChanges;

    component.ngOnChanges(changes);
    expect(component.variantId).toEqual('0');

    const changes1 = {} as SimpleChanges;
    component.ngOnChanges(changes1);
    expect(component.isRefresh).toBeFalse();
  }));

  it('openSummarySideSheet(), should navigate to schema summary side sheet', () => {
    spyOn(router, 'navigate');
    component.openSummarySideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/check-data/${component.moduleId}/${component.schemaId}` } }], {queryParamsHandling: 'preserve'})
  })

  it('openDataScopeSideSheet(), should navigate to data scope side sheet', () => {
    spyOn(router, 'navigate');
    component.openDataScopeSideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/data-scope/${component.moduleId}/${component.schemaId}/new/sb` } }], {queryParamsHandling: 'preserve'})
  })

  it('getDataScope(), should return all variants of a schema', async () => {
    component.schemaId = '1005';
    const body = {
      from: 0,
      size: 10,
      variantName: null
    };
    spyOn(schemaVariantService, 'getDataScopesList').withArgs(component.schemaId, 'RUNFOR', body).and.returnValue(of())
    component.getDataScope();
    expect(schemaVariantService.getDataScopesList).toHaveBeenCalledWith(component.schemaId, 'RUNFOR', body);
  });

  it(`approveRecords(), approve corrected records `, async(()=>{

    // mock data
    const row = {OBJECTNUMBER:{fieldData:'MAT001'}};
    component.schemaId = '246726532';
    component.userDetails  = {currentRoleId:'123'} as Userdetails;

    const apiResponse = true;

    spyOn(schemaDetailService,'approveCorrectedRecords').withArgs(component.schemaId, ['MAT001'] , component.userDetails.currentRoleId)
      .and.returnValues(of(apiResponse), of(apiResponse), throwError({message: 'api error'}));

    component.approveRecords('inline', row);
    expect(schemaDetailService.approveCorrectedRecords).toHaveBeenCalledWith(component.schemaId, ['MAT001'] , component.userDetails.currentRoleId);

    spyOn(component, 'getData');
    component.selection.select(row);
    component.approveRecords('all');
    expect(component.getData).toHaveBeenCalled();

    // error response
    spyOn(console, 'error');
    component.selection.select(row);
    component.approveRecords('all');
    expect(console.error).toHaveBeenCalled();
  }));

  it(`approveRecords(), approve corrected records `, async(() => {
    // mock data
    component.schemaId = '246726532';
    component.userDetails  = {currentRoleId:'123'} as Userdetails;
    spyOn(schemaDetailService,'approveCorrectedRecords').and.returnValues(of(null));

    expect(component.approveRecords('inline')).toBeUndefined();
    expect(schemaDetailService.approveCorrectedRecords).toHaveBeenCalled();
  }));

  it('getParentNode()', async(() => {
    spyOn(component, 'getExectionArray').and.returnValue(undefined);
    expect(component.getParentNode('header')).toEqual(null);
  }));

  it(`resetRec(), reset corrected records `, async(()=>{
    // mock data
    const row = {OBJECTNUMBER:{fieldData:'MAT001'}};
    component.schemaId = '246726532';
    component.schemaInfo  = {runId:'889321'} as SchemaListDetails;
    component.statics = {correctedCnt: 5} as SchemaStaticThresholdRes;
    const apiResponse = {acknowledge:false};


    spyOn(schemaDetailService,'resetCorrectionRecords').withArgs(component.schemaId, component.schemaInfo.runId,  ['MAT001'])
      .and.returnValues(of(apiResponse), of(apiResponse), throwError({message: 'api error'}));

    spyOn(component, 'getSchemaStatics');

    component.resetRec(row, 'inline');
    expect(schemaDetailService.resetCorrectionRecords).toHaveBeenCalledWith(component.schemaId, component.schemaInfo.runId,  ['MAT001']);

    spyOn(component, 'getData');
    component.selection.select(row);
    apiResponse.acknowledge = true;
    component.resetRec('', 'all');
    expect(component.getData).toHaveBeenCalled();
    expect(component.statics.correctedCnt).toEqual(0);

    // error response
    spyOn(console, 'error');
    component.selection.select(row);
    component.resetRec('', 'all');
    expect(console.error).toHaveBeenCalled();

  }));

  it(`resetRec(), reset corrected records `, async(() => {
    component.schemaId = '246726532';
    component.schemaInfo  = {runId:'889321'} as SchemaListDetails;
    component.statics = {correctedCnt: 5} as SchemaStaticThresholdRes;
    spyOn(schemaDetailService,'resetCorrectionRecords').and.returnValue(of(undefined));
    expect(component.resetRec(null, 'inline')).toBeUndefined();
    expect(schemaDetailService.resetCorrectionRecords).toHaveBeenCalled();

    spyOn(component, 'getData');
    component.selection.clear();
    expect(component.resetRec(null, 'inlin')).toBeUndefined();
  }));

  it('openExecutionTrendSideSheet ', async(() => {
    spyOn(router, 'navigate');
    component.openExecutionTrendSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/schema/execution-trend/${component.moduleId}/${component.schemaId}/${component.variantId}` } }], {queryParamsHandling: 'preserve'});
  }));

  it('should load more data on table scroll', async(() => {

    spyOn(component, 'getData');

    const event = {
      target: {
        offsetHeight: 20,
        scrollTop: 70,
        scrollHeight: 300
      }
    }

    component.onTableScroll(event);
    expect(component.scrollLimitReached).toBeFalse();

    event.target.scrollTop = 100;
    component.onTableScroll(event);
    component.onTableScroll(event);
    expect(component.scrollLimitReached).toBeTrue();
    // expect(component.fetchCount).toEqual(1);

    event.target.scrollTop = 70;
    component.onTableScroll(event);
    expect(component.scrollLimitReached).toBeFalse();

  }));

  it('should get schema permissions', () => {

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321'} as SchemaListDetails;
    expect(component.isEditer).toBeFalsy();
    expect(component.isReviewer).toBeFalsy();
    expect(component.isApprover).toBeFalsy();

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321',
      collaboratorModels: {isEditer: true, isApprover: true, isReviewer: true}
      } as SchemaListDetails;

    component.refreshUserMode();
    expect(component.isEditer).toBeTrue()
    expect(component.isReviewer).toBeTrue();
    expect(component.isApprover).toBeTrue();

    component.schemaInfo.collaboratorModels.isReviewer = false;
    component.refreshUserMode();
    expect(component.isApprover).toBeTrue();
  });

  it('should filter primary and secondary actions', () => {
    component.refreshActions();
    expect(component.primaryActions.length).toEqual(2);
    expect(component.secondaryActions.length).toEqual(0);
  });

  it('should do table action', () => {
    spyOn(component, 'approveRecords');
    spyOn(component, 'resetRec');
    spyOn(component, 'generateCrossEntry');

    component.userDetails = new Userdetails();
    const approveAction = {
      isCustomAction: false,
      actionCode: 'Approve'
    } as SchemaTableAction;

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321',
      collaboratorModels: {isAdmin: true} as SchemaDashboardPermission} as SchemaListDetails;
    component.isReviewer = true;
    component.doAction(approveAction, {});
    expect(component.approveRecords).toHaveBeenCalledWith('inline',{});

    const rejectAction = {
      isCustomAction: false,
      actionCode: 'Reject'
    } as SchemaTableAction;
    component.doAction(rejectAction, {});
    expect(component.resetRec).toHaveBeenCalledWith({},'inline');

    const crossEntryAction = {
      isCustomAction: true,
      refBrId: 'test'
    } as SchemaTableAction;
    component.isReviewer = false;
    component.doAction(crossEntryAction, {});
    expect(component.generateCrossEntry).toHaveBeenCalledWith({},'test');
  });

  it('should check if global actions are enabled', () => {
    expect(component.isGlobalActionsEnabled).toEqual(false);
    const row = { OBJECTNUMBER: 'TMP1701'};
    component.selection.select(row);
    expect(component.isGlobalActionsEnabled).toBeTrue();
  });

  it('should get all user selected fields based on default view ..', (async () => {

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

    component.dataSource.brMetadata.next([]);
    expect(component.getData).toHaveBeenCalled();

    sharedService.setChooseColumnData(null);

    let columnsData = { selectedFields: null, tableActionsList: [{ actionText: 'Approve'} as SchemaTableAction]};
    spyOn(component, 'calculateDisplayFields');
    spyOn(component, 'updateColumnBasedOnNodeSelection');
    sharedService.setChooseColumnData(columnsData);
    expect(component.tableActionsList.length).toEqual(1);

    columnsData = {selectedFields: [], tableActionsList: [] };
    sharedService.setChooseColumnData(columnsData);
    expect(component.updateColumnBasedOnNodeSelection).toHaveBeenCalled();

    spyOn(schemaDetailService, 'updateSchemaTableView').and.returnValue(of([]));
    component.selectedFieldsOb.next(true);
    expect(schemaDetailService.updateSchemaTableView).toHaveBeenCalled();

    component.selectedFieldsOb.next(false);
    expect(component.calculateDisplayFields).toHaveBeenCalled();

  }));

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

  it('generateCrossEntry() , generate cross module / create cross module ', async(()=>{
    // mock data
    const row = {
      OBJECTNUMBER:{
        fieldData:'TMP001'
      }
    }
    component.dataSource = new SchemaDataSource(schemaDetailService, null, component.schemaId, sharedService);
    spyOn(schemaDetailService, 'generateCrossEntry').withArgs(component.schemaId, component.moduleId, row.OBJECTNUMBER.fieldData, '')
      .and.returnValues(of('data'), of('data'), of('data'), throwError({message: 'api error'}));

    spyOn(schemaDetailService, 'doCorrection').and
      .returnValues(of({acknowledge: false}), of({acknowledge: true}), throwError({message: 'api error'}));

    // no target field
    expect(() => component.generateCrossEntry(row, '')).toThrowError('Tragetfield cant be null or empty ');

    // no obj number
    component.dataSource.targetField = 'MATL_GRP';
    expect(() => component.generateCrossEntry({}, '')).toThrowError('Objectnumber must be required !!!');

    component.dataSource.setDocValue([row]);
    component.generateCrossEntry(row);
    expect(schemaDetailService.generateCrossEntry).toHaveBeenCalledWith(component.schemaId, component.moduleId, row.OBJECTNUMBER.fieldData, '');

    component.statics = {correctedCnt: 5} as SchemaStaticThresholdRes;
    component.generateCrossEntry(row);
    expect(component.statics.correctedCnt).toEqual(0);

    spyOn(console, 'error');
    // correction error api
    component.generateCrossEntry(row);
    expect(console.error).toHaveBeenCalled();

    // error api resp
    component.generateCrossEntry(row);
    expect(console.error).toHaveBeenCalled();
  }));

  it('generateCrossEntry() , generate cross module / create cross module ', async(()=>{
    // mock data
    const row = {
      OBJECTNUMBER:{
        fieldData:'TMP001'
      }
    };
    component.dataSource = new SchemaDataSource(schemaDetailService, null, component.schemaId, sharedService);
    component.dataSource.targetField = 'MATL_GRP';
    spyOn(schemaDetailService, 'generateCrossEntry').and.returnValue(of(undefined));

    expect(component.generateCrossEntry(row)).toBeUndefined();
    expect(schemaDetailService.generateCrossEntry).toHaveBeenCalled();
  }));

  it('uploadCorrectedData(), navigate for upload corrected rec ', async(()=>{
    spyOn(router, 'navigate');
    component.schemaInfo = {runId:'24243'} as SchemaListDetails;
    component.uploadCorrectedData();
    expect(router.navigate).toHaveBeenCalledWith([{outlets: { sb: `sb/schema/upload-data/${component.moduleId}/${component.outlet}`}}], {queryParams:{importcorrectedRec: true, schemaId: component.schemaId, runid: component.schemaInfo.runId}});
  }));

  it('should manageStaticColumns', () => {
    component.manageStaticColumns();
    expect(component.startColumns.includes('_score_weightage')).toBeTrue();

    component.activeTab = 'review';
    component.manageStaticColumns();
    expect(component.startColumns.includes('_score_weightage')).toBeFalse();
  });

  it('should makeFilterControl', () => {

    fixture.detectChanges();

    const criteria = {selectedValues: [{CODE: 'USA'}], fldCtrl: {fieldId: 'region'},  fieldId: 'region'} as AddFilterOutput;
    spyOn(component,'getData');
    spyOn(component,'getSchemaExecutionTree');
    spyOn(component,'getSchemaStatics');
    component.makeFilterControl(criteria);
    expect(component.filterCriteria.getValue()?.length).toEqual(1);

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

  it('should refresh table data on new variantId', (async () => {

    spyOn(component, 'getVariantDetails');

    component.dataScope = [{ variantId: '1', schemaId: component.schemaId, variantName: 'first variant' } as SchemaVariantsModel];

    component.variantChange('1');
    expect(component.variantName).toEqual('first variant');
    component.variantChange('1');
    expect(component.getVariantDetails).toHaveBeenCalledTimes(1);

    component.variantChange('0');
    expect(component.filterCriteria.getValue()).toEqual([]);

    expect(component.variantChange('2')).toBeUndefined();

    component.variantId = '0';
    expect(component.variantChange('0')).toBeUndefined();
  }));

  it('should getSchemaTableActions', () => {

    spyOn(schemaDetailService, 'getTableActionsBySchemaId').and.returnValues(of([]), of([{ actionText: 'Approve'} as SchemaTableAction]));

    component.getSchemaTableActions();
    expect(component.tableActionsList.length).toEqual(2);

    component.getSchemaTableActions();
    expect(component.tableActionsList.length).toEqual(1);

  });

  it('should get data on sort change', () => {

    spyOn(component, 'getData');

    fixture.detectChanges();
    component.sort.sort({id: 'status'} as MatSortable);
    expect(component.sortOrder).toEqual({status: 'asc'});

    component.sort.sort({id: 'status'} as MatSortable);
    expect(component.sortOrder).toEqual({status: 'desc'});

    component.sort.sort({id: 'status'} as MatSortable);
    expect(component.getData).toHaveBeenCalledTimes(2);

  });

  it('toggleSideBar(), toggle sidebar', () => {
    component.arrowIcon='chevron-left';
    // fixture.detectChanges();
    component.navscroll=fixture.componentInstance.navscroll;
    component.toggleSideBar();
    expect(component.arrowIcon).toEqual('chevron-right');

    component.arrowIcon='chevron-right';
    component.toggleSideBar();
    expect(component.arrowIcon).toEqual('chevron-left');

  });


  it('setStatus(), setStatus sidebar', () => {
    const event = new MouseEvent('');
    spyOn(event, 'stopPropagation');
    spyOn(component, 'setNavDivPositions');
    component.setStatus(event, 1)
    expect(event.stopPropagation).toHaveBeenCalled();

    component.setStatus(event, 2)
    expect(component.setNavDivPositions).toHaveBeenCalled();
  });

  it('getSchemaExecutionTree(), get schema execution tree...', async(()=>{
    component.userDetails = new Userdetails();
    component.userDetails.plantCode = 'test';
    component.userDetails.userName = 'test';
    component.appliedBrList = [{brIdStr:'768762873'}as CoreSchemaBrInfo];
    spyOn(schemaService,'getSchemaExecutionTreeV2').withArgs(component.moduleId, component.schemaId, component.variantId, component.userDetails.plantCode, component.userDetails.userName, component.activeTab,['768762873'], []).and.returnValues(of(new SchemaExecutionTree()), throwError({message: 'api error'}));
    component.getSchemaExecutionTree(component.userDetails.plantCode, component.userDetails.userName);
    expect(schemaService.getSchemaExecutionTreeV2).toHaveBeenCalledWith(component.moduleId, component.schemaId, component.variantId, component.userDetails.plantCode, component.userDetails.userName, component.activeTab,['768762873'], []);

    spyOn(console, 'error');
    component.getSchemaExecutionTree(component.userDetails.plantCode, component.userDetails.userName);
    expect(console.error).toHaveBeenCalled();
  }));

  it('updateColumnBasedOnNodeSelection()', async(()=>{

    component.executionTreeHierarchy = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY},
        {nodeId: '2', nodeType: SchemaExecutionNodeType.GRID}
      ]
    } as SchemaExecutionTree;
    component.activeNode = component.executionTreeHierarchy;

    component.metadata.next(
      {
        headers: {},
        hierarchyFields: {
          MTL_DESC: {fieldId:'MTL_DESC'}
        },
        gridFields: {
          region: {fieldId: 'region'},
        }
      } as MetadataModeleResponse
    );

    const response = [
      {nodeId: 'header', nodeType:'HEADER', fieldsList: [{fieldId:'MTL_TYPE'}]},
      {nodeId: '1', nodeType:'HEIRARCHY', fieldsList: []},
      {nodeId: '2', nodeType:'GRID', fieldsList: []}
    ];

    spyOn(component.selectedFieldsOb, 'next');
    spyOn(component, 'getNodeParentsHierarchy').and.returnValue(['header'])
    spyOn(schemaDetailService,'getSelectedFieldsByNodeIds').and.returnValues(of(response), throwError({message: 'api error'}));
    const schemaDetailsResponse = new SchemaListDetails();
    schemaDetailsResponse.variantId = '12345';
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').and.returnValue(of(schemaDetailsResponse));

    const newNode = new SchemaExecutionTree();
    newNode.nodeId = '1';
    newNode.nodeType = SchemaExecutionNodeType.HEIRARCHY;
    component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType);
    expect(component.selectedFieldsOb.next).toHaveBeenCalled();

    spyOn(console, 'error');
    newNode.nodeId = '2';
    component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType);
    expect(console.error).toHaveBeenCalled();
  }));

  it('updateColumnBasedOnNodeSelection()', async(()=>{
    component.executionTreeHierarchy = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY},
        {nodeId: '2', nodeType: SchemaExecutionNodeType.GRID}
      ]
    } as SchemaExecutionTree;
    component.activeNode = component.executionTreeHierarchy;

    component.metadata.next(
      {
        headers: ['test1', 'test2'],
        hierarchyFields: {
          MTL_DESC: {fieldId:'MTL_DESC'},
          1: 'test'
        },
        gridFields: {
          region: {fieldId: 'region'},
          2: 'test'
        }
      } as MetadataModeleResponse
    );

    const response = [
      {nodeId: 'header', nodeType:'HEADER', fieldsList: [{fieldId:'MTL_TYPE'}, {fieldId:'MTL_TYPE'}]},
      {nodeId: '1', nodeType:'HEIRARCHY', fieldsList: []},
      {nodeId: '2', nodeType:'GRID', fieldsList: []}
    ];

    spyOn(component.selectedFieldsOb, 'next');
    spyOn(component, 'getNodeParentsHierarchy').and.returnValue(['header'])
    spyOn(schemaDetailService,'getSelectedFieldsByNodeIds').and.returnValues(of(response), throwError({message: 'api error'}));
    const schemaDetailsResponse = new SchemaListDetails();
    schemaDetailsResponse.variantId = '12345';
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').and.returnValue(of(schemaDetailsResponse));

    const newNode = new SchemaExecutionTree();
    newNode.nodeId = 'test';
    newNode.nodeType = SchemaExecutionNodeType.HEIRARCHY;
    expect(component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType)).toBeUndefined();
    expect(component.getNodeParentsHierarchy).toHaveBeenCalled();
    expect(schemaDetailService.getSelectedFieldsByNodeIds).toHaveBeenCalled();
    expect(component.selectedFieldsOb.next).toHaveBeenCalled();

    newNode.nodeId = '2';
    newNode.nodeType = SchemaExecutionNodeType.GRID;
    expect(component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType)).toBeUndefined();
  }));

  it('updateColumnBasedOnNodeSelection()', async(()=>{
    component.executionTreeHierarchy = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY},
        {nodeId: '2', nodeType: SchemaExecutionNodeType.GRID}
      ]
    } as SchemaExecutionTree;
    component.activeNode = component.executionTreeHierarchy;

    component.metadata.next(
      {
        headers: ['test1', 'test2'],
        hierarchyFields: {
          MTL_DESC: {fieldId:'MTL_DESC'},
          1: 'test'
        },
        gridFields: {
          region: {fieldId: 'region'},
          2: 'test'
        }
      } as MetadataModeleResponse
    );

    const response = [
      {nodeId: 'header', nodeType:'HEADER', fieldsList: []},
      {nodeId: '1', nodeType:'HEIRARCHY', fieldsList: []},
      {nodeId: '2', nodeType:'GRID', fieldsList: []}
    ];

    spyOn(component.selectedFieldsOb, 'next');
    spyOn(component, 'getNodeParentsHierarchy').and.returnValue(['header'])
    spyOn(schemaDetailService,'getSelectedFieldsByNodeIds').and.returnValues(of(response), throwError({message: 'api error'}));

    const newNode = new SchemaExecutionTree();
    newNode.nodeId = 'header';
    newNode.nodeType = SchemaExecutionNodeType.HEADER;
    expect(component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType)).toBeUndefined();

    component.metadata.next(null);
    newNode.nodeId = 'header';
    newNode.nodeType = SchemaExecutionNodeType.HEADER;
    expect(component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType)).toBeUndefined();
  }));

  it('updateColumnBasedOnNodeSelection()', async(()=>{
    component.executionTreeHierarchy = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY},
        {nodeId: '2', nodeType: SchemaExecutionNodeType.GRID}
      ]
    } as SchemaExecutionTree;
    component.activeNode = component.executionTreeHierarchy;

    component.metadata.next(null);

    const response = [
      {nodeId: 'header', nodeType:'HEADER', fieldsList: []},
      {nodeId: '1', nodeType:'HEIRARCHY', fieldsList: []},
      {nodeId: '2', nodeType:'GRID', fieldsList: []}
    ];

    spyOn(component.selectedFieldsOb, 'next');
    spyOn(component, 'getNodeParentsHierarchy').and.returnValue(['header'])
    spyOn(schemaDetailService,'getSelectedFieldsByNodeIds').and.returnValues(of(response), throwError({message: 'api error'}));

    const newNode = new SchemaExecutionTree();
    newNode.nodeId = 'header';
    newNode.nodeType = SchemaExecutionNodeType.HEADER;
    expect(component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType)).toBeUndefined();
  }));

  it('updateColumnBasedOnNodeSelection()', async(()=>{
    spyOn(schemaDetailService,'getSelectedFieldsByNodeIds').and.returnValues(of([]), throwError({message: 'api error'}));

    const newNode = new SchemaExecutionTree();
    newNode.nodeId = '1';
    newNode.nodeType = SchemaExecutionNodeType.HEIRARCHY;
    expect(component.updateColumnBasedOnNodeSelection(newNode.nodeId, newNode.nodeType)).toBeUndefined();
  }));

  it('getExectionArray()', async(()=>{

    component.activeNode = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY}
      ]
    } as SchemaExecutionTree;

    const arr = component.getExectionArray(component.activeNode);
    expect(arr.length).toEqual(2);
  }));

  it('getNodeParentsHierarchy()', async(()=>{

    component.executionTreeHierarchy = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY}
      ]
    } as SchemaExecutionTree;

    expect(component.getNodeParentsHierarchy(null)).toEqual(['header']);

    component.activeNode = component.executionTreeHierarchy;

    expect(component.getNodeParentsHierarchy(component.activeNode.childs[0])).toEqual(['1','header']);
    expect(component.getNodeParentsHierarchy({} as SchemaExecutionTree)).toEqual(['header']);
  }));

  it('uploadCorrectedDataCsv(), should open files', async(() => {
    expect(component.uploadCorrectedDataCsv()).toBeTruthy();

    const el = document.getElementById('uploadFileCtrl');
    el.remove();
    expect(component.uploadCorrectedDataCsv()).toBeTruthy();
  }));

  it('fileUploaded(), should close upload progress', async(() => {
    component.fileUploaded('');
    component.fileUploaded('test');
    expect(component.isFileUploading).toBeFalse();
  }));

  it('fileChange(), upload csv file', async(() => {
    const ev: Event = new Event('file');
    spyOn(component, 'checkForValidFile').withArgs(ev).and.returnValue({errMsg: 'Error', file: null});
    spyOn(console, 'error');
    component.fileChange(ev);

    expect(console.error).toHaveBeenCalled();
  }));

  it('fileChange(), upload csv file', async(() => {
    const ev: Event = new Event('file');
    spyOn(component, 'checkForValidFile').withArgs(ev).and.returnValue({errMsg: '', file: null});
    spyOn(console, 'error');
    component.fileChange(ev);

    expect(console.error).toHaveBeenCalled();
  }));

  it('fileChange(), upload csv file', async(() => {
    const ev: Event = new Event('file');
    const resFile: File = new File([], 'test');
    spyOn(component, 'checkForValidFile').withArgs(ev).and.returnValue({errMsg: '', file: resFile});
    spyOn(schemaDetailService, 'uploadCsvFileData').and.returnValue(of(['12345']));
    component.activeNode = {
      nodeId: 'header',
      nodeDesc: '',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [],
      docCount: 0
    };
    component.moduleInfo = {
      moduleDesc: 'test',
      moduleId: '0'
    };
    expect(component.fileChange(ev)).toBeUndefined();

    component.activeNode.nodeId = '';
    component.activeNode.nodeType = undefined;
    component.moduleInfo.moduleDesc = '';
    expect(component.fileChange(ev)).toBeUndefined();
  }));

  it('fileChange(), upload csv file', async(() => {
    const ev: Event = new Event('file');
    const resFile: File = new File([], 'test');
    spyOn(component, 'checkForValidFile').withArgs(ev).and.returnValue({errMsg: '', file: resFile});
    spyOn(schemaDetailService, 'uploadCsvFileData').and.returnValues(of(undefined), throwError({message: 'error'}));
    component.activeNode = {
      nodeId: 'header',
      nodeDesc: '',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [],
      docCount: 0
    };
    component.moduleInfo = {
      moduleDesc: 'test',
      moduleId: '0'
    };
    expect(component.fileChange(ev)).toBeUndefined();
  }));

  it('fileChange(), upload csv file', async(() => {
    const ev: Event = new Event('file');
    const resFile: File = new File([], 'test');
    spyOn(component, 'checkForValidFile').withArgs(ev).and.returnValue({errMsg: '', file: resFile});
    spyOn(schemaDetailService, 'uploadCsvFileData').and.returnValue(throwError({message: 'error'}));
    component.activeNode = {
      nodeId: 'header',
      nodeDesc: '',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [],
      docCount: 0
    };
    component.moduleInfo = {
      moduleDesc: 'test',
      moduleId: '0'
    };
    expect(component.fileChange(ev)).toBeUndefined();
  }));

  it('checkForValidFile()', async(() => {
    let ev: Event = new Event('file');
    ev = undefined;
    const res: any = component.checkForValidFile(ev);

    expect(res.file).toEqual(null);

    const event: any = {
      target: {
        files: [
          {
            name: 'test.xlsx',
            size: 12345
          }
        ]
      }
    };

    const res1 = component.checkForValidFile(event);
    expect(res1.errMsg).toEqual('');

    event.target.files.push({name: 'test', size: 12345});
    const res2 = component.checkForValidFile(event);
    expect(res2.errMsg).toEqual('Cannot use multiple files');

    event.target.files = [{name: 'test.xls', size: 1000000000}];
    const res3 = component.checkForValidFile(event);
    expect(res3.errMsg).toEqual('File size too large , upload less then 10 MB');

    event.target.files = [{name: 'test.png', size: 100}];
    const res4 = component.checkForValidFile(event);
    expect(res4.errMsg).toEqual('Unsupported file format, allowed file formats are .xlsx, .xls and .csv');
  }));

  it('getModuleInfo(), should get module info', async(() => {
    spyOn(component,'getDataScope');
    spyOn(coreServiceSpy, 'searchAllObjectType').and.returnValues(of([]), throwError({message: 'api error'}));
    component.getModuleInfo('');
    expect(component.getDataScope).toHaveBeenCalled();
  }));

  it('getModuleInfo(), should get module info', async(() => {
    const val: ModuleInfo[] = [
      {
        moduleId: '1005',
        moduleDesc: 'test',
        datasetCount: 10
      }
    ];
    spyOn(component,'setLoading');
    spyOn(coreServiceSpy, 'searchAllObjectType').and.returnValues(of(val), throwError('error'));
    component.getModuleInfo('1005');
    expect(component.moduleInfo).toEqual(val[0]);
    expect(component.totalVariantsCnt).toEqual(10);
    expect(component.setLoading).toHaveBeenCalledWith({
      getModuleInfo: false
    })
  }));

  it('getModuleInfo(), should get module info error', async(() => {
    spyOn(component,'setLoading');
    spyOn(coreServiceSpy,'searchAllObjectType').and.returnValue(throwError({message: 'api error'}));
    component.getModuleInfo('12345');
    expect(component.setLoading).toHaveBeenCalledWith({
      getModuleInfo: false
    })
  }));

  it('enableIcon(), enable collapsiable icon ', async(()=>{
    // mock data
    component.columns.header = ['MAT_TYPE','MAT_GRP'];
    component.nodeId = 'other';

    expect(component.enableIcon('MAT_TYPE')).toEqual(false, 'If the column is not matched the return false');
    expect(component.enableIcon('MAT_GRP')).toEqual(true, 'If the column is  matched the return true');
  }));

  it('loadNodeData(), load the node data based on node selected ', async(()=>{
    spyOn(router, 'navigate');

    // mock data
    component.activeNode.nodeId = 'header1';
    const node: SchemaExecutionTree = {nodeId: 'header1', nodeType: 'HEADER'} as SchemaExecutionTree;
    component.loadNodeData(node);
    node.nodeId = 'header';
    component.loadNodeData(node);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: component.activatedRouter,
      queryParams: {
        node: node.nodeId,
        'node-level': node.nodeType
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }));

  it('doColumnsCollapsible(), do the column collapsible', async(()=>{
    // mock data
    component.displayedFields.next(['selected','___header__collapsible','MAT_TYPE', 'MAT_GRP']);
    component.columns.header = ['MAT_TYPE','MAT_GRP','TEST'];

    component.nodeId = 'header';
    component.doColumnsCollapsible(null, 'open', '___header__collapsible');
    expect(component.displayedFields.getValue()).toBeTruthy();

    component.nodeId = 'grid';
    component.doColumnsCollapsible(null, 'open', '___header__collapsible');
    expect(component.displayedFields.getValue()).toBeTruthy();

    component.nodeId = 'grid';
    component.displayedFields.next(['selected','___grid__collapsible','MAT_TYPE', 'MAT_GRP']);
    component.columns.grid = ['MAT_TYPE','MAT_GRP','TEST'];

    component.doColumnsCollapsible(null, 'open', '___grid__collapsible');
    expect(component.displayedFields.getValue()).toBeTruthy();

    component.nodeId = 'hie';
    component.displayedFields.next(['selected','MAT_TYPE', 'MAT_GRP']);
    component.columns.hie = ['MAT_TYPE','MAT_GRP','TEST'];

    component.doColumnsCollapsible(null, 'open', '___hierarchy__collapsible');
    expect(component.displayedFields.getValue()).toBeTruthy();


    // for close state ....

    component.doColumnsCollapsible(null, '', 'MAT_TYPE');

    component.displayedFields.next(['selected','OBJECTNUMBER','MAT_TYPE', 'MAT_GRP']);
    component.doColumnsCollapsible(null, 'close', 'MAT_TYPE');
    expect(component.displayedFields.getValue()).toBeTruthy();

    component.columns = {
      header: 'MAT_TYP'
    };
    component.doColumnsCollapsible(null, 'close', 'MAT_TYPE');
    expect(component.displayedFields.getValue()).toBeTruthy();
  }));

  it('doColumnsCollapsible(), do the column collapsible', async(()=>{
    // mock data
    component.displayedFields.next(['selected','___header__collapsible','MAT_TYPE', 'MAT_GRP']);
    component.columns.header = ['MAT_TYPE','MAT_GRP','TEST'];
    component.columns.grid = ['TEST1'];

    // for close state ....
    component.nodeType = 'GRID';
    component.doColumnsCollapsible(null, 'close', 'TEST');
    expect(component.displayedFields.getValue()).toBeTruthy();

    component.nodeType = 'GRID';
    component.doColumnsCollapsible(null, 'close', 'TEST1');
    expect(component.displayedFields.getValue()).toBeTruthy();

    component.nodeType = 'HEIRARCHY';
    component.doColumnsCollapsible(null, 'close', 'TEST1');
    expect(component.displayedFields.getValue()).toBeTruthy();
  }));

  it('getNodeTypeById()', async(()=>{

    component.executionTreeHierarchy = {
      nodeId: 'header',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [
        {nodeId: '1', nodeType: SchemaExecutionNodeType.HEIRARCHY}
      ]
    } as SchemaExecutionTree;

    expect(component.getNodeTypeById('1')).toEqual(SchemaExecutionNodeType.HEIRARCHY);
    expect(component.getNodeTypeById('other')).toBeFalsy();

  }));

  it(`isHeaderColumn() , check whether the field is header field or note `, async(()=>{
    // mock data
    component.columns.header = ['MATL_TYPE','MATL_GRP'];
    const res = component.isHeaderColumn('MATL_TYPE');
    expect(res).toBeTrue();

    const res1 = component.isHeaderColumn('MATL_TYP3');
    expect(res1).toBeFalse();

    component.columns = {};
    const res2 = component.isHeaderColumn('Test');
    expect(res2).toBeUndefined();

  }));

  it('isFieldEditable(), check if field is editable', async(() => {
    component.selectedFields = [];
    expect(component.isFieldEditable('1')).toBeFalse();

    component.selectedFields = [
      {
        fieldId: '1',
        order: 0,
        editable: true,
        isEditable: true
      }
    ];
    expect(component.isFieldEditable('1')).toBeTrue();
  }));

  it('onRunCompleted()', () => {
    spyOn(component.runCompleted,'emit');
    spyOn(component,'getSchemaStatics');
    component.onRunCompleted(true);
    expect(component.statics).toEqual(undefined);
    expect(component.runCompleted.emit).toHaveBeenCalledWith(true);
    expect(component.getSchemaStatics).toHaveBeenCalledWith(true);
  });

  it('opnDialogSaveVariant()', async(() => {
    expect(component.opnDialogSaveVariant()).toBeUndefined();
  }));

  it('getAllNodeFields()', async(() => {
    const node: SchemaExecutionTree = {
      nodeId: 'headers',
      nodeDesc: '',
      nodeType: SchemaExecutionNodeType.HEADER,
      childs: [],
      docCount: 0
    };
    expect(component.getAllNodeFields(node)).toBeTruthy();

    node.nodeType = SchemaExecutionNodeType.HEIRARCHY;
    expect(component.getAllNodeFields(node)).toBeTruthy();

    node.nodeType = SchemaExecutionNodeType.GRID;
    expect(component.getAllNodeFields(node)).toBeTruthy();

    const res: MetadataModeleResponse = {
      headers: undefined,
      grids:{ LANGUAGE_GRID:{fieldId:'LANGUAGE_GRID'}},
      gridFields:{ LANGUAGE_GRID:{LANGUAGE:{ieldId:'LANGUAGE'}}},
      hierarchy:[{heirarchyId:'1', heirarchyText:'Plant'} as Heirarchy],
      hierarchyFields:{1:{PLANT:{fieldId:'PLANT'}}}
    };
    component.metadata.next(res);

    node.nodeType = SchemaExecutionNodeType.HEADER;
    expect(component.getAllNodeFields(node)).toBeTruthy();

    node.nodeType = SchemaExecutionNodeType.HEIRARCHY;
    expect(component.getAllNodeFields(node)).toBeTruthy();

    node.nodeType = SchemaExecutionNodeType.GRID;
    expect(component.getAllNodeFields(node)).toBeTruthy();
  }));

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

  it(`businessRulesBasedOnLastRun(), get the business rules from the last run`, async(()=>{
    // mock data
    const rules = [{
      brInfo:'Rule 1',
      brIdStr:'765675757'
    }as CoreSchemaBrInfo];

    // spy the service
    spyOn(schemaService, 'getBuisnessRulesBasedOnRun').withArgs(component.schemaId, '').and.returnValue(of(rules));

    component.businessRulesBasedOnLastRun('');

    expect(schemaService.getBuisnessRulesBasedOnRun).toHaveBeenCalledWith(component.schemaId, '');

  }));

  it('businessRulesBasedOnLastRun(), error case', async(() => {
    spyOn(schemaService, 'getBuisnessRulesBasedOnRun').and.returnValue(throwError({message: 'api error'}));
    spyOn(console, 'error');
    component.businessRulesBasedOnLastRun('test');

    expect(console.error).toHaveBeenCalled();
    expect(schemaService.getBuisnessRulesBasedOnRun).toHaveBeenCalled();
  }));

  it(`searchBusinessRules(), search the rules based on search string `, async(()=>{

    spyOn(component,'delayedCall');
    component.searchBusinessRules('');
    expect(component.delayedCall).toHaveBeenCalled();


  }));

  it(`addFilterFromBrRule(), add the filter parameters `, async(()=>{
    // mock data
    const br = {brIdStr:'767868768', brInfo:'Rule 1'} as CoreSchemaBrInfo;
    component.appliedBrList = [];

    component.addFilterFromBrRule(br, true);
    expect(component.appliedBrList.length).toEqual(1);

    component.addFilterFromBrRule(br, false);
    expect(component.appliedBrList.length).toEqual(0);



  }));

  it(`isBrAppliedChecked() , check the br is applied or note `, async(()=>{
    const br = {brIdStr:'767868768', brInfo:'Rule 1'} as CoreSchemaBrInfo;
    component.appliedBrList = [br];

    expect(component.isBrAppliedChecked(br)).toEqual(true);
    br.brIdStr = '87767676767';
    component.appliedBrList = [br];
    expect(component.isBrAppliedChecked({brIdStr:'767868768', brInfo:'Rule 1'} as CoreSchemaBrInfo)).toEqual(false);


  }));

  it(`brRuleFilterDesc() , get the applied rule text `, async(()=>{
    const br = {brIdStr:'767868768', brInfo:'Rule 1'} as CoreSchemaBrInfo;
    component.appliedBrList = [br];
    component.refreshBrRuleFilterDesc();
    expect(component.brRuleFilterDesc).toEqual(br.brInfo);

    const br1 = {brIdStr:'876778', brInfo:'Rule 2'} as CoreSchemaBrInfo;
    component.appliedBrList.push(br1);
    component.refreshBrRuleFilterDesc();
    expect(component.appliedBrList.length).toEqual(2);

    component.appliedBrList = [];
    component.refreshBrRuleFilterDesc();
    expect(component.brRuleFilterDesc).toEqual('All');

  }));

  it('applyFilterFromBrRule() , applied filter after selecting rule ', async(()=>{
    // mock data
    component.filterCriteria.next([]);
    component.userDetails = {plantCode:'0', userName:'srana'} as Userdetails;

    spyOn(component,'getData');
    spyOn(component,'getSchemaExecutionTree');
    spyOn(component, 'getSchemaStatics');

    component.applyFilterFromBrRule();

    expect(component.getData).toHaveBeenCalled();
    expect(component.getSchemaExecutionTree).toHaveBeenCalled();
    expect(component.getSchemaStatics).toHaveBeenCalled();
  }));

  // it('isAdmin(), should check if the user is admin', () => {

  //   component.userDetails = {
  //     currentRoleId: 'AD',
  //     userName: 'TESTUSER',
  //     plantCode: '0'
  //   } as Userdetails;

  //   component.schemaInfo  = {
  //     schemaId: 'schema1',
  //     runId:'889321',
  //     createdBy: 'TESTUSER',
  //     collaboratorModels: {
  //       isEditer: true,
  //       isAdmin: true,
  //       isApprover: true,
  //       isReviewer: true}
  //     } as SchemaListDetails;

  //   expect(component.isAdmin()).toEqual(true);

  //   component.userDetails.userName = 'DIFFERENT_USERNAME';
  //   expect(component.isAdmin()).toEqual(true);

  //   component.schemaInfo.collaboratorModels.isAdmin = false;
  //   expect(component.isAdmin()).toEqual(false);

  //   component.userDetails.userName = 'TESTUSER';
  //   expect(component.isAdmin()).toEqual(true);
  // });

  it('getParentVal()', async(() => {
    const fld = new SchemaTableViewFldMap();
    fld.fieldId = 'TEST';
    fld.parentField = ['PAR_TEST'];
    component.selectedFields = [fld];

    const row = {PAR_TEST: {fieldCode: '0001'}};
    const res = component.getParentVal('TEST', row);
    expect(res.length).toEqual(1);

    const row2 = {PAR_TEST: {fieldId: '0001'}};
    const res2 = component.getParentVal('TEST', row2);
    expect(res2.length).toEqual(1);

    component.selectedFields = [];
    const res1 = component.getParentVal('TEST', row);
    expect(res1.length).toEqual(0);
  }));

  it('activeCellPosition()', () => {
    component.activeCellPosition('test', 1);
    expect(component.activeCell.column).toEqual('test');
    expect(component.activeCell.rowIndex).toEqual(1);
  });

  it('isActive()', () => {
    component.activeCellPosition('test', 1);
    expect(component.isActive('test', 1)).toBeTrue();
    expect(component.isActive('', 2)).toBeFalse();
  });

  // it('badge()', () => {
  //   component.activeCellPosition('test', 1);
  //   component.requestStatus = BadgeStatus.PENDING;

  //   let result = component.badge('test', 1);

  //   expect(result.icon).toEqual('clock');
  //   expect(result.type).toEqual(null);
  //   expect(result.font).toEqual('light');

  //   component.requestStatus = BadgeStatus.SUCCESS;
  //   result = component.badge('test', 1);

  //   expect(result.icon).toEqual('check');
  //   expect(result.type).toEqual(BadgeStatus.SUCCESS);

  //   component.requestStatus = BadgeStatus.ERROR;
  //   result = component.badge('test', 1);

  //   expect(result.icon).toEqual('exclamation-circle');
  //   expect(result.type).toEqual(BadgeStatus.ERROR);
  //   expect(result.font).toEqual('solid');

  //   result = component.badge('test', 2);
  //   expect(result.icon).toEqual(null);
  // });

  it('getBadgeState()', async(() => {
    component.fieldsInUpdate = [{fldId: '1234', row: '0', badge: BadgeStatus.SUCCESS}];
    const result = component.getBadgeState('1234', '0');
    expect(result.icon).toEqual('check');

    const result1 = component.getBadgeState('123', '0');
    expect(result1.icon).toEqual(null);
  }));

  // it('setBadgeState()', async(() => {
  //   component.fieldsInUpdate = [{fldId: '1234', row: '0', badge: BadgeStatus.SUCCESS}];
  //   expect(component.setBadgeState('1234', '0', BadgeStatus.ERROR)).toBeUndefined();
  //   expect(component.setBadgeState('123', '0', BadgeStatus.ERROR)).toBeUndefined();
  // }));

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

  // it('emitEditBlurChng(), emit and editable cell and call api for validation and do-correction', async(()=>{
  //   // mock data
  //   dataSourceSpy.getRow.withArgs('OBJ001').and.returnValue({hdvs:{test:{}}});
  //   const inpctrl = document.createElement('div');
  //   inpctrl.setAttribute('id','inpctrl_test_0');

  //   (fixture.nativeElement as HTMLElement).append(inpctrl);

  //   const viewctrl = document.createElement('span');
  //   viewctrl.setAttribute('id','viewctrl_test_0');

  //   (fixture.nativeElement as HTMLElement).append(viewctrl);

  //   const row = {OBJECTNUMBER:{fieldData:'OBJ001'}, test:{fieldData:'hello'}};

  //   const viewContainerRef: ViewContainerRef = {clear:()=>{console.log('crear log !!')}} as ViewContainerRef;

  //   component.emitEditBlurChng('test','hell',row,0, viewContainerRef);

  //   inpctrl.remove();
  //   viewctrl.remove();

  //   expect(component.requestStatus).toEqual(BadgeStatus.PENDING);

  // }));
});
