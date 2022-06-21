import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassificationHeader, ClassificationNounMod, MetadataModeleResponse, SchemaTableAction } from '@models/schema/schemadetailstable';
import { ModuleInfo, SchemaDashboardPermission, SchemaListDetails, SchemaStaticThresholdRes, SchemaVariantsModel } from '@models/schema/schemalist';
import { Userdetails } from '@models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { SchemaService } from '@services/home/schema.service';
import { BadgeStatus } from '@services/home/schema/badge.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SkeletonLoaderComponent } from '../../skeleton-loader/skeleton-loader.component';
import { GlobalCountComponent } from '../../_builder/global-count/global-count.component';

import { ClassificationBuilderComponent } from './classification-builder.component';

describe('ClassificationBuilderComponent', () => {
  let component: ClassificationBuilderComponent;
  let fixture: ComponentFixture<ClassificationBuilderComponent>;

  let schemaService: SchemaService;
  let schemaDetailService: SchemaDetailsService;
  let schemavariantService: SchemaVariantService;
  let router: Router;
  let sharedService: SharedServiceService;
  let coreServiceSpy: CoreService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassificationBuilderComponent, SearchInputComponent, GlobalCountComponent, SkeletonLoaderComponent ],
      imports:[
        HttpClientTestingModule,
        RouterTestingModule,
        AppMaterialModuleForSpec,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationBuilderComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaDetailService = fixture.debugElement.injector.get(SchemaDetailsService);
    schemavariantService = fixture.debugElement.injector.get(SchemaVariantService);
    coreServiceSpy = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);

    component.schemaId = '274751';
    component.variantId = '0';
    component.moduleId = '1005';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSchemaStatics(), get schema statics .. ', async(()=>{

    const response = {schemaId: component.schemaId, successCnt: 10} as SchemaStaticThresholdRes;

    spyOn(schemaService,'getSchemaThresholdStatics').withArgs(component.schemaId, component.variantId)
      .and.returnValues(of(response), throwError({status: 500}));
    component.getSchemaStatics();
    expect(schemaService.getSchemaThresholdStatics).toHaveBeenCalledWith(component.schemaId, component.variantId);
    expect(component.statics).toEqual(response);

    spyOn(console, 'error');
    component.getSchemaStatics();
    expect(console.error).toHaveBeenCalled();

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
    expect(component.loader.metaDataDetails).toBeFalsy();
}));

