import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterValuesComponent } from './filter-values.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaService } from '@services/home/schema.service';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { of } from 'rxjs';
import { SimpleChanges } from '@angular/core';

describe('FilterValuesComponent', () => {
  let component: FilterValuesComponent;
  let fixture: ComponentFixture<FilterValuesComponent>;
  let schemaService: jasmine.SpyObj<SchemaService>;

  beforeEach(async(() => {
    const spyObj = jasmine.createSpyObj('SchemaService', ['dropDownValues', 'getStaticFieldValues']);
    TestBed.configureTestingModule({
      declarations: [FilterValuesComponent, SearchInputComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: SchemaService, useValue: spyObj }
      ]
    })
      .compileComponents();
    schemaService = TestBed.inject(SchemaService) as jasmine.SpyObj<SchemaService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterValuesComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`dropDownValues(), get business rules service`, async(() => {
    const returnData: DropDownValue[] = [];
    schemaService.dropDownValues.and.returnValue(of(returnData));
    component.getDropdownValues('testId', '');
    expect(component.checkedValue.length).toEqual(0);

    component.selectedDropValues = ['firstname', 'lastname'];

    component.getDropdownValues('testId', 'search text');
    expect(component.checkedValue.length).toEqual(0);

    component.getDropdownValues('testId', '');
    expect(component.checkedValue.length).toEqual(2);

    expect(schemaService.dropDownValues).toHaveBeenCalledTimes(3);
  }));

  it(`searchFromExistingValues(), should search value from existing values list`, async(() => {
    component.dropValue = [
      {
        CODE: 'test',
        FIELDNAME: 'Test Field',
        LANGU: '',
        PLANTCODE: '',
        SNO: `1`,
        TEXT: 'test field'
      },
      {
        CODE: 'test1',
        FIELDNAME: 'Test Field 1',
        LANGU: '',
        PLANTCODE: '',
        SNO: `2`,
        TEXT: 'test field 1'
      },
    ];
    component.searchFromExistingValues('test field 1');
    expect(component.searchValue.length).toEqual(1);
  }));

  it(`searchFromExistingValues(), should return all values if searchTerm is not provided`, async(() => {
    component.dropValue = [
      {
        CODE: 'test',
        FIELDNAME: 'first Field',
        LANGU: '',
        PLANTCODE: '',
        SNO: `1`,
        TEXT: 'test field'
      },
      {
        CODE: 'test1',
        FIELDNAME: 'second Field 1',
        LANGU: '',
        PLANTCODE: '',
        SNO: `2`,
        TEXT: 'test field 1'
      },
    ];

    component.searchFromExistingValues('');
    expect(component.searchValue.length).toEqual(2);

  }));

  it(`isChecked(), should return true if a value is already selected`, async(() => {
    const value = {
      CODE: 'test1',
      FIELDNAME: 'Test Field 1',
      LANGU: '',
      PLANTCODE: '',
      SNO: `2`,
      TEXT: 'test field 1'
    };
    component.checkedValue.push(value);
    expect(component.isChecked(value)).toBe(true);

    expect(component.isChecked({...value, CODE: 'no_match'})).toBeFalsy();

  }));

  it(`onChange(), should remove DropDownValue in the checkedValue list if already exist`, async(() => {
    const value = {
      CODE: 'test1',
      FIELDNAME: 'Test Field 1',
      LANGU: '',
      PLANTCODE: '',
      SNO: `2`,
      TEXT: 'test field 1'
    };
    component.checkedValue.push(value);

    component.onChange(value);
    expect(component.checkedValue.length).toEqual(0);
  }));

  it(`onChange(), should add DropDownValue in the checkedValue list if not already exist`, async(() => {
    const value = {
      CODE: 'test1',
      FIELDNAME: 'Test Field 1',
      LANGU: '',
      PLANTCODE: '',
      SNO: `2`,
      TEXT: 'test field 1'
    };
    component.checkedValue.push(value);

    component.onChange({
      CODE: 'test',
      FIELDNAME: 'Test Field',
      LANGU: '',
      PLANTCODE: '',
      SNO: `1`,
      TEXT: 'test field'
    });
    expect(component.checkedValue.length).toEqual(2);
  }));

  it('generateDropdownValues(), shoudd generate dropdown values from excel', async() => {
    const dropDownValues = [
      'firstname',
      'lastname',
      'id',
      'country'
    ]
    component.dropValue = [];
    component.generateDropdownValues([]);
    expect(component.dropValue.length).toEqual(0);

    component.generateDropdownValues(dropDownValues);
    expect(component.dropValue.length).toEqual(4);
    expect(component.searchValue.length).toEqual(4);
  })

  it('updateValues(), shoudld update dropdown values', async() => {

    component.updateValues();
    expect(component.checkedValue.length).toEqual(0);

    component.fieldId = 'APPROVER_ID';
    component.moduleId = '1005';

    spyOn(component, 'getDropdownValues');
    component.updateValues();
    expect(component.getDropdownValues).toHaveBeenCalled();

    spyOn(component, 'generateDropdownValues');
    schemaService.getStaticFieldValues.and.returnValue([]);
    component.moduleId = '';
    component.updateValues();
    expect(component.generateDropdownValues).toHaveBeenCalled();

  })

  it('update on changes', () => {

    spyOn(component, 'updateValues');

    let changes:SimpleChanges = {fieldId:{currentValue:'', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);

    changes.fieldId.currentValue = 'mtl_grp';
    component.ngOnChanges(changes);
    expect(component.fieldId).toEqual('mtl_grp');
    expect(component.updateValues).toHaveBeenCalledTimes(1);

    changes= {checkedValue:{currentValue: [], previousValue: null, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.checkedValue).toEqual([]);

  });

  it('ngOnInit', () => {

    spyOn(component, 'getDropdownValues');

    component.ngOnInit();

    component.moduleId = '1005';
    component.fieldId = 'mtl_grp';
    component.ngOnInit();

    expect(component.getDropdownValues).toHaveBeenCalledTimes(1);

  });

  it('submit filter values', () => {
    spyOn(component.selectedValues, 'emit');
    component.submit();
    expect(component.selectedValues.emit).toHaveBeenCalled();

  });

});
