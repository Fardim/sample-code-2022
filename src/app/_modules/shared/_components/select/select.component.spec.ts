import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectComponent],
      imports: [ AppMaterialModuleForSpec ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.availableOptions = [
      {
        fieldDescri: 'Test Field one',
        fieldId: 'test_2636732',
      },
      {
        fieldDescri: 'Test Field two',
        fieldId: 'test_2636733',
      },
    ];
    component.labelKey = 'fieldDescri';
    component.valueKey = 'fieldId';
    component.control = new FormControl(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emitSelectedValue(), should emit the selected value', () => {
    spyOn(component.selectionChange, 'emit');
    component.emitSelectedValue({ fieldId: 'test' });
    expect(component.selectionChange.emit).toHaveBeenCalledWith('test');
  });

  it('availableOptions, should set value for allOptions', () => {
    expect(component.allOptions.length).toEqual(2);
  });

  it('ngOnInit(), should initialize search filter', () => {
    component.control = new FormControl('');
    component.value = 'test_2636733';
    component.ngOnInit()
    component.filteredOptions.subscribe((res) => {
      expect(res.length).toEqual(2);
    });
    component.control.setValue('test');
    fixture.detectChanges();
    expect(component.control.value).toEqual('test');
  });

  it('should filter dropdown options', () => {
    expect(component._filter('').length).toEqual(2);
    expect(component._filter('no match').length).toEqual(0);
    expect(component._filter('Test Field one').length).toEqual(1);
    expect(component._filter({test: 'Test'}).length).toEqual(2);
  });

  it('formatValue, should format the value for dispolay',() => {
    expect(component.formatValue(component.allOptions[0])).toEqual('Test Field one');
  });

  it('writeValue(), should change the value of the control', async () => {
    component.writeValue('test_2636733');
    expect(component.control.value).toEqual({
      fieldDescri: 'Test Field two',
      fieldId: 'test_2636733',
    });
  });

  it('should registerOnTouched', () => {
    const fn = (v) => { console.log('touched'); };
    component.registerOnTouched(fn);
    expect(component.onTouched).toEqual(fn);
  });

  it('should registerOnChange', () => {
    const fn = (v) => { console.log('changed'); };
    component.registerOnChange(fn);
    expect(component.onChange).toEqual(fn);
  });

  it('should registerOnBlur', () => {
    component.control.setValue(
      {
        fieldId: '868768',
        fieldDescri: 'Test Field'
      }
    )
    spyOn(component.afterBlur, 'emit');
    spyOn(component, 'onChange');
    component.registerOnBlur();
    expect(component.afterBlur.emit).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalled();
  });

  it('ngOnChanges(), should detect value change and update accordingly', async () => {
    const changes: SimpleChanges = {
      isRequired: {
        previousValue: null,
        currentValue: true,
        firstChange: null,
        isFirstChange: null
      },
      value: {
        previousValue: null,
        currentValue: 'test_2636733',
        firstChange: null,
        isFirstChange: null
      }
    };
    expect(component.control.value).toEqual(null)
    expect(component.isRequired).toEqual(undefined);
    component.ngOnChanges(changes);
    expect(component.isRequired).toEqual(true);
    expect(component.control.value).toEqual({
      fieldDescri: 'Test Field two',
      fieldId: 'test_2636733',
    })
  });

  it('setSelectedValue(), should set a value as selected', async () => {
    component.setSelectedValue(null);
    expect(component.control.value).toEqual(null);
    component.setSelectedValue('test_2636732');
    expect(component.control.value).toEqual({
      fieldDescri: 'Test Field one',
      fieldId: 'test_2636732',
    })
  });
});
