import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { OptionFilterComponent } from './option-filter.component';

describe('OptionFilterComponent', () => {
  let component: OptionFilterComponent;
  let fixture: ComponentFixture<OptionFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionFilterComponent ],
      imports: [ AppMaterialModuleForSpec ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.availableOptions = [
      {
        enableUserField: false,
        fieldDescri: 'Test Field one',
        fieldId: 'test_2636732',
        fieldLookupConfig: null,
        lookupTargetField: 'test',
        lookupTargetText: 'test'
      },
      {
        enableUserField: false,
        fieldDescri: 'Test Field two',
        fieldId: 'test_2636733',
        fieldLookupConfig: null,
        lookupTargetField: 'test',
        lookupTargetText: 'test'
      },
   ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emitSelectedValue(), should emit the selected value', () => {
      spyOn(component.selectionChange, 'emit');
      component.emitSelectedValue({ fieldId: 'test'});
      expect(component.selectionChange.emit).toHaveBeenCalledWith('test');
  });

  it('availableOptions, should set value for allOptions', () => {
     expect(component.allOptions.length).toEqual(2);
  });

  it('initializeAutocomplete(), should initialize search filter', () => {
    component.optionCtrl = new FormControl('');
    component.value = 'test_2636733';
    component.initializeAutocomplete();
    component.filteredOptions.subscribe((res) => {
      expect(res.length).toEqual(2);
    });
    component.optionCtrl.setValue('test');
    fixture.detectChanges();
    expect(component.optionCtrl.value).toEqual('test');
  });

  it('should filter dropdown options', () => {
    expect(component._filter('').length).toEqual(2);
    expect(component._filter('no match').length).toEqual(0);
    expect(component._filter('Test Field one').length).toEqual(1);
    expect(component._filter({test: 'Test'}).length).toEqual(2);
  });

  it('formatValue, should format the value for dispolay',() => {
    expect(component.formatValue(component.allOptions[0])).toEqual('Test Field one');
  })
});
