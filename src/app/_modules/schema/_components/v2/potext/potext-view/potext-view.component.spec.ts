import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PotextViewComponent } from './potext-view.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FilterValuesComponent } from '@modules/shared/_components/filter-values/filter-values.component';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { AddFilterMenuComponent } from '@modules/shared/_components/add-filter-menu/add-filter-menu.component';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { BehaviorSubject, of } from 'rxjs';
import { SchemaListDetails, SchemaVariantsModel } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { FilterCriteria, MetadataModel, MetadataModeleResponse, RequestForSchemaDetailsWithBr, SchemaTableAction, STANDARD_TABLE_ACTIONS, TableActionViewType } from '@models/schema/schemadetailstable';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaDataSource } from '@modules/schema/_components/schema-details/schema-datatable/schema-data-source';
import { Router } from '@angular/router';
import { SimpleChanges } from '@angular/core';
import { Userdetails } from '@models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
describe('PotextViewComponent', () => {
  let component: PotextViewComponent;
  let fixture: ComponentFixture<PotextViewComponent>;
  let schemaListService: SchemalistService;
  let schemaService: SchemaService;
  let schemaVariantService: SchemaVariantService;
  let schemaDetailService: SchemaDetailsService;
  let sharedService: SharedServiceService;
  let router: Router;

  const mockSchemaDataSource = {
    docValue: jasmine.createSpy('docValue'),
    setDocValue: jasmine.createSpy('setDocValue'),
    getTableData: jasmine.createSpy('getTableData')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PotextViewComponent, FilterValuesComponent, SearchInputComponent, AddFilterMenuComponent ],
      imports:[
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule
      ],providers:[
        {
          provide: SchemaDataSource,
          useValue: mockSchemaDataSource
        }
      ]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PotextViewComponent);
    component = fixture.componentInstance;
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaVariantService = fixture.debugElement.injector.get(SchemaVariantService);
    schemaDetailService = fixture.debugElement.injector.get(SchemaDetailsService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    // fixture.detectChanges();

    component.schemaId = '274751';
    component.variantId = '0';
    component.moduleId = '1005';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSchemaDetails(), get schema details ', async(()=>{
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').withArgs(component.schemaId).and.returnValue(of({schemaId: component.schemaId} as SchemaListDetails));
    component.getSchemaDetails();
    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(component.schemaId);
  }));

  it('getSchemaStatics(), get schema statics .. ', async(()=>{

    spyOn(schemaService,'getSchemaThresholdStatics').withArgs(component.schemaId, component.variantId).and.returnValue(of());
    component.getSchemaStatics();
    expect(schemaService.getSchemaThresholdStatics).toHaveBeenCalledWith(component.schemaId, component.variantId);
  }));


  it('getVariantDetails(), get variant detaails ', async(()=>{
    component.userDetails = {
      userName: 'harshit',
      plantCode: '0',
      currentRoleId: 'AD'
    } as Userdetails
    spyOn(schemaVariantService,'getVariantdetailsByvariantId').withArgs(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName).and.returnValue(of({
      schemaId: component.schemaId,
      filterCriteria:[
        {
          fieldId: 'MATL_TYPE',
          type:'DROPDOWN',
          values:['67','2']
        } as FilterCriteria
      ]
    } as SchemaVariantsModel));

    component.getVariantDetails();
    expect(schemaVariantService.getVariantdetailsByvariantId).toHaveBeenCalledWith(component.variantId, component.userDetails.currentRoleId, component.userDetails.plantCode, component.userDetails.userName);
  }));

  it('getFldMetadata(), get field metadata ', async(()=>{
      spyOn(schemaDetailService,'getMetadataFields').withArgs(component.moduleId).and.returnValue(of());
      component.getFldMetadata();

      expect(schemaDetailService.getMetadataFields).toHaveBeenCalledWith(component.moduleId);
  }));

  it('loadDropValues(), load current field .. ', async(()=>{
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


  metadataFldLst.diw_15.picklist = '1';
  result = component.getFieldInputType('diw_15');
  expect(result).toEqual(component.FIELD_TYPE.SINGLE_SELECT);

  metadataFldLst.diw_15.isCheckList = 'true';
  result = component.getFieldInputType('diw_15');
  expect(result).toEqual(component.FIELD_TYPE.MULTI_SELECT);


  });

  it('generateCrossEntry() , generate cross module / create cross module ', async(()=>{
    // mock data
    const row = {
      OBJECTNUMBER:{
        fieldData:'TMP001'
      }
    }
    component.dataSource = new SchemaDataSource(schemaDetailService, null, component.schemaId, sharedService);
    spyOn(schemaDetailService, 'generateCrossEntry').withArgs(component.schemaId, component.moduleId, row.OBJECTNUMBER.fieldData, '').and.returnValue(of());
    component.generateCrossEntry(row);
    expect(schemaDetailService.generateCrossEntry).toHaveBeenCalledWith(component.schemaId, component.moduleId, row.OBJECTNUMBER.fieldData, '');
  }));

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

    expect(mockSchemaDataSource.getTableData).toBeTruthy();
  }));

  it('calculateDisplayFields(), calculate display fields based on user view', async(()=>{
    // mock data
    component.metadata.next({headers:{MATL_TYPE:{fieldId:'MATL_TYPE'}}} as MetadataModeleResponse);
    component.calculateDisplayFields();
    expect(component.calculateDisplayFields).toBeTruthy();
  }));


  it('changeTabStatus() , change the tab and get load data ', async(() =>{
    // mock data
    component.activeTab = 'error';
    const res = component.changeTabStatus('error');
    expect(res).toEqual(false);

    spyOn(router, 'navigate');
    component.metadata.next({headers:{MATL_TYPE:{fieldId:'MATL_TYPE'}}} as MetadataModeleResponse);
    component.dataSource = new SchemaDataSource(schemaDetailService, null, component.schemaId, sharedService);
    component.changeTabStatus('success');
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema/schema-details', component.moduleId, component.schemaId],{queryParams:{status:component.activeTab}} );

  }));

  it('openTableColumnSettings(), open table column setting ', async(()=>{
    spyOn(router, 'navigate');
    component.openTableColumnSettings();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: 'sb/schema/table-column-settings' }} ], {queryParamsHandling: 'preserve'});
  }));

  it('inlineSearch(), inline search ', async(()=>{
    // mock data
    component.filterCriteria = new BehaviorSubject<FilterCriteria[]>([{fieldId:'MATL_TYPE', type:'INLINE'} as FilterCriteria]);
    component.inlineSearch('mat');
    expect(component.inlineSearch).toBeTruthy();
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
      },varinatId:{
        currentValue:'0',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;

    component.ngOnChanges(changes);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('getDataScope(), should return all variants of a schema', async () => {
    component.schemaId = '1005';
    spyOn(schemaVariantService, 'getDataScope').withArgs(component.schemaId, 'RUNFOR').and.returnValue(of())
    component.getDataScope();
    expect(schemaVariantService.getDataScope).toHaveBeenCalledWith(component.schemaId, 'RUNFOR');
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

  it(`approveRecords(), approve corrected records `, async(()=>{
    // mock data
    const row = {OBJECTNUMBER:{fieldData:'MAT001'}};
    component.schemaId = '246726532';
    component.userDetails  = {currentRoleId:'123'} as Userdetails;

    spyOn(schemaDetailService,'approveCorrectedRecords').withArgs(component.schemaId, ['MAT001'] , component.userDetails.currentRoleId).and.returnValue(of({acknowledge:false}));

    component.approveRecords('inline', row);

    expect(schemaDetailService.approveCorrectedRecords).toHaveBeenCalledWith(component.schemaId, ['MAT001'] , component.userDetails.currentRoleId);
  }));

  it(`resetRec(), reset corrected records `, async(()=>{
    // mock data
    const row = {OBJECTNUMBER:{fieldData:'MAT001'}};
    component.schemaId = '246726532';
    component.schemaInfo  = {runId:'889321'} as SchemaListDetails;

    spyOn(schemaDetailService,'resetCorrectionRecords').withArgs(component.schemaId, component.schemaInfo.runId,  ['MAT001']).and.returnValue(of({acknowledge:false}));

    component.resetRec(row, 'inline');

    expect(schemaDetailService.resetCorrectionRecords).toHaveBeenCalledWith(component.schemaId, component.schemaInfo.runId,  ['MAT001']);
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
  });

  it('should filter primary and secondary actions', () => {
    expect(component.primaryActions.length).toEqual(2);
    expect(component.secondaryActions.length).toEqual(0);
  });

  // it('should do table action', () => {

  //   component.schemaInfo  = {schemaId: 'schema1', runId:'889321',
  //     collaboratorModels: {isReviewer: true} as SchemaDashboardPermission} as SchemaListDetails;

  //   spyOn(component, 'approveRecords');
  //   spyOn(component, 'resetRec');

  //   // component.doAction(component.tableActionsList[0], {});
  //   // expect(component.approveRecords).toHaveBeenCalledWith('inline', {});

  //   component.doAction(component.tableActionsList[1], {});
  //   expect(component.resetRec).toHaveBeenCalledWith({}, 'inline');
  // });

  it('should get all user selected fields based on default view ..', (async () => {
    component.metadata.next({headers:{MATL_TYPE:{fieldId:'MATL_TYPE'}}} as MetadataModeleResponse);
    component.selectedFields = null;

    const response = '7466345563';
    spyOn(schemaDetailService,'updateSchemaTableView').and.returnValue(of(response));

    component.ngOnInit();
    expect(schemaDetailService.updateSchemaTableView).toHaveBeenCalledTimes(1);
    expect(component.selectedFields.length).toEqual(1);
  }));

  it('should check if global actions are enabled', () => {
    expect(component.isGlobalActionsEnabled).toEqual(false);
  });

  it('should load more data on table scroll', async(() => {

    const scrollEvent = {
      target: {
        offsetHeight: 500,
        scrollHeight: 1000,
        scrollTop: 350
      }
    }

    spyOn(component, 'getData');

    component.onTableScroll(scrollEvent);

    expect(component.fetchCount).toEqual(1);
    expect(component.getData).toHaveBeenCalledWith(component.filterCriteria.getValue(), component.sortOrder, component.fetchCount, true);
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


});
