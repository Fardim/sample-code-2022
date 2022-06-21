import { MdoUiLibraryModule } from 'mdo-ui-library';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BusinessRuleType, CoreSchemaBrInfo, DuplicateMasterRule } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SetupDuplicateRuleComponent } from './setup-duplicate-rule.component';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { GlobaldialogService } from '@services/globaldialog.service';

describe('SetupDuplicateRuleComponent', () => {
  let component: SetupDuplicateRuleComponent;
  let fixture: ComponentFixture<SetupDuplicateRuleComponent>;
  let sharedService: SharedServiceService;
  let router: Router;
  let schemaService: SchemaService;
  let globaldialogService: GlobaldialogService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupDuplicateRuleComponent ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupDuplicateRuleComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();

    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    router = fixture.debugElement.injector.get(Router);
    globaldialogService = fixture.debugElement.injector.get(GlobaldialogService);

    component.fieldsList = [
      { fieldId: '1', fieldDescri: 'first name' }
    ];

  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */

  it('should filter fields list', () => {

    component.updateUDRFldList('first');
    expect(component.filteredFieldList.length).toEqual(1);

    component.updateUDRFldList('last');
    expect(component.filteredFieldList.length).toEqual(0);

  });


  it('should get field description', () => {

    expect(component.getFieldDesc('1')).toEqual('first name');
    expect(component.getFieldDesc('TEST123')).toEqual('TEST123');

  });

  it('should get merge rule field description', () => {

    expect(component.getMergeRuleFieldDesc('USERCREATED')).toEqual('User created');
    expect(component.getMergeRuleFieldDesc('other')).toEqual('select');

  });

  it('should get merge rule type description', () => {

    expect(component.getMergeRuleTypeDesc('NEWEST')).toEqual('Newest Record');
    expect(component.getMergeRuleTypeDesc('other')).toEqual('other');

  });

  it('should filter numeric fields list', () => {

    spyOn(component, 'filter');
    const filteredFields = component.filterNumFields('first');
    expect(component.filter).toHaveBeenCalledWith('first');
    expect(filteredFields.length).toEqual(0);

  });

  it('init duplicate rule form', () => {

    component.initDuplicateRuleForm();
    expect(component.duplicateRuleForm).toBeDefined();
    expect(component.duplicateFieldsObs).toBeDefined();

  });

  it('should add, edit and remove a fields row', () => {

    component.initDuplicateRuleForm();
    component.addFieldRecord('fid');
    expect(component.fieldRecords.length).toEqual(1);

    component.addFieldRecord('', {});
    expect(component.fieldRecords.length).toEqual(1);

    component.setControlValue('addFields', 'criteria', 'Fuzzy', 0);
    expect(component.fieldRecords.value[0].criteria).toEqual('Fuzzy');

    component.removeFomArrRowAfterConfirm('no','addFields', 0);
    expect(component.fieldRecords.length).toEqual(1);

    component.removeFomArrRowAfterConfirm('yes','addFields', 0);
    expect(component.fieldRecords.length).toEqual(0);

  });

  it('should update field row exclusion', () => {

    component.initDuplicateRuleForm();
    component.addFieldRecord('fid');

    const exclusionData = { fId: 'fid', exclusion: 1, ival: 'customer', sval: 'supplier:vendor' };
    component.updateFieldExclusion(exclusionData);

    expect(component.fieldRecords.value[0].exclusion).toEqual(1);
    expect(component.fieldRecords.value[0].ival).toEqual('customer');
    expect(component.fieldRecords.value[0].sval).toEqual('supplier:vendor');


  });

  it('should not update field row exclusion', () => {

    component.initDuplicateRuleForm();
    component.addFieldRecord('fid');

    const exclusionData = { fId: 'fid2', exclusion: 1, ival: 'customer', sval: 'supplier:vendor' };
    component.updateFieldExclusion(exclusionData);

    expect(component.fieldRecords.value[0].exclusion).toEqual('0');
    expect(component.fieldRecords.value[0].ival).toEqual('');
    expect(component.fieldRecords.value[0].sval).toEqual('');


  });

  it('should prepare duplicate rule for edition', () => {

    component.initDuplicateRuleForm();

    const duplicacyField = [{
      fieldId: 'fid',
      criteria: 'Exact_Match',
      exclusion: '0',
      inverse: '0',
      weightage: '0',
      ival: 'customer',
      sval: 'vendor:supplier'
    }];

    const br = new CoreSchemaBrInfo();
    br.duplicacyField = duplicacyField;
    component.patchDuplicateForm(br);
    expect(component.fieldRecords.value.length).toEqual(1);
    expect(component.fieldRecords.value[0].sval).toEqual('vendor:supplier');
    component.initDuplicateRuleForm();
    br.duplicacyField = null;
    br.masterRules = [{brOrder: 2, coreSchemBrInfo: {}}, {brOrder: 0, coreSchemBrInfo: {}}, {brOrder: 1, coreSchemBrInfo: {}}] as any;
    component.patchDuplicateForm(br);
    expect(component.fieldRecords.value.length).toEqual(0);
  });

  it('should patch duplicate form on change', () => {

    spyOn(component, 'patchDuplicateForm');

    /* const duplicacyField = [{
      fieldId: 'fid',
      criteria: 'Exact_Match',
      exclusion: '0',
      inverse: '0',
      weightage: '0',
      ival: 'customer',
      sval: 'vendor:supplier'
    }];

    const duplicacyMaster = [{
      ruleType: 'OLDEST',
      fieldId: 'USERMODIFIED',
      RuleId: 'OLDEST1',
      sno: ''
    }];

    const coreSchemaBrInfo = new CoreSchemaBrInfo();
    coreSchemaBrInfo.duplicacyField = duplicacyField;
    coreSchemaBrInfo.duplicacyMaster = duplicacyMaster;

    component.coreSchemaBrInfo = coreSchemaBrInfo; */

    let changes: SimpleChanges = {coreSchemaBrInfo:{currentValue: new CoreSchemaBrInfo(), previousValue: null, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.patchDuplicateForm).toHaveBeenCalled();

    changes = {
      fieldsList: {currentValue: [], previousValue: null, firstChange:null, isFirstChange:null},
      moduleId: {currentValue: 'test', previousValue: null, firstChange:null, isFirstChange:null}
    };
    component.ngOnChanges(changes);
    expect(component.duplicateFieldsObs).toBeDefined();

  });

  it('should init component', () => {

    spyOn(component.formChange, 'emit');
    spyOn(component, 'updateFieldExclusion');

    component.ngOnInit();
    expect(component.formChange.emit).toHaveBeenCalled();

    sharedService.setExclusionData({fId:'1',ival:'w1,w2', sval:'customer:client'});
    sharedService.setExclusionData({fId:'1',ival:'w1,w2', sval:'customer:client', editActive: true});
    expect(component.updateFieldExclusion).toHaveBeenCalledTimes(1);
  });

  it('should open exclusion sidesheet', () => {
    spyOn(router, 'navigate');

    component.initDuplicateRuleForm();
    component.addFieldRecord('fid');


    component.exclusionConf(component.fieldRecords.at(0) as FormGroup);
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb3: 'sb3/schema/setup-br-exclusion' } }]);
  })

  it('tieBreakerRules and masterRules should get filtered rules', () => {
    component.duplicateMasterRules = [{
      isTieBreaker: true
    }, {
      isTieBreaker: false
    }] as any;
    expect(component.tieBreakerRules.length).toEqual(1);
    expect(component.masterRules.length).toEqual(1);
  });

  it('tieBreakerRules and masterRules should get filtered rules', () => {
    component.allBusinessRulesList = [{
      brType: BusinessRuleType.BR_CUSTOM_SCRIPT
    }, {
      brType: BusinessRuleType.BR_MANDATORY_FIELDS
    }, {
      brType: BusinessRuleType.BR_TRANSFORMATION
    }] as any;
    expect(component.businessRulesList.length).toEqual(1);
    expect(component.tieBreakerbusinessRulesList.length).toEqual(2);
  });

  it('toggleBrStatus will toggle the br status', () => {
    const dRule: DuplicateMasterRule = {
      coreSchemBrInfo: {
        status: '1',
        lookupRuleMetadata : {
          sno:1
        }
      },
      brStatus: true
    } as any;
    spyOn(schemaService, 'getBusinessRuleInfoV2').and.returnValue(of(dRule.coreSchemBrInfo));
    component.toggleBrStatus(dRule);
    expect(dRule.brStatus).toBeFalsy();
    component.toggleBrStatus(dRule);
    expect(dRule.brStatus).toBeTrue();
    dRule.coreSchemBrInfo.isEdited = true;
    component.toggleBrStatus(dRule);
    expect(schemaService.getBusinessRuleInfoV2).toHaveBeenCalled();
  });

  it('weightageChange will set and get the br weightage', () => {
    const dRule: DuplicateMasterRule = {
      coreSchemBrInfo: {
        status: '1',
        brWeightage: '100',
        lookupRuleMetadata : {
          sno : 1
        }
      }
    } as any;
    spyOn(schemaService, 'getBusinessRuleInfoV2').and.returnValue(of(dRule.coreSchemBrInfo));
    component.weightageChange({value: 10}, dRule);
    dRule.coreSchemBrInfo.isEdited = true;
    component.weightageChange({value: 10}, dRule);
    expect(component.getWeightage(dRule)).toEqual(10);
  });

  it('getRuleDesc should get correct rule description', () => {
    expect(component.getRuleDesc(BusinessRuleType.BR_DUPLICATE_RULE)).toEqual('Duplicate Rule');
  });

  it('availableWeightage(), should return max avail weightage', async() => {
    const weightage = '20';
    component.duplicateMasterRules = [
      {
        coreSchemBrInfo: {
          brWeightage: 30
        }
      }
    ] as any;
    const result = component.availableWeightage(weightage);
    expect(result).toEqual(90);
  });
  it('deleteBr(), should delete the current business rule', async() => {
    component.initDuplicateRuleForm();
    const dRule: any = {
      coreSchemBrInfo: {}
    };
    component.duplicateMasterRules = [{
      coreSchemBrInfo: {}
    }, dRule];
    spyOn(component, 'emitFormData');
    component.deleteBr(dRule);
    expect(component.duplicateMasterRules.length).toEqual(1);
    expect(component.emitFormData).toHaveBeenCalled();
  });

  it('updateMasterRule(), should update correct master rule object', async() => {
    component.initDuplicateRuleForm();
    component.duplicateMasterRules = [];
    component.addMasterRule({
      brOrder: 0,
      coreSchemBrInfo: {
        brInfo: 'Test1',
        udrDto: {},
        brType: '',
        brWeightage: '',
        message: '',
        isConfigured: true,
        dontMapped: true
      }
    } as any);
    component.updateMasterRule(0, {
      rule_name: 'New'
    });
    expect(component.duplicateMasterRules[0].coreSchemBrInfo.brInfo).toEqual('New');
  });

  it('addMasterRule(), should add new master rule object', async() => {
    component.initDuplicateRuleForm();
    component.duplicateMasterRules = [];
    const dRule: any = {
      brInfo: 'test'
    };
    component.addMasterRule(dRule);
    const masterRules = component.duplicateRuleForm.get('masterRules') as FormArray;
    expect(component.duplicateMasterRules.length).toEqual(1);
    expect(masterRules.length).toEqual(1);
  });

  it('drop(), should update the order of the BR list', async() => {
    component.initDuplicateRuleForm();
    component.duplicateMasterRules = [];
    component.addMasterRule({
      brOrder: 0,
      coreSchemBrInfo: {
        brInfo: 'Test1'
      }
    } as any);
    component.addMasterRule({
      brOrder: 0,
      coreSchemBrInfo: {
        brInfo: 'Test3'
      }
    } as any);
    const container = {
      data: component.duplicateMasterRules
    };
    const dropEvent: any = {
      container,
      previousContainer: container,
      previousIndex: 0,
      currentIndex: 1
    };
    component.drop(dropEvent, '');
    expect(component.duplicateMasterRules[0].coreSchemBrInfo.brInfo).toEqual('Test3');
  });

  // it('addBusinessRule(), should add new Business rule to the list', async(done) => {
  //   component.duplicateMasterRules = [{
  //     brOrder: 0,
  //     coreSchemBrInfo: {
  //       copiedFrom: '1'
  //     }
  //   }] as any;
  //   const brInfo1 = {
  //     schemaId: 'schema1',
  //     brInfo: 'testInfo',
  //     brIdStr: '1'
  //   };
  //   const brInfo2 = {
  //     schemaId: 'schema1',
  //     brInfo: 'testInfo',
  //     brIdStr: '2'
  //   };
  //   spyOn(transientService, 'open');
  //   await component.addBusinessRule(brInfo1, true);
  //   expect(transientService.open).toHaveBeenCalled();
  //   await component.addBusinessRule(brInfo2, true);
  //   expect(component.duplicateMasterRules.length).toEqual(2);
  //   done();
  // });

  it('getDuppCriteriaDesc(), should get duplicate criteria desc', async() => {
    expect(component.getDuppCriteriaDesc(undefined)).toEqual('Select');
    expect(component.getDuppCriteriaDesc('Exact_Match')).toEqual('Exact match');
    expect(component.getDuppCriteriaDesc('Fuzzy')).toEqual('Fuzzy');
    expect(component.getDuppCriteriaDesc('Test')).toEqual('');
  });

  it('triggerSearch(), should get duplicate criteria desc', async() => {
    spyOn(component.serachFieldsSub, 'next');
    component.triggerSearch('test');
    expect(component.serachFieldsSub.next).toHaveBeenCalledWith('test');
  });
  it('openBusinessRuleSideSheet(), should open this business rule side sheet', async() => {
    component.moduleId = 'module1';
    component.schemaId = 'schema1';
    component.duplicateMasterRules = [];
    const res = {
      data: {
        brInfo: {

        },
        udrHierarchies: [],
        blocks: []
      }
    };
    component.isCustomSchema = true;
    spyOn(globaldialogService, 'openDialog');
    component.openBusinessRuleSideSheet();
    expect(globaldialogService.openDialog).toHaveBeenCalled();

    component.isCustomSchema = false;
    spyOn(schemaService, 'getDRChildResponse').and.returnValue(of(res));
    spyOn(router, 'navigate');
    component.openBusinessRuleSideSheet();
    expect(schemaService.getDRChildResponse).toHaveBeenCalledWith({
      isTieBreaker: false,
      isDRChildRule: true
    });
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: {
      sb3: `sb3/schema/business-rule/${component.moduleId}/${component.schemaId}/DRChild` }}]);
  });

  it('configureRule(), should open this business rule side sheet for selected rule', async() => {
    component.moduleId = 'module1';
    component.schemaId = 'schema1';
    component.duplicateMasterRules = [];
    const dRule: DuplicateMasterRule = {
      coreSchemBrInfo: {
        brInfo: 'Test1'
      },
      brOrder: 0
    } as any;
    const res = {
      data: {
        brInfo: {

        },
        udrHierarchies: [],
        blocks: []
      }
    };
    component.isCustomSchema = true;
    spyOn(globaldialogService, 'openDialog');
    component.configureRule(dRule);
    expect(globaldialogService.openDialog).toHaveBeenCalled();
    component.isCustomSchema = false;
    spyOn(schemaService, 'getDRChildResponse').and.returnValue(of(res));
    spyOn(router, 'navigate');
    component.configureRule(dRule);
    expect(schemaService.getDRChildResponse).toHaveBeenCalledWith(dRule);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: {
      sb3: `sb3/schema/business-rule/${component.moduleId}/${component.schemaId}/DRChild` }}]);
  });

  it('getAllBusinessRulesList(), should get updated rule list', async() => {
    spyOn(schemaService, 'getBusinessRulesByModuleId').and.returnValue(of([{} as any]));
    component.getAllBusinessRulesList('Module1', '', '', false);
    expect(schemaService.getBusinessRulesByModuleId).toHaveBeenCalled();
  });

  it('getAllBusinessRulesList(), gets no record in the rule list', async() => {
    spyOn(schemaService, 'getBusinessRulesByModuleId').and.returnValue(of([]));
    component.getAllBusinessRulesList('Module1', '', '', false);
    expect(component.allBusinessRulesList.length).toEqual(0);
  });

  it('getAllBusinessRulesList(), should get updated rule list on load more', async() => {
    spyOn(schemaService, 'getBusinessRulesByModuleId').and.returnValue(of([{} as any]));
    component.getAllBusinessRulesList('Module1', '', '', true);
    expect(component.allBusinessRulesList.length).toEqual(1);
  });

  it('masterRecords(), should return merge rules', async() => {
    component.duplicateRuleForm = new FormGroup({
      mergeRules: new FormArray([
        new FormGroup({})
      ])
    });
    expect(component.masterRecords.length).toEqual(1);
  });

  it('dropField should rearrange the fields', () => {
    component.initDuplicateRuleForm();
    expect(component.dropField({
      previousIndex: 0,
      currentIndex: 0
    }, 'addFields')).toBeUndefined();
    component.addFieldRecord('Test1', {
      fId: 'Test1'
    });
    component.addFieldRecord('Test2', {
      fId: 'Test2'
    });
    component.dropField({
      previousIndex: 0,
      currentIndex: 1
    }, 'addFields');
    expect(component.fieldRecords.at(0).value.fId).toEqual('Test2');
  });
});
