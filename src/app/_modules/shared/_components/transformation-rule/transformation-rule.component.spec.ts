import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FieldConfiguration, TransformationFormData } from '@models/schema/schemadetailstable';

import { TransformationRuleComponent } from './transformation-rule.component';
import { BusinessRuleType } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { FormInputComponent } from '../form-input/form-input.component';
import { SimpleChanges } from '@angular/core';

describe('TransformationRuleComponent', () => {
  let component: TransformationRuleComponent;
  let fixture: ComponentFixture<TransformationRuleComponent>;
  const dummyValue: FieldConfiguration = {
    labelKey: 'label',
    valueKey: 'val',
    list: [
      {
        label: 'Test Field',
        value: 123
      },
      {
        label: 'Test Field two',
        value: 233
      },
      {
        label: 'Test Field three',
        value: '987'
      },
    ]
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransformationRuleComponent, FormInputComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec],
      providers: [
        FormsModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatAutocompleteModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransformationRuleComponent);
    component = fixture.componentInstance;

    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializeForm(), form should be initialized and initial values should be patched', () => {
    component.initialTransformationData = {
      excludeScript: 'test_excludeScript',
      includeScript: 'test_includeScript',
      sourceFld: 'test_sourceFields',
      targetFld: 'test, test2',
      selectedTargetFields: [{
        fieldId: 'testId',
        fieldDescri: 'Test field'
      }],
      parameter: null
    }
    component.initializeForm();
    expect(component.form.controls.excludeScript.value).toEqual('test_excludeScript');
    expect(component.form.controls.includeScript.value).toEqual('test_includeScript');
    expect(component.form.controls.sourceFld.value).toEqual('test_sourceFields');
    expect(component.form.controls.targetFld.value).toEqual('test, test2');
  });

  it('updateTargetValue(), target value should update', () => {
    component.updateTargetValue(dummyValue)
    expect(component.targetFieldsObject).toEqual(dummyValue);
  });

  it('updateSourceValue(), source value should update', () => {
    component.updateSourceValue(dummyValue)
    expect(component.sourceFieldsObject).toEqual(dummyValue);
  });

  it('selectTargetField() with argument event, should add passed value to selectedTargetFields ', () => {
    component.targetFieldsObject = dummyValue;
    component.initializeForm();
    const mockEvent = {
      option: {
        value: 'newVal',
        viewValue: 'New Value'
      }
    }
    component.selectTargetField(mockEvent);
    expect(component.selectedTargetFields.length).toEqual(1);
  });

  it('selectSourceField() with argument event, should add passed value to sourceFld ', () => {
    component.sourceFieldsObject = dummyValue;
    component.initializeForm();
    const mockEvent = {
      option: {
        value: 'newVal',
        viewValue: 'New Value'
      }
    }

    component.selectSourceField(mockEvent);
    expect(component.form.controls.sourceFld.value).toEqual('');
    expect(component.selectedSourceField).not.toBeNull();
  });

  it('removeTargetField(), remove from target field array', () => {
    component.selectedTargetFields = [...dummyValue.list];
    component.initializeForm();
    component.removeTargetField(0)
    expect(component.selectedTargetFields.length).toEqual(2);
  });

  it('isTransformationRule, isTransformationLookupRule, should check selected rule and return boolean', () => {
    component.selectedRuleType = BusinessRuleType.BR_TRANSFORMATION;
    expect(component.isTransformationRule).toBeTrue();
  });

  it('displayFnTarget(), should return a display value', () => {
    component.targetFieldsObject = dummyValue;
    expect(component.displayFnTarget(dummyValue.list[0])).toEqual('Test Field');
  })

  it(`To get FormControl from fromGroup `, async(() => {
    component.initializeForm()
    const field=component.formField('excludeScript');
    expect(field).toBeDefined();
   }));

   it('should init component', () => {

    component.ngOnInit();
    expect(component.form).toBeDefined();

    spyOn(component.transformationFormOutput, 'emit');
    component.form.reset();
    expect(component.transformationFormOutput.emit).toHaveBeenCalled();

   });

   it('should patch form value', () => {

    component.sourceFieldsObject = {
      valueKey: 'value',
      labelKey: 'label',
      list: [{value: 'width'}]
    };

    component.targetFieldsObject = {
      valueKey: 'value',
      labelKey: 'label',
      list: [{value: 'length'}]
    };

    const formData = {sourceFld: 'width', targetFld: 'size,length'} as TransformationFormData;

    component.initializeForm();
    component.patchFormValues(null);

    component.patchFormValues({} as TransformationFormData);
    expect(component.selectedSourceField).toBeFalsy();

    component.patchFormValues(formData);
    expect(component.selectedSourceField).toEqual(component.sourceFieldsObject.list[0]);
    expect(component.selectedTargetFields).toEqual(component.targetFieldsObject.list);

   });

   it('should remove source field', () => {
    component.initializeForm();
    component.removeSourceField();
    expect(component.selectedSourceField).toBeNull();
   });

   it('should init target autocomplete', () => {
     component.initializeForm();
     component.initTargetAutocomplete();
     expect(component.filteredTargetFields).toBeDefined();
   });

   it('should init source autocomplete', () => {
    component.initializeForm();
    component.initSourceAutocomplete();
    expect(component.filteredSourceFields).toBeDefined();

    let filteredFields;
    component.filteredSourceFields.subscribe(fields => filteredFields = fields);
    component.sourceFieldsObject = dummyValue;
    component.form.controls.sourceFld.setValue('two');
    expect(filteredFields.length).toEqual(1);

  });

  it('should emitTransformationOutput', () => {

    spyOn(component.transformationFormOutput, 'emit');
    component.initializeForm();
    component.emitTransformationOutput();
    expect(component.transformationFormOutput.emit).toHaveBeenCalled();

  });

  it('displayFnSource(), should return a display value', () => {
    component.sourceFieldsObject = dummyValue;
    expect(component.displayFnSource(dummyValue.list[0])).toEqual('Test Field');
  })

  it('update on changes', () => {

    spyOn(component, 'updateSourceValue');
    spyOn(component, 'updateTargetValue');
    spyOn(component, 'patchFormValues');

    component.ngOnChanges({});


    const changes:SimpleChanges = {sourceFieldsObject:{currentValue:dummyValue, previousValue: null, firstChange:null, isFirstChange:null},
    targetFieldsObject:{currentValue:dummyValue, previousValue: null, firstChange:null, isFirstChange:null},
    selectedRuleType:{currentValue:'Regex', previousValue: null, firstChange:null, isFirstChange:null},
    submitted:{currentValue:true, previousValue: false, firstChange:null, isFirstChange:null}
    };
    component.ngOnChanges(changes);

    component.initializeForm();
    component.ngOnChanges(changes);

    expect(component.patchFormValues).toHaveBeenCalledTimes(3);
  });
});
