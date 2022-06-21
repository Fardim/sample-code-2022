import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { FormInputAutoselectComponent } from './form-input-autoselect.component';

describe('FormInputAutoselectComponent', () => {
  let component: FormInputAutoselectComponent;
  let fixture: ComponentFixture<FormInputAutoselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputAutoselectComponent ],
      imports: [ AppMaterialModuleForSpec ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputAutoselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.labelKey = 'label';
    component.valueKey = 'value';

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getValue()', () => {
    const option = {
      label: 'Test Label',
      value: '12345'
    }
    component.valueKey = '';
    expect(component.getValue(option)).toEqual(option);

    component.valueKey = 'value';
    expect(component.getValue(option)).toEqual('12345');
  });

  it('getLabel()', () => {
    const option = {
      label: 'Test Label',
      value: '12345'
    }

    component.labelKey = '';
    expect(component.getLabel(option)).toBeFalsy();

    component.labelKey = 'label';
    expect(component.getLabel(option)).toEqual('Test Label');
  });

  it('getTooltipText()', () => {
    const option = {
      label: 'Test Label',
      value: '12345',
    }

    expect(component.getTooltipText(option)).toBeFalsy();

    component.tooltipKey = 'label';
    expect(component.getTooltipText(option)).toEqual('Test Label');
  });

  it('mdoFieldDisplayWith()', () => {
    const option = {
      label: 'Test Label',
      value: '12345',
    }
    component.labelKey = 'label';
    expect(component.mdoFieldDisplayWith(option)).toEqual('Test Label');
    expect(component.mdoFieldDisplayWith('')).toEqual('');
  });

  it('emitOptionSelected(), with string value', () => {
    component.viewMoreAction = 'value';
    const eventEmitterSpy = spyOn(component.openCustomDialog, 'emit');
    component.emitOptionSelected('value');
    expect(eventEmitterSpy).toHaveBeenCalled();
  });

  it('emitOptionSelected(), with object value', () => {
    component.extraOption = '';
    const eventEmitterSpy = spyOn(component.optionSelectedEmit, 'emit');
    component.emitOptionSelected({
      option: {
        value: 'extra'
      }
    });
    expect(eventEmitterSpy).toHaveBeenCalled();
  });

  it('should filter dropdown options', () => {

    component.optionList = [{
      label: 'Test Label',
      value: '12345',
    }];

    expect(component._filter('').length).toEqual(1);
    expect(component._filter('no match').length).toEqual(0);

  });

  it('convert to lower case', () => {
    expect(component.getLowerCaseLabel('Test')).toEqual('test');
  });

  it('should get trackBy field', () => {
    expect(component.suggestedMdoFldTrkBy(null)).toBeFalsy();
    expect(component.suggestedMdoFldTrkBy({value: '1701'})).toEqual('1701');
  });

  it('should emit click event', () => {
    spyOn(component.emitExtraLabelClick, 'emit');
    component.emitClickEvent();
    expect(component.emitExtraLabelClick.emit).toHaveBeenCalled();
  });


  it('update on changes', () => {

    spyOn(component, 'initFilter');

    const optionList = [{
      label: 'Test Label',
      value: '12345',
    }];

    let changes:SimpleChanges = {updatedOptionsList:{currentValue:[], previousValue: [], firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);

    changes.updatedOptionsList.currentValue = optionList;
    component.ngOnChanges(changes);
    expect(component.optionList).toEqual(optionList);
    expect(component.initFilter).toHaveBeenCalledTimes(1);

    changes = {loader:{currentValue:true, previousValue: false, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.loader).toEqual(true);

  });


});
