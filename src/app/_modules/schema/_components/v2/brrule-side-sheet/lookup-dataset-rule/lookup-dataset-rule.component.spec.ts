import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { LookupTableMetadata, MetadataModeleResponse, TargetSystemResponse } from '@models/schema/schemadetailstable';
import { ModuleInfo } from '@models/schema/schemalist';
import { CoreSchemaBrInfo, LookupRuleMetadata, LookupTypes } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';

import { LookupDatasetRuleComponent } from './lookup-dataset-rule.component';

describe('LookupDatasetRuleComponent', () => {
  let component: LookupDatasetRuleComponent;
  let fixture: ComponentFixture<LookupDatasetRuleComponent>;
  let schemaDetailsServicespy: SchemaDetailsService;
  let coreServiceSpy: CoreService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LookupDatasetRuleComponent ],
      imports: [SharedModule, MdoUiLibraryModule, FormsModule, HttpClientTestingModule],
      providers: [SchemaDetailsService, CoreService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupDatasetRuleComponent);
    component = fixture.componentInstance;
    schemaDetailsServicespy = fixture.debugElement.injector.get(SchemaDetailsService);
    coreServiceSpy = fixture.debugElement.injector.get(CoreService);
    // fixture.detectChanges();
    component.buildLookupForm();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOninit()', async(() => {
    spyOn(component, 'getDatasetList');
    component.ngOnInit();

    expect(component.isDatasetLookup).toBeFalse();
    expect(component.isSAPTableLookup).toBeFalse();
    expect(component.isSAPFunctionCall).toBeFalse();
    expect(component.getDatasetList).toHaveBeenCalled();

    component.existingData = new CoreSchemaBrInfo();
    component.existingData.lookupRuleMetadata = new LookupRuleMetadata();
    component.ngOnInit();

    component.operatorsList = [{
      childs: ['Equal', 'Not Equal', 'Like', 'Range']
    }];
    component.ngOnInit();
    expect(component.SAPWhenOperatorsList.length).toEqual(1);
  }));

  it('setExistingValues()', async(() => {
    const data = new CoreSchemaBrInfo();
    const lookupData = new LookupRuleMetadata();
    lookupData.lookupType = LookupTypes.WITHIN_DATASET;
    lookupData.checkCodes = ['1234'];
    lookupData.checkCodeDesc = 'Test';
    data.lookupRuleMetadata = lookupData;
    data.udrData = {when: [], then: []};
    component.setExistingValues(data);
    expect(component.whenBlocksList.blocksList).toEqual([]);

    lookupData.lookupType = undefined;
    component.setExistingValues(data);
    expect(component.whenBlocksList.blocksList).toEqual([]);

    lookupData.checkCodes = [];
    component.setExistingValues(data);
    expect(component.whenBlocksList.blocksList).toEqual([]);

    lookupData.checkCodeDesc = undefined;
    component.setExistingValues(data);
    expect(component.whenBlocksList.blocksList).toEqual([]);

    data.udrData = {when: undefined, then: undefined}
    component.setExistingValues(data);
    expect(component.whenBlocksList.blocksList.length).toEqual(0);

    data.udrData = undefined;;
    component.setExistingValues(data);
    expect(component.whenBlocksList.blocksList.length).toEqual(0);
  }));

  it('getDatasetList()', async(() => {
    const res = [new ModuleInfo()];
    component.currentLookupType = LookupTypes.WITHIN_DATASET;
    spyOn(coreServiceSpy, 'searchAllObjectType').and.returnValue(of(res));
    spyOn(component, 'selectSingle');
    spyOn(component, 'setExistingValues');
    component.existingData = new CoreSchemaBrInfo();
    const lookupData = new LookupRuleMetadata();
    lookupData.lookupType = LookupTypes.WITHIN_DATASET;
    lookupData.lookupDataset = '1234';
    component.existingData.lookupRuleMetadata = lookupData;
    component.getDatasetList();

    expect(component.setExistingValues).toHaveBeenCalled();
    expect(component.editMode).toBeTrue();
    expect(component.datasetList).toEqual(res);
    expect(coreServiceSpy.searchAllObjectType).toHaveBeenCalled();
    expect(component.selectSingle).toHaveBeenCalled();

    component.existingData = undefined;
    component.getDatasetList();
    expect(coreServiceSpy.searchAllObjectType).toHaveBeenCalled();
  }));

  it('getDatasetList(), API fail case', async(() => {
    spyOn(coreServiceSpy, 'searchAllObjectType').and.returnValue(of(undefined));
    component.getDatasetList();

    expect(coreServiceSpy.searchAllObjectType).toHaveBeenCalled();
  }));

  it('getMetadataFields()', async(() => {
    component.datasetList = [{moduleDesc: 'test', moduleId: '1234'}];
    const mres = new MetadataModeleResponse();
    const res = {
      1234: mres
    };
    component.moduleId = '12';
    spyOn(coreServiceSpy, 'getMetadataFieldsByModuleId').and.returnValue(of(res));
    spyOn(component, 'transformFieldRes').and.returnValue([{fieldId: 'par', fieldDescri: 'test', isGroup: false, childs: []}]);

    component.getMetadataFields([], 'datasetWhen');
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
    expect(component.transformFieldRes).toHaveBeenCalled();

    component.moduleId = '12';
    component.getMetadataFields([], 'datasetThen');
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();

    component.getMetadataFields([], 'dataset', '', true);
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();

    component.getMetadataFields([], 'dataset', '', false);
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();

    spyOn(component, 'searchSAPFields');
    component.getMetadataFields([], 'SAPWhen');
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
    expect(component.searchSAPFields).toHaveBeenCalled();

    component.getMetadataFields([], 'SAPThen');
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
    expect(component.searchSAPFields).toHaveBeenCalled();

    spyOn(component, 'getSAPMetadataFields');
    component.getMetadataFields([], 'SAP', '', true);
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
    expect(component.getSAPMetadataFields).toHaveBeenCalled();

    component.getMetadataFields([], 'SAP', '', false);
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
    expect(component.getSAPMetadataFields).toHaveBeenCalled();

    component.getMetadataFields([], 'data', '', false);
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
  }));

  it('getMetadataFields(), API fail case', async(() => {
    spyOn(coreServiceSpy, 'getMetadataFieldsByModuleId').and.returnValue(of(undefined));
    component.getMetadataFields([], 'datasetWhen');

    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
  }));

  it('searchSAPFields()', async(() => {
    component.lookupTableMetaDataFields = [{
      fieldId: 'parent',
      fieldDescri: 'Paretn',
      isGroup: true,
      childs: [{fieldId: '1234', fieldDescri: 'test', isGroup: false, childs: []}]
    }];
    const res = component.searchSAPFields('test');

    expect(res.length).toEqual(1);
  }));

  it('getSAPMetadataFields()', async(() => {
    const res: LookupTableMetadata[] = [{fieldname: 'test', fieldtext: 'Test'}];
    spyOn(schemaDetailsServicespy, 'getLookupTablesMetadata').and.returnValue(of(res));
    component.lookupForm.controls.targetSystem.setValue({connid: '1234', name: 'test'});
    component.lookupForm.controls.lookupTable.setValue('testTable');
    const metadata: Metadata[] = [{fieldId: '1234', fieldDescri: 'test', isGroup: false, childs: []}];
    component.getSAPMetadataFields(metadata);

    expect(component.lookupTableMetaDataFields.length).toEqual(1);
    expect(schemaDetailsServicespy.getLookupTablesMetadata).toHaveBeenCalled();
  }));

  it('getSAPMetadataFields()', async(() => {
    spyOn(schemaDetailsServicespy, 'getLookupTablesMetadata').and.returnValue(of(undefined));
    component.lookupForm.controls.targetSystem.setValue({connid: '1234', name: 'test'});
    component.lookupForm.controls.lookupTable.setValue('testTable');
    const metadata: Metadata[] = [{fieldId: '1234', fieldDescri: 'test', isGroup: false, childs: []}];
    component.getSAPMetadataFields(metadata);

    expect(schemaDetailsServicespy.getLookupTablesMetadata).toHaveBeenCalled();
  }));

  it('getTargetFieldMetaData()', async(() => {
    const res = new MetadataModeleResponse();
    spyOn(coreServiceSpy, 'getMetadataFieldsByModuleId').and.returnValue(of(res));
    component.getTargetFieldMetaData('12');

    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
  }));

  it('getTargetFieldMetaData()', async(() => {
    spyOn(coreServiceSpy, 'getMetadataFieldsByModuleId').and.returnValue(of(undefined));
    component.getTargetFieldMetaData('12');

    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalled();
  }));

  it('getTargetSystems()', async(() => {
    spyOn(schemaDetailsServicespy, 'getTargetSystems').and.returnValue(of([{connid: '1234', name: 'test'}]));
    spyOn(component, 'selectSingle');
    component.existingData = new CoreSchemaBrInfo();
    const lookupData = new LookupRuleMetadata();
    lookupData.lookupType = LookupTypes.SAP_TABLE_LOOKUP;
    lookupData.targetSystem = '1234';
    component.existingData.lookupRuleMetadata = lookupData;
    component.getTargetSystems();
    expect(schemaDetailsServicespy.getTargetSystems).toHaveBeenCalled();
    expect(component.selectSingle).toHaveBeenCalled();

    lookupData.targetSystem = '45678';
    component.existingData.lookupRuleMetadata = lookupData;
    component.getTargetSystems();
    expect(schemaDetailsServicespy.getTargetSystems).toHaveBeenCalled();

    component.existingData = undefined;
    component.getTargetSystems();
    expect(schemaDetailsServicespy.getTargetSystems).toHaveBeenCalled();
  }));

  it('getTargetSystems()', async(() => {
    spyOn(schemaDetailsServicespy, 'getTargetSystems').and.returnValue(of(undefined));
    component.getTargetSystems();

    expect(schemaDetailsServicespy.getTargetSystems).toHaveBeenCalled();
  }));

  it('getLookupTables()', async(() => {
    spyOn(schemaDetailsServicespy, 'getLookupTables').and.returnValue(of(['123', '456']));
    spyOn(component, 'selectSingle');
    component.existingData = new CoreSchemaBrInfo();
    const lookupData = new LookupRuleMetadata();
    lookupData.lookupType = LookupTypes.SAP_TABLE_LOOKUP;
    lookupData.lookupTable = '123';
    component.existingData.lookupRuleMetadata = lookupData;
    component.getLookupTables('', '');
    expect(schemaDetailsServicespy.getLookupTables).toHaveBeenCalled();
    expect(component.selectSingle).toHaveBeenCalled();

    lookupData.lookupTable = '789';
    component.existingData.lookupRuleMetadata = lookupData;
    component.getLookupTables('', '');
    expect(schemaDetailsServicespy.getLookupTables).toHaveBeenCalled();

    component.existingData = undefined;
    expect(schemaDetailsServicespy.getLookupTables).toHaveBeenCalled();
  }));

  it('getLookupTables()', async(() => {
    spyOn(schemaDetailsServicespy, 'getLookupTables').and.returnValue(of(undefined));
    component.getLookupTables('', '');
    expect(schemaDetailsServicespy.getLookupTables).toHaveBeenCalled();
  }));



  it('selectSingle() ', async(() => {
    component.moduleId = '12';
    spyOn(component, 'checkMetadataFields');
    spyOn(component, 'getTargetFieldMetaData');
    component.selectSingle('datasetCtrl', {option:{value:{moduleId: '1234'}}});
    expect(component.checkMetadataFields).toHaveBeenCalled();
    expect(component.getTargetFieldMetaData).toHaveBeenCalled();

    spyOn(component, 'getLookupTables');
    component.currentLookupType = LookupTypes.SAP_TABLE_LOOKUP;
    component.selectSingle('targetSystem', {option:{value:{connid: '1234'}}});
    expect(component.getLookupTables).toHaveBeenCalled();

    component.selectSingle('lookupTable', {option:{value:{connid: '1234'}}});
    expect(component.checkMetadataFields).toHaveBeenCalled();
    expect(component.getTargetFieldMetaData).toHaveBeenCalled();
  }));

  it('clearValues()', async(() => {
    component.currentLookupType = LookupTypes.WITHIN_DATASET;
    component.clearValues();
    expect(component.lookupForm.value.targetSystem).toEqual('');

    component.currentLookupType = LookupTypes.SAP_TABLE_LOOKUP;
    component.clearValues();
    expect(component.lookupForm.value.datasetCtrl).toEqual('');

    component.currentLookupType = LookupTypes.SAP_CHECK_CODE;
    component.clearValues();
    expect(component.lookupForm.value.datasetSelected).toEqual('');
  }));

  it('clearFormArray()', async(() => {
    const arr = new FormArray([]);
    const grp = new FormGroup({
      test: new FormControl('')
    });
    arr.push(grp);
    component.clearFormArray(arr);

    expect(arr.controls.length).toEqual(0);
  }));

  it('checkValidations()', async(() => {
    component.selectedFields = [];
    expect(component.checkValidations()).toEqual('Please select error fields');
    component.selectedFields = ['1'];

    component.lookupForm.controls.lookupType.setValue('test');
    expect(component.checkValidations()).toEqual('Please select valid lookup type');
    component.lookupTypes = [{ruleType: LookupTypes.WITHIN_DATASET, ruleDesc: 'test', tooltipDesc: 'test'}];

    component.lookupForm.controls.lookupType.setValue(LookupTypes.WITHIN_DATASET);
    component.currentLookupType = LookupTypes.WITHIN_DATASET;
    component.datasetList = [{moduleId: '123', moduleDesc: 'test'}];
    expect(component.checkValidations()).toEqual('Please select valid dataset');
  }));

  it('updateFldList()', async(() => {
    spyOn(component, 'checkMetadataFields');
    component.moduleId = '12';
    component.updateFldList({searchString: '', type: 'sourceList'}, '');

    component.updateFldList({searchString: [], type: 'sourceList'}, '');
    component.updateFldList({searchString: '', type: 'targetList'}, '');

    component.lookupForm.controls.datasetSelected.setValue('12');
    component.updateFldList({searchString: [], type: 'sourceList'}, '');

    expect(component.checkMetadataFields).toHaveBeenCalled();
  }));

  it('display functions', async(() => {
    expect(component.displayRuleFn(LookupTypes.WITHIN_DATASET)).toEqual('Within Dataset');
    expect(component.displayRuleFn('test')).toEqual(undefined);
    expect(component.displayRuleFn(undefined)).toEqual('');

    const val = new ModuleInfo();
    val.moduleDesc = 'test';
    expect(component.displayDatasetFn(val)).toEqual('test');
    val.moduleDesc = undefined;
    expect(component.displayDatasetFn(val)).toEqual('');

    const val2 = new TargetSystemResponse();
    val2.name = 'test';
    expect(component.displayTrgtSystemFn(val2)).toEqual('test');
    val2.name = undefined;
    expect(component.displayTrgtSystemFn(val2)).toEqual('');

    expect(component.displayFn({fieldDescri: 'test'})).toEqual('test');
    expect(component.displayFn(undefined)).toEqual('');
  }));

  it('resetValues()', async(() => {
    component.resetValues('test');
    component.resetValues('lookup');
    expect(component.lookupTypesFiltered.length).toBeGreaterThan(0);

    component.selectedFields = ['123'];
    component.remove('', 0);
    expect(component.selectedFields.length).toEqual(0);
  }));

  it('getBlocksGrp()', async(() => {
    expect(component.getBlocksGrp('checkCodeGroup')).toEqual(component.lookupForm.controls.checkCodeGroup as FormGroup);
  }));

  it('selectErrorFields()', async(() => {
    const inputEl = document.createElement('input');
    component.selectedFields = [{fieldId: '123', fieldDescri: 'test'}];
    spyOn(component.snackBar, 'open');
    component.selectErrorFields({option:{value:'123', viewValue: '456'}}, inputEl);
    expect(component.snackBar.open).toHaveBeenCalled();

    component.selectErrorFields({option:{value:'1234', viewValue: '456'}}, undefined);
    expect(component.lookupForm.value.errorDisplayFld).toEqual('');
  }));

});