it('getFldMetadata(), get field metadata error ', async(()=>{
  // error response
  spyOn(coreServiceSpy,'getMetadataFieldsByModuleId')
    .and.returnValues(throwError({status: 500}));
  spyOn(console, 'error');
  component.getFldMetadata();
  expect(console.error).toHaveBeenCalled();
  expect(component.loader.metaDataDetails).toBeFalsy();
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
    },variantId:{
      currentValue:'1',
      firstChange:true,
      isFirstChange:null,
      previousValue:null
    },
    isInRunning:{
      currentValue:false,
      firstChange:true,
      isFirstChange:null,
      previousValue:null
    }
  } as SimpleChanges;


  // no changes
  component.ngOnChanges({});
  expect(component.variantId).toEqual('0');

  component.ngOnChanges(changes);
  expect(component.ngOnChanges).toBeTruthy();

  changes.isInRunning.currentValue = true;
  component.ngOnChanges(changes);
  expect(component.isInRunning).toBeTrue();

}));

  it('getDataScope(), get data scope', async(()=>{
    const body = { from: 0, size: 10, variantName: null };
    spyOn(schemavariantService, 'getDataScopesList').withArgs(component.schemaId, 'RUNFOR', body)
      .and.returnValues(of([]), of([]), throwError({status:500}));

    spyOn(component, 'variantChange');
    component.getDataScope();
    component.getDataScope('1');
    expect(schemavariantService.getDataScopesList).toHaveBeenCalled();
    expect(component.variantChange).toHaveBeenCalledTimes(1);

    // error response
    spyOn(console, 'error');
    component.getDataScope();
    expect(console.error).toHaveBeenCalled();

  }));

  it('transformData(), transform data ', async(()=>{
    // mock data
    const row = {1001:[
      {NOUN_CODE:'26462'},
      {OBJECTNUMBER:'236462'},
      {LONG_DESC:'8234762187'}
    ]};
    const res = component.transformData(row,'mro_local_lib');
    expect(res.length).toEqual(1);

  }));

  it('getDataScope(), should return all variants of a schema', async () => {
    component.schemaId = '1005';
    const body = { from: 0, size: 10, variantName: null };
    spyOn(schemavariantService, 'getDataScopesList').withArgs(component.schemaId, 'RUNFOR', body).and.returnValue(of())
    component.getDataScope();
    expect(schemavariantService.getDataScopesList).toHaveBeenCalled();
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


  it(`approveRec(), approve mro classification data `, async(()=>{
    // mock data
    const row = {OBJECTNUMBER:{fieldValue:'MAT001'}, __aditionalProp: { isReviewed: false}};
    component.schemaId = '234238';
    component.schemaInfo = {runId:'32423432'} as SchemaListDetails;

    spyOn(schemaDetailService,'approveClassification').withArgs(component.schemaId, component.schemaInfo.runId, ['MAT001'])
      .and.returnValues(of(true), throwError({message: '500 error'}), of(true));

    // inline approve
    component.approveRec(row, 0);
    expect(row.__aditionalProp.isReviewed).toBeFalsy();

    // global approve no selection
    expect(() => component.approveRec({}, 0, 'all')).toThrowError('Objectnumber is required');

    // global approve with selection
    component.selection.select(row);
    component.approveRec({}, 0, 'all');
    expect(row.__aditionalProp.isReviewed).toBeFalsy();


  }));

  it(`rejectRec(), reset or reject mro classification data `, async(()=>{
    // mock data
    const row = {OBJECTNUMBER:{fieldValue:'MAT001'}, __aditionalProp: { isReviewed: false},
                NOUN_CODE: {fieldValue:''}, MODE_CODE:{fieldValue:''}};
    component.schemaId = '234238';
    component.schemaInfo = {runId:'32423432'} as SchemaListDetails;

    spyOn(schemaDetailService,'rejectClassification').withArgs(component.schemaId, component.schemaInfo.runId, ['MAT001'])
      .and.returnValues(of(true), throwError({message: 'Error 500'}), of(true));
    spyOn(component, 'getClassificationNounMod');
    spyOn(component, 'applyFilter');

    component.rejectRec(row, 0);
    expect(component.rejectRec).toBeTruthy();

    // error response
    row.NOUN_CODE.fieldValue = 'Bearing';
    row.MODE_CODE.fieldValue = 'Ball';
    spyOn(console, 'error');
    component.rejectRec(row, 0);
    expect(console.error).toHaveBeenCalled();

    // global reject no selection
    expect(() => component.rejectRec({}, 0, 'all')).toThrowError('Objectnumber is required');

    // global reject with selection
    component.selection.select(row);
    component.rejectRec({}, 0, 'all');
    expect(schemaDetailService.rejectClassification).toHaveBeenCalledWith(component.schemaId, component.schemaInfo.runId, ['MAT001']);

  }));

  it('openExecutionTrendSideSheet ', async(() => {
    spyOn(router, 'navigate');
    component.openExecutionTrendSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/schema/execution-trend/${component.moduleId}/${component.schemaId}/${component.variantId}` } }], {queryParamsHandling: 'preserve'});
  }));

  it(`generateDesc(), generate description mro classification data `, async(()=>{
    // mock data
    const row = {OBJECTNUMBER:{fieldValue:'MAT001'}};
    component.schemaId = '234238';
    component.schemaInfo = {runId:'32423432'} as SchemaListDetails;
    component.dataFrm ='MRO_CLS_MASTER_CHECK';

    spyOn(schemaDetailService,'generateMroClassificationDescription').withArgs(component.schemaId, component.schemaInfo.runId, ['MAT001'], true)
      .and.returnValues(of('success'), throwError({message: 'Error 500'}), of('success'));

    component.generateDesc(row, 0);
    expect(schemaDetailService.generateMroClassificationDescription).toHaveBeenCalledWith(component.schemaId, component.schemaInfo.runId, ['MAT001'], true);
    expect(component.generateDesc).toBeTruthy();

    // error response
    spyOn(console, 'error');
    component.generateDesc(row, 0);
    expect(console.error).toHaveBeenCalled();

    // global reject no selection
    expect(() => component.generateDesc({}, 0, 'all')).toThrowError('Objectnumber is required');

    // global reject with selection
    component.selection.select(row);
    component.generateDesc({}, 0, 'all');

  }));
  it('should get schema permissions', () => {

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321'} as SchemaListDetails;
    expect(component.isEditer).toBeFalsy();
    expect(component.isReviewer).toBeFalsy();
    expect(component.isApprover).toBeFalsy();

  });

  it('should filter primary and secondary actions', () => {
    expect(component.primaryActions.length).toEqual(2);
    expect(component.secondaryActions.length).toEqual(0);

  });

  it('should do table action', () => {

    spyOn(component, 'approveRec');
    spyOn(component, 'rejectRec');

    component.userDetails = new Userdetails();
    const approveAction = {
      isCustomAction: false,
      actionText: 'Approve'
    } as SchemaTableAction;

    component.schemaInfo  = {schemaId: 'schema1', runId:'889321',
      collaboratorModels: {isAdmin: true} as SchemaDashboardPermission} as SchemaListDetails;
    component.schemaInfo.collaboratorModels.isReviewer = true;
    component.doAction(approveAction, {}, 0);
    expect(component.approveRec).toHaveBeenCalledWith({}, 0);

    const rejectAction = {
      isCustomAction: false,
      actionText: 'Reject'
    } as SchemaTableAction;
    component.doAction(rejectAction, {}, 0);
    expect(component.rejectRec).toHaveBeenCalledWith({},0);

  });

  it('should check if global actions are enabled', () => {
    expect(component.isGlobalActionsEnabled).toEqual(false);
    component.selection.select({__aditionalProp: { isReviewed: false}});
    expect(component.isGlobalActionsEnabled).toBeTrue();
  });

  it('should open column settings sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableColumnSettings();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: 'sb/schema/table-column-settings' } }], {queryParamsHandling: 'preserve'});
  })

  it('should init component', () => {

    spyOn(component, 'getClassificationNounMod');
    spyOn(component,'getModuleInfo');
    component.ngOnInit();

    spyOn(component, 'getDataScope');
    sharedService.setDataScope(null);
    sharedService.setDataScope({});
    expect(component.getDataScope).toHaveBeenCalledTimes(1);

    component.viewOf.next('correction');
    expect(component.displayedColumns.getValue().indexOf('row_action')).toBeGreaterThan(-1);

    component.viewOf.next('');
    expect(component.displayedColumns.getValue().indexOf('row_action')).toEqual(-1);

  });

  it('should getFieldsByUserView', () => {

    spyOn(schemaDetailService,'getAllSelectedFields').and.returnValues(throwError({status:500}), of([]), of(null));

    // error response
    spyOn(console, 'error');
    component.getFieldsByUserView();
    expect(console.error).toHaveBeenCalled();

    component.getFieldsByUserView();
    expect(schemaDetailService.getAllSelectedFields).toHaveBeenCalledWith(component.schemaId, component.variantId);

    // falsy variantId
    component.variantId = '';
    component.getFieldsByUserView();
    expect(schemaDetailService.getAllSelectedFields).toHaveBeenCalledWith(component.schemaId, '0');

  });

  it('should return all rows selected', () => {
    expect(component.isAllSelected()).toEqual(true);
  });

  it('should masterToggle', () => {
    spyOn(component.selection, 'clear');
    component.masterToggle();
    expect(component.selection.clear).toHaveBeenCalled();

    component.dataSource.data.push ({fieldId: 'objnumber', fieldData: '1701'});
    component.masterToggle();
    expect(component.isAllSelected()).toBeTrue();
  });

  it('should checkboxLabel', () => {

    const row = {fieldId: 'objnumber', fieldData: '1701'};

    expect(component.checkboxLabel()).toContain('select');

    component.dataSource.data.push(row);
    expect(component.checkboxLabel()).toContain('deselect');

    expect(component.checkboxLabel(row)).toContain('select');

    component.selection.select(row);
    expect(component.checkboxLabel(row)).toContain('deselect');

  });

  it('should not edit cell', () => {
    const row = {OBJECTNUMBER: { fieldValue: '1701' }, region: {fieldId: 'region', fieldData: 'Asia', isEditable: false}};
    expect(component.editCurrentCell('region', row, 1, null)).toBeFalsy();
  });

  it('should openAttributeMapping', () => {

    spyOn(router, 'navigate');
    component.openAttributeMapping('Bearing', 'Ball');
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/schema/attribute-mapping/${component.moduleId}/${component.schemaId}/Bearing/Ball` } }], {
      queryParams: {
        isMapped: false
      }
    });

  });

  it('should getSchemaTableActions', () => {

    spyOn(schemaDetailService, 'getTableActionsBySchemaId').and.returnValues(of([]), of([{ actionText: 'Approve'} as SchemaTableAction]));

    component.getSchemaTableActions();
    expect(component.tableActionsList.length).toEqual(2);

    component.getSchemaTableActions();
    expect(component.tableActionsList.length).toEqual(1);

  });

  it('should refresh table data on new variantId', (async () => {

    spyOn(component, 'getSchemaStatics');

    component.dataScope = [{ variantId: '1', schemaId: component.schemaId, variantName: 'first variant' } as SchemaVariantsModel];

    component.variantChange('1');
    expect(component.variantName).toEqual('first variant');

    component.variantChange('1');
    component.variantChange('0');
    expect(component.variantName).toEqual('Entire dataset');

    expect(component.variantChange('2')).toBeUndefined();

    component.variantId = '0';
    expect(component.variantChange('0')).toBeUndefined();
  }));

  it('should getClassificationNounMod', async(() => {

    component.schemaInfo = {schemaId: component.schemaId, runId: '1701'} as SchemaListDetails;

    const response = {
      MRO_CLS_MASTER_CHECK: {doc_cnt: 1, info : [{nounCode: 'Bearing', modifier: [{ modCode: 'Ball'}]}]}
    } as ClassificationNounMod;

    spyOn(component, 'applyFilter');
    spyOn(component, 'getColumnWithMetadata');
    spyOn(schemaDetailService, 'getClassificationNounMod')
      .and.returnValues(of(response), of(response), of(response), of({} as ClassificationNounMod), throwError({status:500}));

    component.searchNounNavCtrl.setValue(undefined);
    component.getClassificationNounMod();
    expect(component.getColumnWithMetadata).toHaveBeenCalledWith('MRO_CLS_MASTER_CHECK','Bearing', 'Ball');

    // no modifier code
    response.MRO_CLS_MASTER_CHECK.info[0].modifier[0].modCode = '';
    component.activeModeCode = '';
    component.getClassificationNounMod();
    expect(component.activeModeCode).toBeFalsy();

    // no noun code
    response.MRO_CLS_MASTER_CHECK.info[0] = null;
    component.activeNounCode = '';
    component.getClassificationNounMod();
    expect(component.activeNounCode).toBeFalsy();

    // empty response
    component.getClassificationNounMod();
    expect(component.rulesNounMods).toEqual({} as ClassificationNounMod);

    // error response
    spyOn(console, 'error');
    component.getClassificationNounMod();
    expect(console.error).toHaveBeenCalled();

  }));

  it('should filterTableData', () => {
    spyOn(component, 'applyFilter');

    component.dataFrm = '';
    component.filterTableData('search text');
    component.dataFrm = 'mro_local_lib';
    component.filterTableData('search text');
    expect(component.applyFilter).toHaveBeenCalledWith(component.activeNounCode, component.activeModeCode, component.dataFrm, true);
  });

  it('should applyFilter', () => {

    const response = {
      p1701: [{OBJECTNUMBER: 'p1701', MGROUP: 'group1', NOUN_CODE: 'Bearing', MODE_CODE: 'Ball', PARTNO: '1701', SHORT_DESC: 'Ball',
      __aditionalProp: {isReviewed: false}, ATTRIBUTES: [{ATTR_CODE: 'length', ATTRIBUTES_VALUES: ['100']}]}],
      p1702: [{OBJECTNUMBER: 'p1701', MGROUP: '', NOUN_CODE: '', MODE_CODE: '', PARTNO: '', SHORT_DESC: '',
      __aditionalProp: {isReviewed: true, isSubmitted: true}}]
    }

    component.schemaInfo = {runId:'32423432'} as SchemaListDetails;

    spyOn(schemaDetailService, 'getClassificationData')
      .and.returnValues(of({}), of(response), of(response), throwError({message: 'error 500'}));

    const searchInput = TestBed.createComponent(SearchInputComponent);
    component.tableSearchInput = searchInput.componentInstance;

    // empty response
    component.applyFilter('Bearing', 'Ball', 'mro_local_lib');
    expect(component.dataSource.data.length).toEqual(0);

    component.applyFilter('Bearing', 'Ball', 'mro_local_lib');
    expect(component.dataSource.data.length).toEqual(2);

    // load more
    component.viewOf.next('correction');
    component.applyFilter('Bearing', 'Ball', 'mro_local_lib', true, '1701', true);
    expect(component.dataSource.data.length).toEqual(4);

    // error response
    spyOn(console, 'error');
    component.applyFilter('Bearing', 'Ball', 'mro_local_lib');
    expect(console.error).toHaveBeenCalled();

  })

  it('should load data onscroll', () => {

    spyOn(component, 'applyFilter');

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
    component.isLoadMoreEnabled = true;
    component.tableData = {};
    component.onTableScroll(event);
    expect(component.applyFilter).toHaveBeenCalled();

    event.target.scrollTop = 70;
    component.onTableScroll(event);
    expect(component.scrollLimitReached).toBeFalse();

    event.target.scrollTop = 100;
    component.isLoadMoreEnabled = false;
    component.onTableScroll(event);
    expect(component.scrollLimitReached).toBeTrue();

  });

  it('should columnName', () => {
    component.dataFrm = 'MRO_MANU_PRT_NUM_LOOKUP';
    expect(component.columnName('OBJECTNUMBER')).toEqual('Material number');
    expect(component.columnName('unknown')).toEqual('unknown');

    component.dataFrm = 'MRO_CLS_MASTER_CHECK';
    component.colsAndMetadata = [{colId:'ATT1',desc:'Attribute  1'} as ClassificationHeader,{colId:'ATT2'} as ClassificationHeader];
    expect(component.columnName('ATT1')).toEqual('Attribute  1');
    expect(component.columnName('ATT2')).toEqual('ATT2');

  })
  // it('toggleSideBar(), toggle sidebar', () => {
  //   spyOn(component,'ngOnChanges');
  //   component.arrowIcon='chevron-left';
  //   fixture.detectChanges();
  //   spyOn(component,'ngOnInit');
  //   component.navscroll=fixture.componentInstance.navscroll;
  //   component.toggleSideBar();
  //   expect(component.arrowIcon).toEqual('chevron-right');

  //   component.arrowIcon='chevron-right';
  //   component.toggleSideBar();
  //   expect(component.arrowIcon).toEqual('chevron-left');

  // });

  // it('resize(), resize sidebar', () => {
  //   component.mousePosition = {
  //     x: 8,
  //     y: 20
  //   }
  //   fixture.detectChanges();
  //   component.navscroll=fixture.componentInstance.navscroll;
  //   component.boxPosition = { left:10, top:20 };
  //   component.resize();
  //   expect(component.widthOfSchemaNav).toEqual(0)

  //   component.mousePosition = {
  //     x: 18,
  //     y: 20
  //   }
  //   component.boxPosition = { left:10, top:20 };
  //   component.resize();
  //   expect(component.widthOfSchemaNav).toEqual(8)

  //   component.mousePosition = {
  //     x: 400,
  //     y: 20
  //   }
  //   component.resize();
  //   expect(component.arrowIcon).toEqual('chevron-left')
  // });

  it('setStatus(), setStatus sidebar', () => {
    const event = new MouseEvent('');
    spyOn(event, 'stopPropagation');
    spyOn(component, 'setNavDivPositions');
    component.setStatus(event, 1);
    expect(event.stopPropagation).toHaveBeenCalled();

    component.setStatus(event, 2);
    component.setNavDivPositions();
    expect(component.setNavDivPositions).toHaveBeenCalled();
  });

  it('getModuleInfo(), should get module info', async(() => {
    const val: ModuleInfo[] = [
      {
        moduleId: '1005',
        moduleDesc: 'test',
        datasetCount: 10
      }
    ];
    component.locale = 'en';
    spyOn(coreServiceSpy, 'searchAllObjectType').and.returnValues(of(val), throwError('error'));
    spyOn(component,'getDataScope');

    component.getModuleInfo('1005');
    expect(coreServiceSpy.searchAllObjectType).toHaveBeenCalled();
    expect(component.moduleInfo).toEqual(val[0]);
    expect(component.totalVariantsCnt).toEqual(10);
    expect(component.getDataScope).toHaveBeenCalled();
    expect(component.loader.moduleDetails).toBeFalsy();
  }));

  it('getColumnWithMetadata(), get the columns ... ', async(()=>{
    // mock data
    component.schemaId = '3242424';
    const array: ClassificationHeader[] = [{
      colId:'ATT1',
      order: 0
    } as ClassificationHeader];

    spyOn(schemaDetailService, 'getClassificationDatatableColumns').withArgs(component.schemaId,'MRO_CLS_MASTER_CHECK','BEARING','BALL').and.returnValue(of(array));

    spyOn(component, 'applyFilter');

    component.getColumnWithMetadata('MRO_CLS_MASTER_CHECK','BEARING','BALL');

    expect(component.applyFilter).toHaveBeenCalled();
    expect(schemaDetailService.getClassificationDatatableColumns).toHaveBeenCalledWith(component.schemaId,'MRO_CLS_MASTER_CHECK','BEARING','BALL');

    expect(component.displayedColumns.getValue()).toContain('ATT1');



  }));

  it('isMandatory(), isMandatory check ', async(()=>{
    const array: ClassificationHeader[] = [{
      colId:'ATT1',
      mandatory:true
    } as ClassificationHeader, {
      colId:'ATT2',
      mandatory:false
    } as ClassificationHeader];

    component.colsAndMetadata = array;
    expect(component.isMandatory('ATT1')).toBeTrue();
    expect(component.isMandatory('ATT2')).toBeFalse();

  }));

  it('_valid(), validate the attribute before send for desc generate ', async(()=>{

    const array: ClassificationHeader[] = [{
      colId:'ATT1',
      mandatory:true
    } as ClassificationHeader, {
      colId:'ATT2',
      fieldType: 'NUMERIC'
    } as ClassificationHeader];

    component.colsAndMetadata = array;

    const row = {1001:[
      {ATT1:{fieldValue:''}},
      {ATT2:{fieldValue:'weeeuuu2222'}}
    ]};

    const msgs = component._valid(row);
    expect(msgs).toBeNull();

  }));

  it('isAdmin(), should check if the user is admin', () => {

    component.userDetails = {
      currentRoleId: 'AD',
      userName: 'TESTUSER',
      plantCode: '0'
    } as Userdetails;

    component.schemaInfo  = {
      schemaId: 'schema1',
      runId:'889321',
      createdBy: 'TESTUSER',
      collaboratorModels: {
        isEditer: true,
        isAdmin: true,
        isApprover: true,
        isReviewer: true}
      } as SchemaListDetails;

    expect(component.isAdmin()).toEqual(true);

    component.userDetails.userName = 'DIFFERENT_USERNAME';
    expect(component.isAdmin()).toEqual(true);

    component.schemaInfo.collaboratorModels.isAdmin = false;
    expect(component.isAdmin()).toEqual(false);

    component.userDetails.userName = 'TESTUSER';
    expect(component.isAdmin()).toEqual(true);
  });

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
});
