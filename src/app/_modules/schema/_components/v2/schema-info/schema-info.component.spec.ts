import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaInfoComponent } from './schema-info.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FilterValuesComponent } from '@modules/shared/_components/filter-values/filter-values.component';
import { AddFilterMenuComponent } from '@modules/shared/_components/add-filter-menu/add-filter-menu.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreSchemaBrInfo, DropDownValue, DuplicateRuleModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaListDetails, VariantDetails } from '@models/schema/schemalist';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of, throwError } from 'rxjs';
import { CategoryInfo, FilterCriteria } from '@models/schema/schemadetailstable';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { SchemaService } from '@services/home/schema.service';
import { AddFilterOutput } from '@models/schema/schema';
import { SchemaScheduler } from '@models/schema/schemaScheduler';
import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
import { ScheduleComponent } from '@modules/shared/_components/schedule/schedule.component';
import { DatePickerFieldComponent } from '@modules/shared/_components/date-picker-field/date-picker-field.component';
import { PermissionOn, RuleDependentOn, SchemaDashboardPermission } from '@models/collaborator';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { MatSliderChange } from '@angular/material/slider';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GlobaldialogService } from '@services/globaldialog.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { StaticsComponent } from '../statics/statics.component';
import { FormControl, FormGroup } from '@angular/forms';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

