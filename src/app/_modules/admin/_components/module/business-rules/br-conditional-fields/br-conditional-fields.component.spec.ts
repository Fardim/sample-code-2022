import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrConditionalFieldsComponent } from './br-conditional-fields.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MetadataModeleResponse, Heirarchy, MetadataModel } from '@models/schema/schemadetailstable';
import { of, throwError } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';

describe('BrConditionalFieldsComponent', () => {
  let component: BrConditionalFieldsComponent;
  let fixture: ComponentFixture<BrConditionalFieldsComponent>;
  let schemaDetailsService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrConditionalFieldsComponent ],
      imports:[
        HttpClientTestingModule, AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrConditionalFieldsComponent);
    component = fixture.componentInstance;
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getAllFields()(), get all field of module', async(()=>{
    component.moduleId = '1005';

    spyOn(schemaDetailsService, 'getMetadataFields').withArgs(component.moduleId).and.returnValue(of({} as MetadataModeleResponse));

    component.getAllFields();

    expect(schemaDetailsService.getMetadataFields).toHaveBeenCalledWith(component.moduleId);
  }));

  it('getAllFields()(), error part', waitForAsync(()=>{
    component.moduleId = null;
    spyOn(schemaDetailsService, 'getMetadataFields').withArgs(component.moduleId).and.returnValues(throwError('Error'));
    component.getAllFields();
    expect(schemaDetailsService.getMetadataFields).toThrowError();
  }));

  it('makeConditionalFields(), make field selectable', async(()=>{
    const response: MetadataModeleResponse = {
      headers:{ MATL_TYPE:{fieldId:'MATL_TYPE'}},
      grids:{ LANGUAGE_GRID:{fieldId:'LANGUAGE_GRID'}},
      gridFields:{ LANGUAGE_GRID:{LANGUAGE:{ieldId:'LANGUAGE'}}},
      hierarchy:[{heirarchyId:'1', heirarchyText:'Plant'} as Heirarchy],
      hierarchyFields:{1:{PLANT:{fieldId:'PLANT'}}}
    };
    component.selectedFldId = {fieldId:'MATL_TYPE', fieldDescri: 'MATERIAL TYPE'} as MetadataModel;
    // call actual method
    component.makeConditionalFields(response);
    expect(component.fields.length).toEqual(3);
    expect(component.fields[0].fields.length).toEqual(1);
    expect(component.fields[1].fields.length).toEqual(1);
    expect(component.fields[2].fields.length).toEqual(1);
  }));

  it('autoCompleteSearch(), make searchable field', async(()=>{
    // mock data
    component.fields = [{fieldId:'header', fieldDescription:'Header Fields',fields:[{fieldDescri :'HEADER', fieldId:'Header'} as MetadataModel]}];
    component.autoCompleteSearch('header');
    expect(component.fields.length).toEqual(1);

    // mock data
    component.fields = [{fieldId:'header', fieldDescription:'Header Fields',fields:[{fieldDescri :'HEADER', fieldId:'Header'} as MetadataModel]}];
    component.autoCompleteSearch('test');
    expect(component.fields.length).toEqual(1);

    // mock data
    component.autoCompleteSearch(null);
    expect(component.fields.length).toEqual(1);
  }));

  it('displayWith(), should return the description', async(() => {
    const obj = {fieldDescri :'NDC Type'} as MetadataModel;
    expect(component.displayWith(obj)).toEqual('NDC Type');
    expect(component.displayWith(null)).toEqual(null);
  }));

  it('returnSelectedFldCtrl(), for correct fieldId', waitForAsync(() => {
    const fieldId = 'Header';
    component.fields = [{fieldId:'header', fieldDescription:'Header Fields',fields:[{fieldDescri :'HEADER', fieldId:'Header'} as MetadataModel]}];
    expect(component.returnSelectedFldCtrl(fieldId)).toEqual(component.fields[0].fields);
  }));

  it('returnSelectedFldCtrl(), for incorrect fieldId', waitForAsync(() => {
    const fieldId = 'test';
    component.fields = [{fieldId:'header', fieldDescription:'Header Fields',fields:[{fieldDescri :'HEADER', fieldId:'Header'} as MetadataModel]}];
    expect(component.returnSelectedFldCtrl(fieldId)).toEqual([]);
  }));

  it('ngOnInit', waitForAsync(() => {
    component.ngOnInit();
    expect(component.getAllFields).toBeTruthy();
  }));

  it('preselectedfields', waitForAsync(() => {
    component.selectedFldId = {fieldId:'MATL_TYPE', fieldDescri: 'MATERIAL TYPE'} as MetadataModel;
    component.ngOnInit();
    component.fldFrmGrp.controls.conFld.setValue(component.selectedFldId);
    expect(component.fldFrmGrp.get('conFld').value).toEqual(component.selectedFldId);
  }));

  it('autocomplete search, if condition', waitForAsync(() => {
    spyOn(component, 'autoCompleteSearch');
    const newValue = 'test';
    component.fldFrmGrp.controls.conFld.setValue(newValue);
    expect(component.autoCompleteSearch).toHaveBeenCalledWith(newValue);
  }));

  it('autocomplete search, else condition ', waitForAsync(() => {
    spyOn(component.evtOnchange, 'emit');
    const newValue = '';
    component.fldFrmGrp.controls.conFld.setValue(newValue);
    expect(component.evtOnchange.emit).toHaveBeenCalledTimes(1);
  }));
});
