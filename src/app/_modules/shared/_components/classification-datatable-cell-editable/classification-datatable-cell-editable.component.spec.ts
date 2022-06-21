import { SharedModule } from '@modules/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NounModifier } from '@models/schema/noun-modifier';
import { ClassificationHeader } from '@models/schema/schemadetailstable';
import { Userdetails } from '@models/userdetails';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ClassificationDatatableCellEditableComponent } from './classification-datatable-cell-editable.component';

describe('ClassificationDatatableCellEditableComponent', () => {
  let component: ClassificationDatatableCellEditableComponent;
  let fixture: ComponentFixture<ClassificationDatatableCellEditableComponent>;
  let nounModifierService: NounModifierService;
  let userService: UserService;
  let schemaDetailService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassificationDatatableCellEditableComponent ],
      imports:[HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationDatatableCellEditableComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();

    nounModifierService = fixture.debugElement.injector.get(NounModifierService);
    userService = fixture.debugElement.injector.get(UserService);
    schemaDetailService = fixture.debugElement.injector.get(SchemaDetailsService);
    spyOn(userService, 'getUserDetails').and.returnValue(of({plantCode: '1005'} as Userdetails));

    component.schemaId = 'schema1';
    component.rundId = 'run1';
    component.objectNumber = '1701';
    component.brType = 'unmatched'
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should get suggested nouns', async(() => {

    component.fieldId = 'NOUN_CODE';

    const apiResponse = [
      {NOUN_CODE: 'Bearing', NOUN_LONG: 'Bearing'}
    ] as NounModifier[];

    spyOn(nounModifierService, 'getSuggestedNouns').and.returnValue(of(apiResponse));

    component.preSuggestedValues = [{CODE: 'Valve'} as DropDownValue]
    component.getSuggestedNouns('Valve');
    expect(component.selectFieldOptions.length).toEqual(2);

    component.preSuggestedValues = [];
    component.getSuggestedNouns('');
    expect(component.selectFieldOptions.length).toEqual(1);

    spyOn(component, 'getSuggestedNouns');
    component.searchControl.setValue('serach text');
    expect(component.getSuggestedNouns).toHaveBeenCalled();


  }));


  it('should get suggested modifiers', async(() => {

    component.fieldId = 'MODE_CODE';
    component.nounCode = 'Bearing';

    const apiResponse = [
      {MODE_CODE: 'Ball', MOD_LONG: 'Ball'}
    ] as NounModifier[];

    spyOn(nounModifierService, 'getSuggestedModifiers').and.returnValue(of(apiResponse));

    component.preSuggestedValues = [{CODE: 'Precision ball'} as DropDownValue]
    component.getSuggestedModifiers('Precision');
    expect(component.selectFieldOptions.length).toEqual(2);

    component.preSuggestedValues = [];
    component.getSuggestedModifiers('');
    expect(component.selectFieldOptions.length).toEqual(1);

    spyOn(component, 'getSuggestedModifiers');
    component.searchControl.setValue('serach text');
    expect(component.getSuggestedModifiers).toHaveBeenCalled();

  }));

  it('should get local nouns', fakeAsync(() => {

    component.fieldId = 'NOUN_CODE';

    const apiResponse = [
      {NOUN_CODE: 'Bearing', NOUN_LONG: 'Bearing'}
    ] as NounModifier[];

    spyOn(nounModifierService, 'getLocalNouns').and.returnValue(of(apiResponse));

    component.getLocalNouns('');
    tick(10);

    component.getLocalNouns('search text');
    tick(10);

    expect(component.selectFieldOptions.length).toEqual(1);
    expect(component.selectFieldOptions[0].CODE).toEqual('Bearing');

  }));

  it('should get local modifiers', fakeAsync(() => {

    component.fieldId = 'MODE_CODE';
    component.nounCode = 'Bearing';

    const apiResponse = [
      {MODE_CODE: 'Ball', MOD_LONG: 'Ball'}
    ] as NounModifier[];

    spyOn(nounModifierService, 'getLocalModifier').and.returnValue(of(apiResponse));

    component.getLocalModifiers('');
    tick(10);

    component.getLocalModifiers('search text');
    tick(10);

    expect(component.selectFieldOptions.length).toEqual(1);
    expect(component.selectFieldOptions[0].CODE).toEqual('Ball');

  }));

  it('should emit value change event', () => {

    const event = {
      option: {
        value: 'India'
      }
    } as MatAutocompleteSelectedEvent;

    spyOn(component.inputBlur, 'emit');
    component.emitChngSelectValue(event);
    expect(component.inputBlur.emit).toHaveBeenCalledWith('India');
  });

  it('should emit input blur event', () => {
    spyOn(component.inputBlur, 'emit');
    component.emitInputBlur('India');
    expect(component.inputBlur.emit).toHaveBeenCalledWith('India');
  });

  it('update on changes', () => {
    let changes:SimpleChanges = {controlType:{currentValue:'ctrl', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.controlType).toEqual('ctrl');

    changes = {schemaId:{currentValue:'1701', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.controlType).toEqual('ctrl');

  });

  it('ngOnInit()', () => {

    spyOn(component, 'getSuggestedNouns');
    spyOn(component, 'getSuggestedModifiers');
    spyOn(component, 'getLocalNouns');
    spyOn(component, 'getLocalModifiers');

    // component.ngOnInit();

    component.brType = '';
    component.fieldId = 'NOUN_CODE';
    component.ngOnInit();

    component.fieldId = 'MODE_CODE';
    component.ngOnInit();

    component.brType = 'unmatched';
    component.ngOnInit();

    component.fieldId = 'NOUN_CODE';
    component.ngOnInit();

    expect(component.getSuggestedNouns).toHaveBeenCalledTimes(1);
    expect(component.getSuggestedModifiers).toHaveBeenCalledTimes(1);
    expect(component.getLocalNouns).toHaveBeenCalledTimes(1);
    expect(component.getLocalModifiers).toHaveBeenCalledTimes(1);

  });

  it('getAttributeValues(), get attribute test ', async(()=>{

    component.attrControl = {colId:'2342423', colSno:'323532'} as ClassificationHeader;
    spyOn(schemaDetailService,'getClassificationAttributeValue').withArgs('323532','').and.returnValue(of([]));

    component.getAttributeValues('');

    expect(schemaDetailService.getClassificationAttributeValue).toHaveBeenCalled();
  }));

});