describe('SchemaInfoComponent', () => {
  let component: SchemaInfoComponent;
  let fixture: ComponentFixture<SchemaInfoComponent>;
  let router: Router;
  let schemaDetailsService: SchemaDetailsService;
  let schemaVariantService: SchemaVariantService;
  let schemaService: SchemaService;
  let schemaListService: SchemalistService;
  let sharedService: SharedServiceService;
  let globalDialogService: GlobaldialogService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SchemaInfoComponent,
        FilterValuesComponent,
        AddFilterMenuComponent,
        FormInputComponent,
        ScheduleComponent,
        DatePickerFieldComponent,
        StaticsComponent,
        SkeletonLoaderComponent
      ],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          GlobaldialogService,
          useValue: { params: of({ moduleId: '1005', schemaId: '123' }) },
        },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaInfoComponent);
    component = fixture.componentInstance;
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    schemaVariantService = fixture.debugElement.injector.get(SchemaVariantService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getAllCategoryInfo(), should get all categories of business rules', async () => {
    spyOn(schemaDetailsService, 'getAllCategoryInfo').and.returnValue(of({} as CategoryInfo[]));
    component.getAllCategoryInfo();
    expect(schemaDetailsService.getAllCategoryInfo).toHaveBeenCalled();
  });

  it('getSchemaVariants(), should return all variants of a schema', async () => {
    component.schemaId = '1005';
    spyOn(schemaVariantService, 'getAllDataScopeList')
      .withArgs(component.schemaId, 'RUNFOR')
      .and.returnValues(of([]), throwError({ status: 404 }));
    component.getSchemaVariants(component.schemaId, 'RUNFOR');
    component.getSchemaVariants(component.schemaId, 'RUNFOR');
    expect(schemaVariantService.getAllDataScopeList).toHaveBeenCalledWith(component.schemaId, 'RUNFOR');
  });

  it('getBusinessRuleList(), should get business rule list of schema', async () => {
    const returnData = [
      {
        brWeightage: '46',
      },
      {
        brWeightage: '33',
      },
    ] as CoreSchemaBrInfo[];
    spyOn(schemaService, 'getBusinessRulesBySchemaId').withArgs(component.schemaId).and.returnValue(of(returnData));
    component.getBusinessRuleList(component.schemaId);
    expect(schemaService.getBusinessRulesBySchemaId).toHaveBeenCalledWith(component.schemaId);
  });

  it('shortName(), should return initals', () => {
    let fName = 'Ashish';
    let lName = 'Goyal';
    let initials = component.shortName(fName, lName);
    expect(initials).toEqual('AG');

    fName = 'Ashish';
    lName = '';
    initials = component.shortName(fName, lName);
    expect(initials).toEqual('');
  });

  it('openSubscriberSideSheet(), should open the subscriber side sheet', async () => {
    component.moduleId = '1005';
    component.schemaId = '5642587452';
    component.outlet = 'sb';
    spyOn(router, 'navigate');
    component.openSubscriberSideSheet();

    expect(router.navigate).toHaveBeenCalledWith([
      '',
      { outlets: { sb: `sb/schema/subscriber/${component.moduleId}/${component.schemaId}/new/${component.outlet}` } },
    ]);
  });

  it('openBusinessRuleSideSheet(), should open the Business rule side sheet', async () => {
    component.moduleId = '1005';
    component.schemaId = '5642587452';
    spyOn(router, 'navigate');
    component.openBusinessRuleSideSheet();

    expect(router.navigate).toHaveBeenCalledWith([
      '',
      { outlets: { sb: `sb/schema/business-rule/${component.moduleId}/${component.schemaId}/new` } },
    ]);
  });

  it('updateCategory(), should update category of business rule', async () => {
    const cat = {
      categoryId: '985',
      categoryDesc: 'Category_1',
    } as CategoryInfo;

    const br = {
      brIdStr: '36572',
      brInfo: 'Missing Rule',
      brType: 'Meta data',
      fields: 'NDC',
      message: 'Test should passed..',
      moduleId: '1005',
      isCopied: false,
      brWeightage: '19',
      status: '1',
      dependantStatus: 'SUCCESS',
      order: 1,
    } as CoreSchemaBrInfo;

    component.schemaId = '44514235';
    component.moduleId = '1004';

    const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    request.brId = br.brIdStr;
    request.schemaId = component.schemaId;
    request.categoryId = cat.categoryId;
    request.brInfo = br.brInfo;
    request.brType = br.brType;
    request.fields = br.fields;
    request.message = br.message;
    request.moduleId = component.moduleId;
    request.isCopied = br.isCopied;
    request.brWeightage = br.brWeightage;
    request.status = br.status;
    request.dependantStatus = br.dependantStatus;
    request.order = br.order;

    spyOn(schemaService, 'createBusinessRule')
      .withArgs(request)
      .and.returnValue(of({} as CoreSchemaBrInfo));
    component.updateCategory(cat, br);
    expect(schemaService.createBusinessRule).toHaveBeenCalledWith(request);
    // Test case scenerio for duplicate branch
    const brDupList = [];
    const brDup = {
      brIdStr: '36572',
      brInfo: 'Missing Rule',
      brType: 'BR_DUPLICATE_CHECK',
      fields: 'NDC',
      message: 'Test should passed..',
      moduleId: '1005',
      isCopied: false,
      duplicacyField: [{ fieldId: 'Test' }],
      duplicacyMaster: [],
      brWeightage: '19',
      status: '1',
      dependantStatus: 'SUCCESS',
      order: 1,
    } as CoreSchemaBrInfo;
    brDupList.push(brDup);

    const requestDup: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    requestDup.brId = brDup.brIdStr;
    requestDup.schemaId = component.schemaId;
    requestDup.categoryId = cat.categoryId;
    requestDup.brInfo = brDup.brInfo;
    requestDup.brType = brDup.brType;
    requestDup.fields = brDup.fields;
    requestDup.message = brDup.message;
    requestDup.moduleId = component.moduleId;
    requestDup.isCopied = brDup.isCopied;
    requestDup.brWeightage = br.brWeightage;
    requestDup.status = br.status;
    requestDup.dependantStatus = br.dependantStatus;
    requestDup.order = br.order;

    const params = { objectId: component.moduleId, autoMerge: '', groupId: '' };
    const model = new DuplicateRuleModel();
    model.coreBrInfo = { ...requestDup };
    model.addFields = brDup.duplicacyField;
    model.addFields[0].fId = model.addFields[0].fieldId;
    model.mergeRules = brDup.duplicacyMaster;
    model.removeList = [];
    spyOn(schemaService, 'getBusinessRulesBySchemaId').withArgs(component.schemaId).and.returnValue(of(brDupList));
    spyOn(schemaService, 'saveUpdateDuplicateRule')
      .withArgs(model, params)
      .and.returnValue(of({} as any));
    component.updateCategory(cat, brDup);
    expect(schemaService.saveUpdateDuplicateRule).toHaveBeenCalledWith(model, params);
  });

  it('updateFragment(), should update tab selection', async () => {
    component.moduleId = '1005';
    component.schemaId = '5642785215';
    let tabLabel = 'business-rules';

    spyOn(router, 'navigate');
    component.updateFragment(tabLabel);
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema/schema-info', component.moduleId, component.schemaId], {
      queryParams: { fragment: tabLabel },
    });
    expect(component.selectedIndex).toEqual(1);

    tabLabel = 'subscribers';
    component.updateFragment(tabLabel);
    expect(component.selectedIndex).toEqual(2);

    tabLabel = 'execution-logs';
    component.updateFragment(tabLabel);
    expect(component.selectedIndex).toEqual(3);

    component.selectedIndex = 0;
    tabLabel = '';
    component.updateFragment(tabLabel);
    expect(component.selectedIndex).toEqual(0);

    component.infoTabs = ['business-rules'];
    component.updateFragmentByIndex(0);
    expect(component.selectedIndex).toEqual(1);
  });

  it('editBr(), should open side sheet of business rules', async () => {
    component.moduleId = '1005';
    component.schemaId = '2563145';

    const br = {
      brIdStr: '2356',
    } as CoreSchemaBrInfo;
    spyOn(router, 'navigate');
    component.editBr(br);

    expect(router.navigate).toHaveBeenCalledWith([
      '',
      { outlets: { sb: `sb/schema/business-rule/${component.moduleId}/${component.schemaId}/${br.brIdStr}` } },
    ]);
  });

  it('addDataScope(), should navigate to add datascope side sheet', () => {
    component.moduleId = '1005';
    component.schemaId = '2563145';
    spyOn(router, 'navigate');
    component.addDataScope();
    expect(router.navigate).toHaveBeenCalledWith([
      { outlets: { sb: `sb/schema/data-scope/${component.moduleId}/${component.schemaId}/new/sb` } },
    ]);
  });

  it('openSummarySideSheet(), should navigate to schema summary side sheet', () => {
    component.moduleId = '1005';
    component.schemaId = '2563145';

    spyOn(router, 'navigate');
    component.openSummarySideSheet();
    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/schema/check-data/${component.moduleId}/${component.schemaId}` } }],
      { queryParams: { isCheckData: true } }
    );
  });

  it('editSubscriberInfo(), should open edit subscriber sidesheet', async () => {
    const sNo = 2345667;
    spyOn(router, 'navigate');
    component.editSubscriberInfo(sNo);
    expect(router.navigate).toHaveBeenCalledWith([
      { outlets: { sb: `sb/schema/subscriber/${component.moduleId}/${component.schemaId}/${sNo}` } },
    ]);
  });

  it('prepateTextToShow(), should prepare text to show over mat-chips', async () => {
    let ctrl = {
      fieldId: 'MATL_TYPE',
      values: ['USA Region', 'Asia Region'],
    } as FilterCriteria;
    let result = component.prepareTextToShow(ctrl);
    expect(result).toEqual('2');

    ctrl = {
      fieldId: 'MATL_TYPE',
      values: ['USA_Region'],
      textValues: ['USA data scope'],
      selectedValues: [
        {
          CODE: 'xyz',
          TEXT: 'Data scope from API',
          LANGU: 'English',
        },
      ],
    } as FilterCriteria;
    result = component.prepareTextToShow(ctrl);
    expect(result).toEqual('USA data scope');

    ctrl = {
      fieldId: 'MATL_TYPE',
      values: ['USA_Region'],
      selectedValues: [
        {
          CODE: 'USA_Region',
          TEXT: 'Data scope from API',
          LANGU: 'English',
        },
      ],
    } as FilterCriteria;
    result = component.prepareTextToShow(ctrl);
    expect(result).toEqual('Data scope from API');
  });

  it('loadDropValues(), should load dropdown values of selected filters', async () => {
    const fldc: FilterCriteria = {
      fieldId: 'MaterialType',
      values: ['123', '456'],
      type: 'DROPDOWN',
      filterCtrl: {
        selectedValues: [
          {
            CODE: 'ABC',
            FIELDNAME: 'MaterialType',
          } as DropDownValue,
        ],
      } as AddFilterOutput,
    };

    component.loadDropValues(null);
    expect(component.loadDopValuesFor).toBeFalsy();

    component.loadDropValues(fldc);
    expect(component.loadDopValuesFor.checkedValue.length).toEqual(2);
  });

  it('availableWeightage(), should return max avail weightage', async () => {
    const weightage = '46';
    component.businessRuleData = [
      {
        brWeightage: '46',
      },
      {
        brWeightage: '33',
      },
    ] as CoreSchemaBrInfo[];
    const result = component.availableWeightage(weightage);
    expect(result).toEqual(67);
  });

  it('openScheduleSideSheet(), should open schedule component in side sheet', async () => {
    component.schemaId = '2452141452';
    const scheduleId = '323344';
    spyOn(router, 'navigate');
    component.openScheduleSideSheet(scheduleId);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/schedule/${component.schemaId}/${scheduleId}` } }]);

    component.openScheduleSideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/schedule/${component.schemaId}/new` } }]);
  });

  it('getScheduleInfo(), should get schedule info', async () => {
    component.schemaId = '2452141452';

    spyOn(schemaService, 'getSchedule').and.returnValues(of(null), of({} as SchemaScheduler));
    component.getScheduleInfo(component.schemaId);
    expect(component.canEditSchedule).toBeFalse();

    component.getScheduleInfo(component.schemaId);
    expect(component.canEditSchedule).toBeTrue();
  });

  it('toggleScheduleState(), should toggle state of schedule', async () => {
    component.scheduleInfo = {
      isEnable: false,
    } as SchemaScheduler;
    component.schemaId = '2561141';
    spyOn(schemaService, 'createUpdateSchedule').and.returnValue(of(1));
    component.toggleScheduleState();
    expect(component.scheduleInfo.isEnable).toEqual(true);
    expect(schemaService.createUpdateSchedule).toHaveBeenCalledWith(component.schemaId, component.scheduleInfo);
  });

  it('editDataScope(), should open data scope side sheet in edit mode', async () => {
    component.moduleId = '1005';
    component.schemaId = '12550524553';
    const variantId = '125A';
    spyOn(router, 'navigate');
    component.editDataScope(variantId);
    expect(router.navigate).toHaveBeenCalledWith([
      { outlets: { sb: `sb/schema/data-scope/${component.moduleId}/${component.schemaId}/${variantId}/sb` } },
    ]);
  });

  it('getAllBusinessRulesList(), should get all business rules', async () => {
    spyOn(schemaService, 'getBusinessRulesByModuleId').and.returnValues(of([]), of([{ brId: '1' }, { brId: '2' }] as CoreSchemaBrInfo[]));
    component.moduleId = '1004';
    component.getAllBusinessRulesList(component.moduleId, '', '');
    expect(component.allBusinessRulesList.length).toEqual(0);

    component.getAllBusinessRulesList(component.moduleId, '', '', true);
    expect(component.allBusinessRulesList.length).toEqual(2);

    expect(schemaService.getBusinessRulesByModuleId).toHaveBeenCalledTimes(2);
  });

  it('getCollaborators(), should get all subscribers', async () => {
    spyOn(schemaDetailsService, 'getAllUserDetails').and.returnValues(
      of({} as PermissionOn),
      of({ users: [{ userId: 'bilel' }] } as PermissionOn)
    );
    component.getCollaborators('', 0);
    component.getCollaborators('', 0);
    expect(schemaDetailsService.getAllUserDetails).toHaveBeenCalledTimes(2);
    expect(component.allSubscribers.length).toEqual(1);
  });

  it('openBrLibrarySideSheet(), should navigate to business rule library side sheet', () => {
    component.moduleId = '1004';
    component.schemaId = '2145214';
    component.outlet = 'sb';
    spyOn(router, 'navigate');
    component.openBrLibrarySideSheet();
    expect(router.navigate).toHaveBeenCalledWith([
      { outlets: { sb: `sb/schema/businessrule-library/${component.moduleId}/${component.schemaId}/${component.outlet}` } },
    ]);
  });

  it('addBusinessRule(), should add business rule from auto-complete', async (done) => {
    const brInfo = {
      brIdStr: '2452',
      brType: 'Meta Data',
      brInfo: 'Missing data',
      fields: 'Region',
      message: 'Region should be Asia',
      isCopied: true,
    } as CoreSchemaBrInfo;
    brInfo.brWeightage = '45';
    brInfo.accuracyScore = 23;
    brInfo.categoryId = 'TEST';
    brInfo.apiKey = '1234';
    brInfo.target_field = 'EPO';
    brInfo.source_field = 'SOP';
    component.schemaId = '245521';
    component.moduleId = '1005';

    const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();

    request.brId = '';
    request.schemaId = component.schemaId;
    request.brInfo = brInfo.brInfo;
    request.brType = brInfo.brType;
    request.fields = brInfo.fields;
    request.message = brInfo.message;
    request.isCopied = brInfo.isCopied;
    request.moduleId = component.moduleId;
    request.copiedFrom = brInfo.brIdStr;
    request.brWeightage = '0';
    request.accuracyScore = brInfo.accuracyScore;
    request.categoryId = brInfo.categoryId;
    request.apiKey = brInfo.apiKey;
    request.target_field = brInfo.target_field;
    request.source_field = brInfo.source_field;

    component.businessRuleData = [
      {
        brId: '2123243',
        brIdStr: '212343',
      },
    ] as CoreSchemaBrInfo[];
    spyOn(schemaDetailsService, 'getSchemaBrInfoList').and.returnValue(of([]));

    spyOn(component, 'getBusinessRuleList');
    spyOn(schemaService, 'createBusinessRule').withArgs(request).and.returnValue(of(brInfo));
    await component.addBusinessRule(brInfo);

    component.businessRuleData[0].brIdStr = '2452';
    await component.addBusinessRule(brInfo);

    expect(schemaService.createBusinessRule).toHaveBeenCalledTimes(1);
    // scenerio for duplicate branch
    const brInfoDup = {
      brIdStr: '24521',
      brType: 'BR_DUPLICATE_CHECK',
      brInfo: 'Missing data',
      fields: 'Region',
      message: 'Region should be Asia',
      isCopied: true,
    } as CoreSchemaBrInfo;
    brInfoDup.brWeightage = '45';
    brInfoDup.accuracyScore = 23;
    brInfoDup.categoryId = 'TEST';
    brInfoDup.apiKey = '1234';
    brInfoDup.target_field = 'EPO';
    brInfoDup.source_field = 'SOP';

    const requestDup: CoreSchemaBrInfo = new CoreSchemaBrInfo();

    requestDup.brId = '';
    requestDup.schemaId = component.schemaId;
    requestDup.brInfo = brInfoDup.brInfo;
    requestDup.brType = brInfoDup.brType;
    requestDup.fields = brInfoDup.fields;
    requestDup.message = brInfoDup.message;
    requestDup.isCopied = brInfoDup.isCopied;
    requestDup.moduleId = component.moduleId;
    requestDup.copiedFrom = brInfoDup.brIdStr;
    requestDup.brWeightage = '0';
    requestDup.accuracyScore = brInfoDup.accuracyScore;
    requestDup.categoryId = brInfoDup.categoryId;
    requestDup.apiKey = brInfoDup.apiKey;
    requestDup.target_field = brInfoDup.target_field;
    requestDup.source_field = brInfoDup.source_field;

    spyOn(schemaService, 'copyDuplicateRule').withArgs(requestDup).and.returnValue(of(brInfoDup));
    await component.addBusinessRule(brInfoDup);

    component.businessRuleData[0].brIdStr = '24521';
    await component.addBusinessRule(brInfoDup);

    expect(schemaService.copyDuplicateRule).toHaveBeenCalledTimes(1);
    done();
  });

  it('getSchemaDetails(), should get schema details', async () => {
    component.schemaId = '12545';
    component.schemaSummaryForm = new FormGroup({ schemaThreshold: new FormControl() });
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId')
      .withArgs(component.schemaId)
      .and.returnValues(of({} as SchemaListDetails), throwError({ status: 404 }));
    component.getSchemaDetails(component.schemaId);
    component.getSchemaDetails(component.schemaId);
    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(component.schemaId);

    // component.schemaId = '1005';
    // spyOn(schemaVariantService, 'getAllDataScopeList').withArgs(component.schemaId, 'RUNFOR').and.returnValues(of([]), throwError({status: 404}));
    // component.getSchemaVariants(component.schemaId, 'RUNFOR');
    // component.getSchemaVariants(component.schemaId, 'RUNFOR');
    // expect(schemaVariantService.getAllDataScopeList).toHaveBeenCalledWith(component.schemaId, 'RUNFOR');
  });

  it('updateRole(), should update role of subscriber', async () => {
    component.schemaId = '125556221415';
    const subscriber = {
      isAdmin: false,
      isViewer: true,
      isReviewer: false,
      isEditer: false,
      schemaId: component.schemaId,
      permissionType: 'USER',
      sno: '22551',
      userid: 'ASHSH',
    } as SchemaDashboardPermission;
    const role = 'isAdmin';
    spyOn(schemaDetailsService, 'createUpdateUserDetails')
      .withArgs(Array(subscriber))
      .and.returnValue(of([22551]));
    spyOn(component, 'getSubscriberList');

    component.updateRole(subscriber, role);
    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledWith(Array(subscriber));
  });

  it(`To get FormControl from fromGroup `, async(() => {
    component.initializeSummaryForm();
    const field = component.schemaField('schemaName');
    expect(field).toBeDefined();
  }));

  it('should init component', () => {
    spyOn(component, 'getSchemaDetails');
    spyOn(component, 'getSubscriberList');
    spyOn(component, 'getBusinessRuleList');
    spyOn(component, 'getSchemaVariants');
    spyOn(component, 'getAllBusinessRulesList');
    spyOn(component, 'getCollaborators');
    spyOn(component, 'getScheduleInfo');
    spyOn(component, 'getAllCategoryInfo');

    component.ngOnInit();
    expect(component.moduleId).toEqual('1005');

    sharedService.setAfterBrSave({});
    expect(component.getBusinessRuleList).toHaveBeenCalledTimes(2);

    sharedService.setAfterSubscriberSave({});
    expect(component.getSubscriberList).toHaveBeenCalledTimes(2);

    sharedService.setScheduleInfo({});
    expect(component.getScheduleInfo).toHaveBeenCalledTimes(2);

    sharedService.setDataScope(null);
    sharedService.setDataScope({});
    expect(component.getSchemaVariants).toHaveBeenCalledTimes(2);
  });

  it('should open delete variant confirm', () => {
    spyOn(globalDialogService, 'confirm').and.callFake((a, b) => b('yes'));
    component.deleteVariant('123');
    expect(globalDialogService.confirm).toHaveBeenCalled();
  });

  it('should deleteVariantAfterConfirm', () => {
    spyOn(schemaVariantService, 'deleteVariant').and.returnValues(of(false), of(true));
    spyOn(component, 'getSchemaVariants');

    component.deleteVariantAfterConfirm('no', '1701');

    component.deleteVariantAfterConfirm('yes', '1701');
    component.deleteVariantAfterConfirm('yes', '1701');

    expect(component.getSchemaVariants).toHaveBeenCalledTimes(1);
    expect(schemaVariantService.deleteVariant).toHaveBeenCalledTimes(2);
  });

  it('should addSubscriber', () => {
    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValues(of(null), of([123]), of());
    spyOn(component, 'getSubscriberList');
    const subscriberInfo = { userName: 'admin' };

    component.addSubscriber(subscriberInfo);
    component.addSubscriber(subscriberInfo);
    expect(component.getSubscriberList).toHaveBeenCalledTimes(1);

    component.subscriberData = [{ userid: 'admin' }] as SchemaDashboardPermission[];
    component.addSubscriber(subscriberInfo);

    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(2);
  });

  it('should getSubscriberList', () => {
    const data = [
      { userid: 'admin', filterCriteria: [{ fieldId: 'mtl_grp', type: 'DROPDOWN', values: ['1701'] }] },
    ] as SchemaDashboardPermission[];

    const schemaSpy = spyOn(schemaDetailsService, 'getCollaboratorDetails').and.returnValue(of(data));

    component.getSubscriberList('123');
    expect(component.subscriberData.length).toEqual(1);
    schemaSpy.and.returnValue(throwError({ message: 'error' }));

    component.getSubscriberList('123');
    expect(schemaDetailsService.getCollaboratorDetails).toHaveBeenCalled();
  });

  it('should updateBr', () => {
    spyOn(schemaService, 'updateBrMap').and.returnValues(of(false), of(true), of(false), of(false));
    spyOn(component, 'getBusinessRuleList');

    const br = new CoreSchemaBrInfo();

    const sliderEvent = new MatSliderChange();
    sliderEvent.value = 25;
    component.updateBr(br, sliderEvent, 'slider');

    const checkboxEvent = new MatCheckboxChange();
    checkboxEvent.checked = true;
    component.updateBr(br, checkboxEvent, 'checkbox');

    checkboxEvent.checked = false;
    component.updateBr(br, checkboxEvent);

    const event = {};
    component.updateBr(br, event);

    expect(component.getBusinessRuleList).toHaveBeenCalledTimes(1);
  });

  //  it('should updateBrOrder', () => {

  //   spyOn(schemaService, 'updateBrMap').and.returnValues(of(false), of(true));
  //   spyOn(component, 'getBusinessRuleList');

  //   let br = {brIdStr: '123', brWeightage: '20'} as CoreSchemaBrInfo;
  //   component.updateBrOrder(null, 2);
  //   component.updateBrOrder(br, 2);
  //   component.updateBrOrder(br, 2);
  //   expect(component.getBusinessRuleList).toHaveBeenCalled();
  //   br = {brIdStr: '123', brWeightage: '20', status: 'test'} as CoreSchemaBrInfo;
  //   component.updateBrOrder(br, 2);
  //   expect(component.getBusinessRuleList).toHaveBeenCalled();

  //  });

  it('should get current br status', () => {
    let status = component.getCurrentBrStatus('');
    expect(status).toEqual('ALL');
    status = component.getCurrentBrStatus('TEST');
    expect(status).toEqual('TEST');
  });

  //  it('should get Business Rules', () => {
  //   component.businessRuleData = [{
  //     dep_rules: [{}, {}]
  //   }, {
  //     dep_rules: [{}, {}, {}]
  //   }] as Array<CoreSchemaBrInfo>;
  //   const length = component.getBusinessRulesLength;
  //   expect(length).toEqual(7);
  //  });

  it('should open deleteBr confirm', () => {
    component.businessRuleData = [
      {
        brId: '23542',
      },
      {
        brId: '12345',
      },
    ] as CoreSchemaBrInfo[];
    const br = {
      brId: '12345',
    } as CoreSchemaBrInfo;
    spyOn(globalDialogService, 'confirm');
    component.deleteBr(br);
    expect(globalDialogService.confirm).toHaveBeenCalled();
  });

  it('should deleteBrAfterConfirm', () => {
    spyOn(schemaService, 'deleteBr').and.returnValue(of(true));
    spyOn(component, 'getBusinessRuleList');

    const br = new CoreSchemaBrInfo();

    component.deleteBrAfterConfirm('no', br);
    component.deleteBrAfterConfirm('yes', br);

    br.brIdStr = '123';
    component.deleteBrAfterConfirm('yes', br);

    expect(schemaService.deleteBr).toHaveBeenCalledTimes(1);
  });

  it('should open deleteSubscriber confirm', () => {
    spyOn(globalDialogService, 'confirm');
    component.deleteSubscriber('1701');
    expect(globalDialogService.confirm).toHaveBeenCalled();
  });

  it('should deleteSubsAfterConfirm', () => {
    spyOn(schemaDetailsService, 'deleteCollaborator').and.returnValue(of(true));
    spyOn(component, 'getSubscriberList');

    component.deleteSubsAfterConfirm('no', '1701');
    component.deleteSubsAfterConfirm('yes', '1701');

    expect(schemaDetailsService.deleteCollaborator).toHaveBeenCalledTimes(1);
  });

  it('should updateSubscriberInfo', () => {
    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of([123]));
    spyOn(component, 'getSubscriberList');

    component.subscriberData = [
      { userid: 'admin', sno: 1, filterCriteria: [] },
      { userid: 'user', sno: 2 },
    ] as SchemaDashboardPermission[];
    component.updateSubscriberInfo(1, [{ fieldId: 'mtl_grp', type: 'DROPDOWN', values: ['1701'] }]);

    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(1);
  });

  it('should updateSchemaInfo', () => {
    spyOn(schemaService, 'createUpdateSchema').and.returnValue(of('success'));
    spyOn(component, 'getSchemaDetails');

    component.schemaDetails = { schemaDescription: 'desc' } as SchemaListDetails;

    component.updateSchemaInfo('desc');

    component.updateSchemaInfo('updated desc');

    component.updateSchemaInfo('updated desc', { value: 15 });

    expect(schemaService.createUpdateSchema).toHaveBeenCalledTimes(2);
  });

  it('should deleteSchema', () => {
    spyOn(router, 'navigate');
    spyOn(schemaService, 'deleteSChema').and.returnValue(of(true));
    spyOn(globalDialogService, 'confirm').and.callFake((a, b) => b('yes'));
    component.deleteSchema();
    expect(schemaService.deleteSChema).toHaveBeenCalled();
  });

  it('should makeFilterControl', () => {
    spyOn(component, 'updateSubscriberInfo');
    spyOn(component, 'getSubscriberList');
    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of([1]));

    const event = { selectedValues: [{ CODE: 'USA' }], fldCtrl: { fieldId: 'region' }, fieldId: 'region' } as AddFilterOutput;

    component.subscriberData = [{ sno: 1, userid: 'admin', filterCriteria: [] }] as SchemaDashboardPermission[];
    component.makeFilterControl(event, 1);
    expect(component.updateSubscriberInfo).toHaveBeenCalled();

    component.subscriberData[0].filterCriteria = [
      { fieldId: 'region', type: 'DROPDOWN', values: ['Asia'] },
      { fieldId: 'mtl_grp', type: 'DROPDOWN', values: ['1701'] },
    ];
    component.subscriberData.push({ sno: 2 } as SchemaDashboardPermission);
    component.makeFilterControl(event, 1);
    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(1);
  });

  it('should removeAppliedFilter', () => {
    spyOn(component, 'getSubscriberList');
    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of([1]));

    const criteria = { fieldId: 'region', values: [''], type: 'DROPDOWN' } as FilterCriteria;

    component.subscriberData = [
      { sno: 1, filterCriteria: [{ fieldId: 'region' }, { fieldId: 'mtl_grp' }, { fieldId: 'status' }] },
      { sno: 2, filterCriteria: [] },
    ] as SchemaDashboardPermission[];

    component.removeAppliedFilter(criteria, 1);

    expect(component.subscriberData[0].filterCriteria.length).toEqual(2);
    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(1);
  });

  it('should fetchSelectedValues', () => {
    spyOn(component, 'getSubscriberList');
    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of([1]));

    component.fetchSelectedValues([], 1);

    const seletectedValues = [{ fieldId: 'region', CODE: 'region', FIELDNAME: 'region' }];

    component.subscriberData = [
      { sno: 1, filterCriteria: [{ fieldId: 'region', values: [] }, { fieldId: 'mtl_grp' }] },
      { sno: 2, filterCriteria: [] },
    ] as SchemaDashboardPermission[];

    component.fetchSelectedValues(seletectedValues, 1);

    expect(component.subscriberData[0].filterCriteria[0].values.length).toEqual(1);
    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(1);
  });

  it('should drop()', () => {
    const event = { item: { data: null }, previousContainer: { id: '1' }, container: { id: '2' } } as CdkDragDrop<any>;
    component.drop(event);
    expect(event.container.data).toBeFalsy();
  });

  it('updateDepRule() updateDepRule', async () => {
    component.businessRuleData = [
      {
        sno: 101,
        brId: '22',
        brIdStr: '23',
        brType: 'TRANSFORMATION',
        refId: 1,
        fields: '',
        regex: '',
        order: 1,
        apiKey: '',
        message: 'Invalid',
        script: '',
      } as CoreSchemaBrInfo,
      {
        sno: 1299484,
        brId: '22',
        brIdStr: '22',
        brType: 'TRANSFORMATION',
        dep_rules: [],
      } as CoreSchemaBrInfo,
    ];
    const br = {
      sno: 1299484,
      brId: '22',
      brIdStr: '22',
      brType: 'TRANSFORMATION',
      dep_rules: [],
    } as CoreSchemaBrInfo;
    const event = RuleDependentOn.SUCCESS;
    component.updateDepRule(br, event);
    expect(component.businessRuleData.length).toEqual(1);

    component.businessRuleData = [
      {
        sno: 101,
        brId: '22',
        brIdStr: '23',
        brType: 'TRANSFORMATION',
        refId: 1,
        fields: '',
        regex: '',
        order: 1,
        apiKey: '',
        message: 'Invalid',
        script: '',
        dep_rules: [
          {
            sno: 1299484,
            brId: '22',
            brIdStr: '25',
            brType: 'TRANSFORMATION',
            dep_rules: [],
          } as CoreSchemaBrInfo,
        ],
      } as CoreSchemaBrInfo,
      {
        sno: 1299484,
        brId: '22',
        brIdStr: '22',
        brType: 'TRANSFORMATION',
        dep_rules: [
          {
            sno: 1299484,
            brId: '22',
            brIdStr: '22',
            brType: 'TRANSFORMATION',
            dependantStatus: 'SUCCESS',
          },
        ],
      } as CoreSchemaBrInfo,
    ];
    component.updateDepRule(br, event);
    expect(component.businessRuleData.length).toEqual(1);
  });

  it('updateDepRuleForChild() updateDepRuleForChild', async () => {
    component.businessRuleData = [
      {
        sno: 101,
        brId: '22',
        brIdStr: '23',
        brType: 'TRANSFORMATION',
        refId: 1,
        fields: '',
        regex: '',
        order: 1,
        apiKey: '',
        message: 'Invalid',
        script: '',
      } as CoreSchemaBrInfo,
      {
        sno: 1299484,
        brId: '22',
        brIdStr: '22',
        brType: 'TRANSFORMATION',
        dep_rules: [],
      } as CoreSchemaBrInfo,
    ];
    const br = {
      sno: 1299484,
      brId: '22',
      brIdStr: '22',
      brType: 'TRANSFORMATION',
      dep_rules: [],
    } as CoreSchemaBrInfo;
    const event = RuleDependentOn.ALL;
    component.updateDepRule(br, event);
    expect(component.businessRuleData.length).toEqual(2);

    component.businessRuleData = [
      {
        sno: 101,
        brId: '22',
        brIdStr: '23',
        brType: 'TRANSFORMATION',
        refId: 1,
        fields: '',
        regex: '',
        order: 1,
        apiKey: '',
        message: 'Invalid',
        script: '',
        dep_rules: [
          {
            sno: 1299484,
            brId: '22',
            brIdStr: '25',
            brType: 'TRANSFORMATION',
            dep_rules: [],
          } as CoreSchemaBrInfo,
        ],
      } as CoreSchemaBrInfo,
      {
        sno: 1299484,
        brId: '22',
        brIdStr: '22',
        brType: 'TRANSFORMATION',
        dep_rules: [
          {
            sno: 1299484,
            brId: '22',
            brIdStr: '22',
            brType: 'TRANSFORMATION',
            dependantStatus: 'SUCCESS',
          },
        ],
      } as CoreSchemaBrInfo,
    ];
    component.updateDepRuleForChild(br, 0, event);
    expect(component.businessRuleData.length).toEqual(3);
  });

  it('getModuleInfo(), should get module info', async(() => {
    component.schemaDetails = new SchemaListDetails();
    spyOn(schemaService, 'getModuleInfoByModuleId').and.returnValues(
      of([{ moduleDesc: 'Test', moduleId: '1005' }]),
      throwError({ message: 'api error' })
    );
    component.getModuleInfo();
    component.getModuleInfo();
    expect(schemaService.getModuleInfoByModuleId).toHaveBeenCalled();
  }));

  it('getModuleInfo(), should get module info', async(() => {
    component.schemaDetails = new SchemaListDetails();
    spyOn(schemaService, 'getModuleInfoByModuleId').and.returnValues(of([]), throwError({ message: 'api error' }));
    component.getModuleInfo();
    component.getModuleInfo();
    expect(schemaService.getModuleInfoByModuleId).toHaveBeenCalled();
  }));

  it('getCurrentBrStatusObj(), should get current br status info', async(() => {
    component.depRuleList = [
      {
        key: 'all',
        value: 'ALL',
      },
      {
        key: 'success',
        value: 'SUCCESS',
      },
    ];
    expect(component.getCurrentBrStatusObj('').key).toEqual('all');
    expect(component.getCurrentBrStatusObj('All').key).toEqual('all');
    expect(component.getCurrentBrStatusObj('success').key).toEqual('success');
  }));

  it('getStatusIcon(), should return an icon object', () => {
    component.initializeSummaryForm();
    component.schemaSummaryForm.controls.schemaName.setValue('test');
    component.schemaSummaryForm.controls.schemaName.markAsTouched();

    let res = component.getStatusIcon('schemaName', { loading: false, error: false });
    expect(res).toEqual({
      icon: 'check',
      font: '',
      type: 'success',
    });

    res = component.getStatusIcon('schemaName', { loading: true, error: false });
    expect(res).toEqual({
      icon: 'clock',
      font: '',
      type: '',
    });

    res = component.getStatusIcon('schemaName', { loading: false, error: true });
    expect(res).toEqual({
      icon: 'exclamation-circle',
      font: 'solid',
      type: 'error',
    });
  });

  it('openExecutionTrendSidesheet(), should open Execution Trend Sidesheet', async(() => {
    component.schemaDetails = {
      moduleId: '1',
      variantId: '2',
      schemaId: '3',
    } as SchemaListDetails;
    const schema = component.schemaDetails;
    component.dataScopeControl = new FormControl();
    component.dataScopeControl.setValue('2');
    spyOn(router, 'navigate');
    component.openExecutionTrendSidesheet();
    expect(router.navigate).toHaveBeenCalledWith(
      ['', { outlets: { sb: `sb/schema/execution-trend/${schema.moduleId}/${schema.schemaId}/${schema.variantId}` } }],
      { queryParamsHandling: 'preserve' }
    );
  }));

  it('runSchema(), should start running schema', async(() => {
    component.businessRuleData = [
      {
        dep_rules: [{}],
      } as CoreSchemaBrInfo,
    ];
    component.schemaId = 'test';
    component.schemaDetails = { isInRunning: false } as SchemaListDetails;
    component.dataScopeControl.setValue(1);
    component.runSchema();
    expect(component.schemaDetails.isInRunning).toBeFalse();
  }));

  it('selectDataScope(), should update the selected data scope', async(() => {
    component.variantDetails = [
      {
        variantName: 'test',
        variantId: '1',
      } as VariantDetails,
    ];
    component.dataScopeName.setValue('1');
    component.selectDataScope();
    expect(component.dataScopeName.value).toEqual('test');
    component.dataScopeName.setValue('0');
    component.selectDataScope();
    expect(component.dataScopeName.value).toEqual('Entire data scope');
  }));

  it('selectDataScope(), should update the selected data scope', async(() => {
    spyOn(component, 'setDataScopeName');
    component.dataScopeName.setValue('0');
    component.selectDataScope();
    expect(component.setDataScopeName).toHaveBeenCalledWith('0');
  }));

  it('setDataScopeName(), set data scope name', async(() => {
    component.setDataScopeName('0');
    expect(component.dataScopeName.value).toEqual('Entire data scope');
    expect(component.dataScopeControl.value).toEqual('0');
  }));

  it('getBusinessRulesLength(), should get business rules length', async(() => {
    component.businessRuleData = [
      {
        dep_rules: [{}],
      } as CoreSchemaBrInfo,
    ];
    expect(component.getBusinessRulesLength).toEqual(2);
  }));

  it('getRuleDesc(), should return rule description', async(() => {
    expect(component.getRuleDesc('BR_API_RULE')).toEqual('Custom validation');
    expect(component.getRuleDesc('testRule')).toBeFalsy();
  }));

  it('sanitizeValue, should remove special characters', () => {
    const control: FormControl = new FormControl();
    control.setValue('A1@');
    component.sanitizeValue(control);
    expect(control.value).toEqual('A1');
  });

  it('trackByBrId, should track by Br ID', () => {
    const br: any = {
      brId: '1',
    };
    expect(component.trackByBrId(0, br)).toEqual('1');
  });

  it('updateFragmentByIndex, should update fragment by index', () => {
    const tabLabel = 'execution-logs';
    spyOn(component, 'updateFragment');
    component.infoTabs = ['execution-logs'];
    component.updateFragmentByIndex(0);
    expect(component.updateFragment).toHaveBeenCalledWith(tabLabel);
  });

  it('openDatascopeListSidesheet(), Open datascope list sidesheet', async(() => {
    component.moduleId = '1';
    component.schemaId = '3';
    spyOn(router, 'navigate');
    component.openDatascopeListSidesheet();
    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/schema/data-scope/list/${component.moduleId}/${component.schemaId}/sb` } }],
      { queryParamsHandling: 'preserve' }
    );
  }));
});
