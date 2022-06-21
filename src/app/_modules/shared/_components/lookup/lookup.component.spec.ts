import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientModule } from '@angular/common/http';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LookupFields, LookupFormData } from '@models/schema/schemadetailstable';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormInputComponent } from '../form-input/form-input.component';
import { NullStateComponent } from '../null-state/null-state/null-state.component';

import { LookupRuleComponent } from './lookup.component';

describe('LookupRuleComponent', () => {
  let component: LookupRuleComponent;
  let fixture: ComponentFixture<LookupRuleComponent>;
  let schemaService: SchemaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LookupRuleComponent, FormInputComponent, NullStateComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec],
      providers: [
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        SchemaService,
        HttpClientModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupRuleComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getObjectTypes(), should call getAllObjectType', () => {
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([{ objectid: '1701', objectdesc: 'object'}]));
    component.getObjectTypes();
    expect(schemaService.getAllObjectType).toHaveBeenCalled();
    expect(component.modulesList.length).toEqual(1);
  });

  it('getObjectTypes(), should call getAllObjectType with empty resp', () => {
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([]));
    component.getObjectTypes();
    expect(component.modulesList.length).toEqual(0);
  });

  it('selectCurrentField(), should add field to selectedFields', () => {
    component.selectedFields = [];
    const fieldData = {
      option: {
        viewValue: 'Test field',
        value: '123',
      }
    }

    component.initForm();
    component.selectCurrentField(fieldData);

    component.selectCurrentField(fieldData);
    expect(component.selectedFields.length).toEqual(1);

  });

  it('clickTreeNode(), should add node to selectedFields', async(() => {
    const selectedNode = {
      parent: 'Test',
      name: 'Test',
      id: 'Test'
    }
    component.initForm();
    component.clickTreeNode(selectedNode);
    component.clickTreeNode(selectedNode);
    expect(component.selectedFields.length).toEqual(1);
  }));

  it('removeField(), should remove field', async(() => {
    const selectedNode = {
      parent: 'Test',
      name: 'Test',
      id: 'Test'
    }
    component.initForm();
    component.clickTreeNode(selectedNode);
    component.removeField(0);
    expect(component.selectedFields.length).toEqual(1);
  }));

  it('initTargetAutocomplete(), should init auto complete', async(() => {
    spyOn(component, 'getObjectTypes');
    spyOn(component, 'patchLookupData');
    component.ngOnInit();
    component.availableField.setValue('email');
    component.allGridAndHirarchyData = [
      {
        name: 'Test',
        parent: 'Test',
        children: []
      }
    ];
    component.fieldsObject.list = [];
    component.filteredFields.subscribe(res => {
      expect(res).toEqual([]);
    });
  }));

  it('setLookupConfig(), should update field to selectedFields', () => {
    component.selectedFieldsCopy = [
      {
        enableUserField: false,
        fieldDescri: 'Test field',
        fieldId: 'fdg444',
        fieldLookupConfig: {
          lookupColumn: 'Table',
          lookupColumnResult: 'Field',
          moduleId: ''
        },
        lookupTargetField: 'Target',
        lookupTargetText: ''
      }
    ];

    const data: LookupFormData = {
      lookupColumn: 'Modified Table',
      lookupColumnResult: 'Modified Field',
      moduleId: ''
    }

    component.setLookupConfig(data, 0);
    const result = component.selectedFieldsCopy[0];
    expect(result.fieldLookupConfig.lookupColumn).toEqual('Modified Table');
    expect(result.fieldLookupConfig.lookupColumnResult).toEqual('Modified Field');
  });

  it('setLookupTargetField(), should emit lookup rule data', () => {
    component.selectedFieldsCopy = [
      {
        enableUserField: false,
        fieldDescri: 'Test field',
        fieldId: 'fdg444',
        fieldLookupConfig: {
          lookupColumn: 'Table',
          lookupColumnResult: 'Field',
          moduleId: ''
        },
        lookupTargetField: 'Target',
        lookupTargetText: ''
      }
    ];

    const eventEmitterSpy = spyOn(component.lookupRuleOutput, 'emit');
    component.setLookupTargetField('Target field modified', 0);
    component.setLookupTargetField('Target field modified', 0, true);
    expect(eventEmitterSpy).toHaveBeenCalled();
  });

  it('getInputValue(), should return input value', () => {
    component.modulesList = [
     { objectid: '56798',
      objectdesc: 'Value form module'}
    ];
    const inp = {
      enableUserField: false,
      fieldDescri: 'Test field',
      fieldId: 'fdg444',
      fieldLookupConfig: {
        lookupColumn: 'Table',
        lookupColumnResult: 'Field',
        moduleId: '56798'
      },
      lookupTargetField: 'Target',
      lookupTargetText: ''
    };
    const result = component.getInputValue(inp);

    expect(result).toEqual('Value form module');

    component.modulesList[0].objectid = '12345';
    component.getInputValue(inp);

    expect(component.getInputValue(null)).toEqual('');
  });

  it('getValue(), should return ', () => {
    component.selectedFieldsCopy = [
      {
        enableUserField: false,
        fieldDescri: 'Test field',
        fieldId: 'fdg444',
        fieldLookupConfig: {
          lookupColumn: 'Table',
          lookupColumnResult: 'Field',
          moduleId: ''
        },
        lookupTargetField: 'Target',
        lookupTargetText: ''
      }
    ];
    component.getValue(0, 'test');

    expect(component.getValue(0,'')).toEqual(component.selectedFieldsCopy[0]);

    const value = component.getValue(0, 'fieldDescri');
    expect(value).toEqual('Test field');
  })

  it('getFieldLabel(), ', () => {
    component.fieldsObject.list = [
      {
        enableUserField: false,
        fieldDescri: 'Region',
        fieldId: 'fdg444',
        fieldLookupConfig: {
          lookupColumn: 'Table',
          lookupColumnResult: 'Field',
          moduleId: ''
        },
        lookupTargetField: 'Target',
        lookupTargetText: ''
      }
    ];

    expect(component.getFieldLabel({} as LookupFields)).toBeFalsy();

    let field = {
      fieldDescri: '',
      fieldId: 'fdg444',
      fieldLookupConfig: null,
      lookupTargetField: '',
      lookupTargetText: '',
      enableUserField: false
    }

    expect(component.getFieldLabel(field)).toEqual('Region');

    field.fieldId = '12345';
    component.getFieldLabel(field);

    field.fieldDescri = 'Test field';
    expect(component.getFieldLabel(field)).toEqual('Test field');

    field = {
      fieldDescri: '',
      fieldId: 'fdg444',
      fieldLookupConfig: null,
      lookupTargetField: '',
      lookupTargetText: '',
      enableUserField: false
    }

    component.fieldsObject.list = [];
    component.allGridAndHirarchyData = [
      {
        children: [
          {
            id: 'fdg444',
            parent: 'Test',
            name: 'Test'
          }
        ]
      }
    ];

    expect(component.getFieldLabel(field)).toEqual('Test/Test');
  })

  it('ngOnInit()', () => {

    spyOn(component, 'initForm');
    spyOn(component, 'getObjectTypes');
    spyOn(component, 'patchLookupData');

    component.ngOnInit();

    expect(component.initForm).toHaveBeenCalledTimes(1);
    expect(component.getObjectTypes).toHaveBeenCalledTimes(1);
    expect(component.patchLookupData).toHaveBeenCalledTimes(1);

  });

  it('should patch lookup data', () => {

    component.initialLookupData = [];

    spyOn(component, 'emitLookupRuleData');
    component.patchLookupData();
    expect(component.emitLookupRuleData).toHaveBeenCalled();

  })

  it('should get autocomplete display text', () => {
    expect(component.displayFn(null)).toEqual('');
    expect(component.displayFn({fieldDescri: 'status'})).toEqual('status');
  })

  it('should check if manual input is enabled', () => {
    expect(component.isEnabled(0)).toEqual(false);

    component.selectedFieldsCopy = [{fieldId: 'region', enableUserField: true}] as LookupFields[];
    expect(component.isEnabled(0)).toEqual(true);
  })

  it('should updateTargetValue', () => {

    const obj = {labelKey: 'desc', valueKey: 'value', list: []}
    component.updateTargetValue(obj);
    expect(component.fieldsObject).toEqual(obj);
  });

  it('should remove field after confirm', () => {
    component.selectedFields = [{fieldId: 'region', enableUserField: true}] as LookupFields[];
    component.selectedFieldsCopy = [{fieldId: 'region', enableUserField: true}] as LookupFields[];
    component.removeFieldAfterConfirm('no', 0);
    component.removeFieldAfterConfirm('yes', 0);
    expect(component.selectedFields.length).toEqual(0);
  })

  it('should update on input change', () => {
    spyOn(component, 'updateTargetValue');
    let changes: SimpleChanges = {};
    component.ngOnChanges(changes);
    changes = {fieldsObject: {currentValue: {labelKey: 'label', valueKey: 'value', list: []},
          previousValue: null, firstChange: true, isFirstChange: null}};
    component.ngOnChanges(changes);
    expect(component.updateTargetValue).toHaveBeenCalled();
  });

});
